import { LuauTemplateResultCode, LuauTemplateResult } from './wasm-types';

// Web worker for wasm execution
let worker: Worker | null = null;

// Map of pending requests
const callbacks: Map<number, { resolve: Function; reject: Function }> = new Map();
let msgId = 0;

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
 * @param env The environment to run the code in.
 */
export const luauTemplate = async (code: string, args: any, env: string, vfs?: Record<string, string>): Promise<unknown> => {
	if (typeof window === 'undefined') {
		throw new Error('luauTemplate can only be called in client-side code.');
	}

	if (!worker) {
		worker = new Worker(new URL('./wasm-webworker.ts', import.meta.url));
		worker.onmessage = (event) => {
			const { id, data } = event.data as { id: number; data: LuauTemplateResult };
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
				let errMsg: string = data.message;
				switch (data.code) {
					case LuauTemplateResultCode.ErrorGeneral:
						errMsg = `General Error: ${errMsg}`;
						break;
					case LuauTemplateResultCode.ErrorLuau:
						errMsg = `Luau Error: ${errMsg}`;
						break;
					case LuauTemplateResultCode.ErrorUnknown:
						errMsg = `Unknown Error: ${errMsg}`;
						break;
					case LuauTemplateResultCode.ErrorFatal:
						errMsg = `Fatal Error: ${errMsg}`;
				}
				cb.reject(errMsg);
			}
		};
	}

	const id = ++msgId;
	return new Promise((resolve, reject) => {
		callbacks.set(id, { resolve, reject });
		let workerInstance = worker as any as Worker;
		workerInstance.postMessage({ id, code, args, env, vfs: vfs || {} });
	});
};
