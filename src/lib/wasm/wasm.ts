import { LuauTemplateResultCode, LuauTemplateResult } from './wasm-types';

// Web worker for wasm execution
let worker: Worker | null = null;

// Map of pending requests. Each entry also stores a timeout id so requests don't hang forever.
const callbacks: Map<number, { resolve: Function; reject: Function; timeoutId?: number }> = new Map();
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
export const luauTemplate = async (
	code: string,
	args: any,
	env: string,
	vfs?: Record<string, string>
): Promise<unknown> => {
	if (typeof window === 'undefined') {
		throw new Error('luauTemplate can only be called in client-side code.');
	}

	if (!worker) {
		worker = new Worker(new URL('./wasm-webworker.ts', import.meta.url));
		worker.onmessage = (event) => {
			const { id, data } = event.data as { id: number; data: LuauTemplateResult };
			const cb = callbacks.get(id);
			if (!cb) return;

			// Clear timeout associated with this request
			if (cb.timeoutId !== undefined) {
				clearTimeout(cb.timeoutId as any);
			}

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

		// If the worker encounters an error, reject all pending requests and reset the worker
		worker.onerror = (err) => {
			const errMsg = err?.message || 'WASM worker error';
			callbacks.forEach((cb, id) => {
				if (cb.timeoutId !== undefined) clearTimeout(cb.timeoutId as any);
				cb.reject(new Error(`WASM worker error: ${errMsg}`));
			});
			callbacks.clear();
			worker = null;
		};

		worker.onmessageerror = (err) => {
			const errMsg = 'WASM worker message error';
			callbacks.forEach((cb, id) => {
				if (cb.timeoutId !== undefined) clearTimeout(cb.timeoutId as any);
				cb.reject(new Error(errMsg));
			});
			callbacks.clear();
			worker = null;
		};
	}

	const id = ++msgId;
	return new Promise((resolve, reject) => {
		// Timeout to ensure promises don't hang forever if the worker dies or fails to reply
		const timeoutMs = 10000; // 10s
		const timeoutId = window.setTimeout(() => {
			callbacks.delete(id);
			reject(new Error('WASM worker response timed out'));
		}, timeoutMs);

		callbacks.set(id, { resolve, reject, timeoutId });
		let workerInstance = worker as any as Worker;
		workerInstance.postMessage({ id, code, args, env, vfs: vfs || {} });
	});
};
