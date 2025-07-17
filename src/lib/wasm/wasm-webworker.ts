import { LuauTemplateResultCode, LuauTemplateResult } from './wasm-types';

// Web worker for wasm execution
interface WasmExports {
	cwrap: (
		fn: string,
		returnType: string,
		argTypes: string[]
	) => (code: string, args: string) => number;
	stackSave: () => number;
	stackRestore: (ptr: number) => void;
	_free: (ptr: number) => void;
	UTF8ToString: (ptr: number) => string;
}

interface Module {
	module: WasmExports; // The WASM module

	// The cwrapped function for executing Luau code
	//
	// We need to explicitly free the memory allocated by this function, so it returns a number.
	// which we can then free using the `_free` function.
	cwrapped: (code: string, args: string, env: string) => number;
}

let module: Module | null = null;

const getModule = async () => {
	if (module) {
		return module;
	}

	try {
		const wasm_js = await import(
			/* webpackIgnore: true */
			'/wasm/wasm.js' as string
		);
		const wasmModule = (await wasm_js.default()) as WasmExports;
		module = {
			module: wasmModule,
			cwrapped: wasmModule.cwrap('luau_template', 'number', ['string', 'string', 'string'])
		};
		return module;
	} catch (error) {
		throw error;
	}
};

const markModuleAsBroken = () => {
	if (module) {
		module = null; // Reset the module to force reinitialization
	}
};

/**
 * Evaluates Luau code using the WASM module.
 *
 * Note that all arguments passed to this function must be serializable to JSON.
 * This means that functions, classes, and other non-serializable types will not work.
 *
 * Note 1: this may only be called in client-side code, as it relies on the WASM module being loaded.
 *
 * Note 2: if the mlua side code panics/errors in a way that is not caught, then the WASM module will be
 * marked as broken.
 *
 * @param code The code to run
 * @param args The args, which must be serializable to JSON to call with.
 */
const luauTemplate = async (code: string, args: any, env: string): Promise<LuauTemplateResult> => {
	let argsJson = JSON.stringify(args);
	if (argsJson.includes('\0')) {
		throw new Error('Arguments contain null bytes, which are not allowed across Luau/JS boundary');
	}

	let { module, cwrapped } = await getModule();

	let resp = '3unreachable';
	let sp = module.stackSave(); // Save the stack pointer before calling the function
	let valuePtr: number | null = null;
	try {
		valuePtr = cwrapped(code, argsJson, env);
		resp = module.UTF8ToString(valuePtr);
	} catch (error) {
		module.stackRestore(sp); // Restore the stack pointer to prevent memory leaks
		markModuleAsBroken();
		throw new Error('Error executing Luau code: ' + error);
	} finally {
		if (valuePtr !== null) {
			module._free(valuePtr); // Free the memory allocated by the cwrapped function
		}
	}

	let statusCode = resp[0];
	let rest = resp.slice(1);
	switch (statusCode) {
		case '0': {
			// Success
			let resp = JSON.parse(rest);
			return {
				code: LuauTemplateResultCode.Success,
				result: resp
			};
		}
		case '1': {
			// Error
			return {
				code: LuauTemplateResultCode.ErrorGeneral,
				message: rest
			};
		}
		case '2': {
			// Luau error
			return {
				code: LuauTemplateResultCode.ErrorLuau,
				message: rest
			};
		}
		default: {
			// Unknown error
			return {
				code: LuauTemplateResultCode.ErrorUnknown,
				message: rest
			};
		}
	}
};

// onmessage event handler for the web worker
self.onmessage = async (event) => {
	const { id, code, args, env } = event.data;

	if (!code || !args || !id || !env) {
		self.postMessage({
			id,
			data: { code: LuauTemplateResultCode.ErrorGeneral, message: 'Code and args are required' }
		});
		return;
	}

	try {
		const result = await luauTemplate(code, args, env);
		self.postMessage({ id, data: result });
	} catch (error) {
		self.postMessage({
			id,
			data: {
				status: LuauTemplateResultCode.ErrorFatal,
				message: error?.toString() || 'Unknown error'
			}
		});
	}
};

// Notify the main thread that the worker is ready
console.log('WASM worker initialized');
self.postMessage('ready');
