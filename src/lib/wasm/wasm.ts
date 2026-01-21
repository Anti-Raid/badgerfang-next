import { LuauTemplateResultCode } from './wasm-types';

// Web worker for wasm execution
let worker: Worker | null = null;

// Map of pending requests
const callbacks: Map<number, { resolve: Function; reject: Function }> = new Map();
let msgId = 0;

/**
 * Sets up a Luau VM with the given virtual file system (VFS) and returns the created vm ID.
 *
 * Note 1: this may only be called in client-side code, as it relies on the WASM module being loaded.
 *
 * Note 2: if the mlua side code panics/errors in a way that is not caught, then the WASM module will be
 * marked as broken.
 *
 * @param code The code to run
 * @param args The args, which must be serializable to JSON to call with.
 * @param env The environment to run the code in.
 */
export const setupLuauVm = async (vfs: Record<string, string>): Promise<number> => {
	return (await wasmCall({
		type: 'setup',
		vfs
	})) as Promise<number>;
};

const ctxFuncs: Map<number, Record<string, Function>> = new Map();

/**
 * Calls the WASM web worker with the given event data.
 * @param eventData The data to send to the web worker.
 */
export const luauTemplate = async (vm_id: number, ctx: Record<string, any>): Promise<any> => {
	// Strip out all functions from ctx
	let runid = Date.now() + Math.random();
	let funcs: Record<string, Function> = {};
	for (let key in ctx) {
		if (typeof ctx[key] === 'function') {
			funcs[key] = ctx[key];
			delete ctx[key];
		}
	}

	if (Object.keys(funcs).length > 0) {
		// Store functions for later use
		ctxFuncs.set(runid, funcs);
	}

	try {
		return (await wasmCall({
			type: 'luauTemplate',
			vmid: vm_id,
			runid,
			ctx,
			funcs: Object.keys(funcs)
		})) as Promise<any>;
	} finally {
		// Clean up stored functions
		if (Object.keys(funcs).length > 0) {
			ctxFuncs.delete(runid);
		}
	}
};

const wasmCall = async (eventData: any): Promise<unknown> => {
	if (typeof window === 'undefined') {
		throw new Error('wasmCall can only be called in client-side code.');
	}

	if (!worker) {
		worker = new Worker(new URL('./wasm-webworker.ts', import.meta.url));
		worker.onmessage = (event) => {
			//console.log("WASM worker sent message:", event.data);
			if (event.data && event.data.control) {
				switch (event.data.control) {
					case 'cb': {
						//console.log("WASM worker requested callback:", event.data);
						const { runid, funcName, args } = event.data;
						const funcs = ctxFuncs.get(runid);
						if (funcs && funcs[funcName]) {
							// Call the function
							//console.log("WASM worker calling function:", funcName, args);
							funcs[funcName](...args);
						}
					}
				}
				return;
			}
			const { id, data } = event.data as { id: number; data: any };
			const cb = callbacks.get(id);
			if (!cb) return;

			callbacks.delete(id);

			if (data.code === LuauTemplateResultCode.Success) {
				// Allow client side code to error
				if (data.result && typeof data.result.error === 'string') {
					cb.reject(data.result.error);
					return;
				}

				cb.resolve(data.result);
			} else {
				cb.reject(data.message);
			}
		};
	}

	const id = ++msgId;
	return new Promise((resolve, reject) => {
		callbacks.set(id, { resolve, reject });
		let workerInstance = worker as any as Worker;
		eventData.id = id;
		workerInstance.postMessage(eventData);
	});
};
