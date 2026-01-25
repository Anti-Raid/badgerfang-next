// Declare importScripts for legacy support if needed, though we prefer dynamic import
declare function importScripts(...urls: string[]): void;

// Local copy of result codes to avoid ES import issues in some worker environments
const LuauTemplateResultCode = {
	Success: 0,
	ErrorGeneral: 1,
	ErrorLuau: 2,
	ErrorUnknown: 3,
	ErrorFatal: 4
} as const;

interface WasmExports {
	cwrap: (fn: string, returnType: string, argTypes: string[]) => (...args: any) => any;
	stackSave: () => number;
	stackRestore: (ptr: number) => void;
	_free: (ptr: number) => void;
	UTF8ToString: (ptr: number) => string;
	Emval: {
		toHandle: (val: any) => number;
		toValue: (handle: number) => any;
	};
}

interface ModuleInstance {
	module: WasmExports;
	setupLuauVm: (vfs: string) => number;
	dropLuauVm: (vm_id: number) => number;
	luauTemplateV2: (vm_id: number, ctxHandle: number) => number;
	freeJsHandle: (handle: number) => void;
}

let wasmInstance: ModuleInstance | null = null;
let initializationPromise: Promise<ModuleInstance> | null = null;

const getModule = async (): Promise<ModuleInstance> => {
	if (wasmInstance) return wasmInstance;
	if (initializationPromise) return initializationPromise;

	initializationPromise = (async () => {
		try {
			const scriptUrl = new URL('/wasm/wasm.js', (self as any).location.origin).toString();
			let GlobalModule: any;

			try {
				// Try dynamic import for ESM builds
				const esModule = await import(/* @vite-ignore */ scriptUrl);
				GlobalModule = esModule.default || esModule.Module || (globalThis as any).Module;
			} catch (e) {
				console.warn('Dynamic import failed, falling back to importScripts:', e);
				try {
					importScripts(scriptUrl);
				} catch (e2) {
					importScripts('/wasm/wasm.js');
				}
				GlobalModule = (globalThis as any).Module;
			}

			if (!GlobalModule) {
				throw new Error('WASM Module factory not found');
			}

			let wasmModule: WasmExports;
			if (typeof GlobalModule === 'function') {
				wasmModule = (await GlobalModule()) as WasmExports;
			} else if (GlobalModule.default && typeof GlobalModule.default === 'function') {
				wasmModule = (await GlobalModule.default()) as WasmExports;
			} else {
				wasmModule = GlobalModule as WasmExports;
			}

			if (!wasmModule || !wasmModule.cwrap) {
				throw new Error('Failed to initialize WASM module (cwrap not found)');
			}

			wasmInstance = {
				module: wasmModule,
				setupLuauVm: wasmModule.cwrap('setup_luau_vm', 'number', ['string']),
				dropLuauVm: wasmModule.cwrap('drop_luau_vm', 'number', ['number']),
				luauTemplateV2: wasmModule.cwrap('luau_template_v2', 'number', ['number', 'number']),
				freeJsHandle: wasmModule.cwrap('free_js_handle', 'void', ['number'])
			};

			return wasmInstance;
		} catch (error) {
			initializationPromise = null;
			throw error;
		}
	})();

	return initializationPromise;
};

/**
 * Executes a Luau template using a specific VM ID.
 */
const executeLuauV2 = async (vmid: number, ctx: any): Promise<any> => {
	const { module, luauTemplateV2, freeJsHandle } = await getModule();
	
	const ctxHandle = module.Emval.toHandle(ctx);
	let resultHandle: number | null = null;

	try {
		const sp = module.stackSave();
		try {
			resultHandle = luauTemplateV2(vmid, ctxHandle);
			const response = module.Emval.toValue(resultHandle);
			
			if (response && response.error) {
				throw new Error(response.error);
			}

			// Unwrap and parse JSON if present
			if (response && typeof response.returnJson === 'string') {
				try {
					return JSON.parse(response.returnJson);
				} catch (e) {
					return response.returnJson;
				}
			}

			return response;
		} finally {
			module.stackRestore(sp);
		}
	} finally {
		if (resultHandle !== null) {
			freeJsHandle(resultHandle);
		}
	}
};

/**
 * Single-shot Luau execution (V1 API style).
 * It creates a temporary VM, runs the code, and drops the VM.
 */
const executeLuauV1 = async (code: string, args: any, env: string, vfs: Record<string, string>): Promise<any> => {
	const { module, setupLuauVm, dropLuauVm, freeJsHandle } = await getModule();
	
	// Ensure the code is in the VFS
	const fullVfs = { ...vfs, 'client.luau': code };
	const setupHandle = setupLuauVm(JSON.stringify(fullVfs));
	const setupResult = module.Emval.toValue(setupHandle);
	freeJsHandle(setupHandle);

	if (setupResult.error) {
		throw new Error(setupResult.error);
	}

	const vmid = setupResult.vm_id;
	
	try {
		return await executeLuauV2(vmid, { ...args, env });
	} finally {
		const dropHandle = dropLuauVm(vmid);
		freeJsHandle(dropHandle);
	}
};

self.onmessage = async (event) => {
	const { id, type, code, args, env, vfs, vmid, ctx, runid, funcs } = event.data;

	if (id === undefined) return;

	try {
		let result: any;

		if (type === 'setup') {
			const { module, setupLuauVm, freeJsHandle } = await getModule();
			const handle = setupLuauVm(JSON.stringify(vfs || {}));
			const setupResult = module.Emval.toValue(handle);
			freeJsHandle(handle);
			if (setupResult.error) throw new Error(setupResult.error);
			result = setupResult.vm_id;
		} else if (type === 'luauTemplateV2' || (vmid !== undefined && ctx !== undefined)) {
			// Restore functions into ctx for callbacks
			if (funcs && Array.isArray(funcs)) {
				for (const funcName of funcs) {
					ctx[funcName] = (...args: any[]) => {
						self.postMessage({ control: 'cb', runid, funcName, args });
						return {}; // Return values not supported yet
					};
				}
			}
			result = await executeLuauV2(vmid, ctx);
		} else if (type === 'dropLuauVm') {
			const { module, dropLuauVm: dropVm, freeJsHandle } = await getModule();
			const handle = dropVm(vmid);
			const dropResult = module.Emval.toValue(handle);
			freeJsHandle(handle);
			if (dropResult.error) throw new Error(dropResult.error);
			result = true;
		} else if (code !== undefined) {
			// Legacy V1 style call
			result = await executeLuauV1(code, args, env, vfs || {});
		} else {
			throw new Error('Unknown request type');
		}

		self.postMessage({
			id,
			data: { code: LuauTemplateResultCode.Success, result }
		});
	} catch (error: any) {
		console.error('WASM Worker Error:', error);
		self.postMessage({
			id,
			data: {
				code: LuauTemplateResultCode.ErrorGeneral,
				message: error?.message || error?.toString() || 'Unknown error'
			}
		});
	}
};

console.log('WASM worker initialized');
self.postMessage('ready');
