// Define runtime result codes here to avoid emitting an ES import in the worker bundle
const LuauTemplateResultCode = {
	Success: 0,
	ErrorGeneral: 1,
	ErrorLuau: 2,
	ErrorUnknown: 3,
	ErrorFatal: 4
} as const;

type LuauTemplateResult =
	| { code: typeof LuauTemplateResultCode.Success; result: any }
	| { code: typeof LuauTemplateResultCode.ErrorGeneral | typeof LuauTemplateResultCode.ErrorLuau | typeof LuauTemplateResultCode.ErrorUnknown | typeof LuauTemplateResultCode.ErrorFatal; message: string };

// Declare importScripts for web worker
declare function importScripts(...urls: string[]): void;

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
	cwrapped: (code: string, args: string, env: string, vfs: string) => number;
}

let wasmInstance: Module | null = null;

const getModule = async () => {
	if (wasmInstance) {
		return wasmInstance;
	}

	try {
			// In web worker context, the runtime may be published as an ES module (using
			// import.meta) or as a classic script. importScripts() cannot load modules,
			// so prefer dynamic import for ESM builds and fall back to importScripts().
			const scriptUrl = new URL('/wasm/wasm.js', (self as any).location.origin).toString();
			let esModule: any | undefined;
			try {
				// Try to dynamically import as an ES module first. This handles builds that
				// use `import.meta` and other ESM-only features.
				esModule = await import(/* webpackIgnore: true */ scriptUrl);
			} catch (eImport) {
				try {
					// If dynamic import fails (e.g. environment doesn't allow it), fall back
					// to importScripts which works for legacy/classic builds.
					importScripts(scriptUrl);
				} catch (eImportScripts) {
					// Final fallback to the raw path in case URL construction failed earlier.
					importScripts('/wasm/wasm.js');
				}
			}

		// The script/module should expose a `Module`. Different build outputs expose
		// it in different ways (direct exports, default export, or global). Prefer
		// the module export from dynamic import if available.
		const GlobalModule = esModule ?? (globalThis as any).Module;

		let wasmModule: WasmExports | undefined;

		if (typeof GlobalModule === 'function') {
			// Module is a factory function
			wasmModule = (await GlobalModule()) as WasmExports;
		} else if (GlobalModule && typeof GlobalModule.default === 'function') {
			// Module.default is a function that returns the initialized module
			wasmModule = (await GlobalModule.default()) as WasmExports;
		} else if (GlobalModule && GlobalModule.cwrap) {
			// Module is already initialized
			wasmModule = GlobalModule as WasmExports;
		} else if (GlobalModule && GlobalModule.module && GlobalModule.module.cwrap) {
			wasmModule = GlobalModule.module as WasmExports;
		}

		if (!wasmModule) {
			throw new Error('Failed to initialize WASM module (no exports found)');
		}

		wasmInstance = {
			module: wasmModule,
			cwrapped: wasmModule.cwrap('luau_template', 'number', [
				'string',
				'string',
				'string',
				'string'
			])
		};
		return wasmInstance;
	} catch (error) {
		throw error;
	}
};

const markModuleAsBroken = () => {
	if (wasmInstance) {
		wasmInstance = null; // Reset the module to force reinitialization
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
const luauTemplate = async (
	code: string,
	args: any,
	env: string,
	vfs: Record<string, string>
): Promise<LuauTemplateResult> => {
	let argsJson = JSON.stringify(args);
	let vfsJson = JSON.stringify(vfs);

	let { module: wasmModule, cwrapped } = await getModule();

	let resp = '3unreachable';
	let sp = wasmModule.stackSave(); // Save the stack pointer before calling the function
	let valuePtr: number | null = null;
	try {
		valuePtr = cwrapped(code, argsJson, env, vfsJson);
	resp = wasmModule.UTF8ToString(valuePtr);
	} catch (error) {
	wasmModule.stackRestore(sp); // Restore the stack pointer to prevent memory leaks
		markModuleAsBroken();
		throw new Error('Error executing Luau code: ' + error);
	} finally {
		if (valuePtr !== null) {
			wasmModule._free(valuePtr); // Free the memory allocated by the cwrapped function
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
	const { id, code, args, env, vfs } = event.data;

	// Validate presence of required fields. Allow empty objects/arrays but reject undefined values.
	if (code === undefined || args === undefined || id === undefined || env === undefined || vfs === undefined) {
		self.postMessage({
			id,
			data: { code: LuauTemplateResultCode.ErrorGeneral, message: 'Code and args are required' }
		});
		return;
	}

	try {
		const result = await luauTemplate(code, args, env, vfs);
		self.postMessage({ id, data: result });
	} catch (error) {
		self.postMessage({
			id,
			data: {
				code: LuauTemplateResultCode.ErrorFatal,
				message: error?.toString() || 'Unknown error'
			}
		});
	}
};

// Notify the main thread that the worker is ready
console.log('WASM worker initialized');
self.postMessage('ready');
