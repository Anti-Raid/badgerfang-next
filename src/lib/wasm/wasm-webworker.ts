import { LuauTemplateResultCode } from './wasm-types';

// Web worker for wasm execution
interface WasmExports {
	cwrap: (
		fn: string,
		returnType: string,
		argTypes: string[]
	) => (...args: any) => number;
	stackSave: () => number;
	stackRestore: (ptr: number) => void;
	_free: (ptr: number) => void;
	UTF8ToString: (ptr: number) => string;
	Emval: {
		toHandle: (val: any) => number;
		toValue: (handle: number) => any;
	}
}

interface Module {
	module: WasmExports; // The WASM module

	// The cwrapped function for setting up the luau vm
	setupLuauVm: (vfs: string) => number;

	// The cwrapped function for dropping a luau vm
	dropLuauVm: (vm_id: number) => number;

	// The cwrapped function for executing luau code
	luauTemplateV2: (
		vm_id: number,
		ctx: any,
	) => number;

	// free_js_handle: (internal API to free emval handles)
	_freeJsHandle: (handle: number) => void;
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
			setupLuauVm: wasmModule.cwrap('setup_luau_vm', 'number', [
				'string',
			]),
			dropLuauVm: wasmModule.cwrap('drop_luau_vm', 'number', [
				'number',
			]),
			luauTemplateV2: wasmModule.cwrap('luau_template_v2', 'number', [
				'number',
				'number',
			]),
			_freeJsHandle: wasmModule.cwrap('free_js_handle', 'void', [
				'number',
			]),
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
 * Note 1: this may only be called in client-side code, as it relies on the WASM module being loaded.
 *
 * Note 2: if the mlua side code panics/errors in a way that is not caught, then the WASM module will be
 * marked as broken.
 *
 * @param code The code to run
 * @param args The args, which must be serializable to JSON to call with.
 */
const luauTemplate = async (
	vm_id: number,
	ctx: any,
): Promise<any> => {
	let { module, luauTemplateV2, _freeJsHandle } = await getModule();

	const ctxHandle = module.Emval.toHandle(ctx); // auto-transferred first thing in wasm side
	let resultHandle: number | null = null
	try {
		resultHandle = luauTemplateV2(vm_id, ctxHandle);
		const responseObj = module.Emval.toValue(resultHandle);
		if(responseObj.error) {
			throw new Error(responseObj.error);
		}
		return responseObj;
	} catch (error) {
		//markModuleAsBroken(); Note that we do not mark as broken here, as luauTemplate errors may be recoverable
		throw new Error('Error executing Luau code: ' + error);
	} finally {
		if (resultHandle !== null) {
			_freeJsHandle(resultHandle);
		}
	}
};

/**
 * Sets up a Luau VM with the given VFS and returns the created vm id.
 * @param vfs The virtual file system to use.
 */
const setupLuauVm = async (
	vfs: Record<string, string>
): Promise<number> => {
	let vfsJson = JSON.stringify(vfs);

	let { module, setupLuauVm, _freeJsHandle } = await getModule();

	let sp = module.stackSave(); // Save the stack pointer before calling the function
	let respHandle = null
	try {
		let handleId = setupLuauVm(vfsJson);
		const respHandle = module.Emval.toValue(handleId);
		if(respHandle.error) {
			throw new Error(respHandle.error);
		}
		return respHandle.vm_id;

	} catch (error) {
		module.stackRestore(sp); // Restore the stack pointer to prevent memory leaks
		markModuleAsBroken();
		throw error
	} finally {
		if (respHandle !== null) {
			_freeJsHandle(respHandle); // Free the emval handle to prevent memory leaks
		}
	}
};

/**
 * Evaluates Luau code using the WASM module.
 *
 * Note 1: this may only be called in client-side code, as it relies on the WASM module being loaded.
 *
 * Note 2: if the mlua side code panics/errors in a way that is not caught, then the WASM module will be
 * marked as broken.
 *
 * @param code The code to run
 * @param args The args, which must be serializable to JSON to call with.
 */
const dropLuauVm = async (
	vm_id: number,
): Promise<any> => {
	let { module, dropLuauVm, _freeJsHandle } = await getModule();

	let resultHandle: number | null = null
	try {
		resultHandle = dropLuauVm(vm_id);
		const responseObj = module.Emval.toValue(resultHandle);
		if(responseObj.error) {
			throw new Error(responseObj.error);
		}
		return responseObj;
	} catch (error) {
		markModuleAsBroken();
		throw new Error('Error dropping Luau VM: ' + error);
	} finally {
		if (resultHandle !== null) {
			_freeJsHandle(resultHandle);
		}
	}
};

const callCode = async (event: MessageEvent<any>): Promise<unknown> => {
	console.log("WASM worker received message:", event.data);
	switch (event.data.type) {
		case 'setup': {
			const { id, vfs } = event.data;
			if (!vfs || !id) {
				return {
					id,
					data: { code: LuauTemplateResultCode.Error, message: 'VFS is required' }
				}
			}
			
			try {
				const vm_id = await setupLuauVm(vfs);
				return {
					id,
					data: { code: LuauTemplateResultCode.Success, result: vm_id }
				}
			} catch (error) {
				return {
					id,
					data: {
						status: LuauTemplateResultCode.Error,
						message: error?.toString() || 'Unknown error'
					}
				};
			}
			return;
		}
	case 'luauTemplate':
		const { id, vmid, runid, ctx, funcs } = event.data;

		// Restore functions into ctx
		//
		// Note on return value support, the following may be needed:
		/*
            return Asyncify.handleSleep((wakeUp: (result: any) => void) => {
                const callId = nextCallId++;
                pendingCallbacks.set(callId, wakeUp);
                self.postMessage({
                    control: "cb",
                    runid: runid, 
                    callId: callId, // Send callId so Main knows who to reply to
                    funcName: funcName,
                    args: args
                });
            });
		*/
		if (funcs && funcs.length > 0) {
			for(let funcName of funcs) {
				//console.log("Restoring function in WASM worker:", funcName);
				ctx[funcName] = (...args: any) => {
					//console.log("Calling function from WASM worker:", funcName, args);
					self.postMessage({control: "cb", runid, funcName, args});
					return {} // todo: return value support
				}
			}
		}

		//console.log("WASM worker luauTemplate call with vmid:", vmid, "ctx:", ctx, "funcs:", funcs);

		if (vmid === undefined || !ctx || !id) {
			return {
				id,
				data: { code: LuauTemplateResultCode.Error, message: 'VM ID and context are required' }
			};
		}

		try {
			const result = await luauTemplate(vmid, ctx);
			return {
				id,
				data: { code: LuauTemplateResultCode.Success, result }
			}
		} catch (error) {
			console.log((error as Error).stack);
			return {
				id,
				data: {
					status: LuauTemplateResultCode.Error,
					message: error?.toString() || 'Unknown error'
				}
			}
		}
		return;
	case 'dropLuauVm':
		const { id: dropId, vmid: dropVmid } = event.data;
		if (dropVmid === undefined || !dropId) {
			return {
				id: dropId,
				data: { code: LuauTemplateResultCode.Error, message: 'VM ID is required' }
			}
		}

		try {
			const result = await dropLuauVm(dropVmid);
			return {
				id: dropId,
				data: { 
					code: LuauTemplateResultCode.Success,
					result
				}
			}
		} catch (error) {
			return {
				id: dropId,
				data: {
					status: LuauTemplateResultCode.Error,
					message: error?.toString() || 'Unknown error'
				}
			}
		}
		return;
	default:
		return {
			id: event.data.id,
			data: { code: LuauTemplateResultCode.Error, message: 'Unknown command type'	}
		}
	}
}

// onmessage event handler for the web worker
self.onmessage = async (event) => {
	console.log("WASM worker received message:", event.data);
	let resp = await callCode(event);
	self.postMessage(resp);
};

// Notify the main thread that the worker is ready
console.log('WASM worker initialized');
self.postMessage('ready');
