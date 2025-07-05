import { LuauTemplateResultCode, LuauTemplateResult } from './wasm-types';

// Web worker for wasm execution
let worker: Worker | null = null;

// Map of pending requests
const callbacks: Map<number, { resolve: Function, reject: Function }> = new Map();
let msgId = 0

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
export const luauTemplate = async (code: string, args: any): Promise<LuauTemplateResult> => {
    if (typeof window !== 'undefined' && !worker) {
        worker = new Worker(new URL('./wasm-webworker.ts', import.meta.url));
        worker.onmessage = (event) => {
            const { id, data } = event.data as { id: number, data: LuauTemplateResult };
            const cb = callbacks.get(id);
            if (!cb) return;

            callbacks.delete(id);

            if (data.code === LuauTemplateResultCode.Success) {
                cb.resolve(data);
            } else {
                cb.reject(data);
            }
        }

        let workerInstance = worker as any as Worker;

        // wait for the worker to be ready
        await new Promise<void>((resolve) => {
            workerInstance.onmessage = (event) => {
                console.log('Worker message:', event.data);
                if (event.data === 'ready') {
                    resolve();
                }
            };
        })
    }

    const id = ++msgId;
    return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        let workerInstance = worker as any as Worker;
        workerInstance.postMessage({ id, code, args });
    });
}