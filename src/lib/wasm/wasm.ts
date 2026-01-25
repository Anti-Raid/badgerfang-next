import { LuauTemplateResultCode, LuauTemplateResult } from './wasm-types';

// Web worker for wasm execution
let worker: Worker | null = null;

// Map of pending requests
const callbacks: Map<number, { resolve: Function; reject: Function; timeoutId?: number }> = new Map();
let msgId = 0;

// Store for functions passed in the context for callbacks
const ctxFuncs: Map<number, Record<string, Function>> = new Map();

/**
 * Calls the WASM web worker.
 */
const wasmCall = async (eventData: any): Promise<any> => {
	if (typeof window === 'undefined') {
		throw new Error('wasmCall can only be called in client-side code.');
	}

	if (!worker) {
		worker = new Worker(new URL('./wasm-webworker.ts', import.meta.url));
		worker.onmessage = (event) => {
			if (event.data && event.data.control === 'cb') {
				const { runid, funcName, args } = event.data;
				const funcs = ctxFuncs.get(runid);
				if (funcs && funcs[funcName]) {
					funcs[funcName](...args);
				}
				return;
			}

			if (event.data === 'ready') return;

			const { id, data } = event.data as { id: number; data: LuauTemplateResult };
			const cb = callbacks.get(id);
			if (!cb) return;

			if (cb.timeoutId !== undefined) {
				clearTimeout(cb.timeoutId);
			}

			callbacks.delete(id);

			if (data.code === LuauTemplateResultCode.Success) {
				// Special case: if the result contains an error string, reject it
				if (data.result && typeof data.result.error === 'string') {
					cb.reject(new Error(data.result.error));
				} else {
					cb.resolve(data.result);
				}
			} else {
				cb.reject(new Error(data.message || 'Unknown WASM error'));
			}
		};

		worker.onerror = (err) => {
			const errMsg = err?.message || 'WASM worker error';
			callbacks.forEach((cb) => {
				if (cb.timeoutId !== undefined) clearTimeout(cb.timeoutId);
				cb.reject(new Error(`WASM worker error: ${errMsg}`));
			});
			callbacks.clear();
			worker = null;
		};
	}

	const id = ++msgId;
	return new Promise((resolve, reject) => {
		const timeoutMs = 30000; // 30s for complex Luau scripts
		const timeoutId = window.setTimeout(() => {
			callbacks.delete(id);
			reject(new Error('WASM worker response timed out'));
		}, timeoutMs);

		callbacks.set(id, { resolve, reject, timeoutId });
		eventData.id = id;
		worker!.postMessage(eventData);
	});
};

/**
 * Evaluates Luau code. Supports both V1 (stateless) and V2 (persistent VM) APIs.
 */
export async function luauTemplate(
	code: string,
	args: any,
	env: string,
	vfs?: Record<string, string>
): Promise<any>;
export async function luauTemplate(
	vmid: number,
	ctx: Record<string, any>
): Promise<any>;
export async function luauTemplate(arg1: any, arg2: any, arg3?: any, arg4?: any): Promise<any> {
	if (typeof arg1 === 'string') {
		// V1 API: code, args, env, vfs
		return wasmCall({
			code: arg1,
			args: arg2,
			env: arg3,
			vfs: arg4 || {}
		});
	} else {
		// V2 API: vmid, ctx
		const vmid = arg1;
		const ctx = arg2;
		
		// Handle functions in context for callbacks
		const runid = Date.now() + Math.random();
		const funcs: Record<string, Function> = {};
		const serializableCtx: Record<string, any> = { ...ctx };
		
		for (const key in serializableCtx) {
			if (typeof serializableCtx[key] === 'function') {
				funcs[key] = serializableCtx[key];
				delete serializableCtx[key];
			}
		}

		if (Object.keys(funcs).length > 0) {
			ctxFuncs.set(runid, funcs);
		}

		try {
			return await wasmCall({
				type: 'luauTemplateV2',
				vmid,
				runid,
				ctx: serializableCtx,
				funcs: Object.keys(funcs)
			});
		} finally {
			if (Object.keys(funcs).length > 0) {
				ctxFuncs.delete(runid);
			}
		}
	}
}

/**
 * Sets up a persistent Luau VM.
 */
export const setupLuauVm = async (vfs: Record<string, string>): Promise<number> => {
	return (await wasmCall({
		type: 'setup',
		vfs
	})) as number;
};

/**
 * Drops a persistent Luau VM.
 */
export const dropLuauVm = async (vmid: number): Promise<void> => {
	await wasmCall({
		type: 'dropLuauVm',
		vmid
	});
};
