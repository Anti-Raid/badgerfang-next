import logger from './logger';

let module: any = null

const getModule = async () => {
    if (module) {
        return module;
    }

    try {
        const wasm_js = await import('@/../wasm/wasm.js');
        const wasmModule = await wasm_js.default();
        module = wasmModule;
        return module;
    } catch (error) {
        logger.error("LuauWASM", 'Error initializing WASM module:', error);
        throw error;
    }
}

const markModuleAsBroken = () => {
    if (module) {
        module = null; // Reset the module to force reinitialization
    }
}

export enum LuauTemplateResultCode {
    Success = 0,
    ErrorGeneral = 1,
    ErrorLuau = 2,
    ErrorUnknown = 3,
}

export interface LuauTemplateResultSuccess {
    code: LuauTemplateResultCode.Success;
    result: any; // The result of the Luau code execution
}

export interface LuauTemplateResultError {
    code: LuauTemplateResultCode.ErrorGeneral | LuauTemplateResultCode.ErrorLuau | LuauTemplateResultCode.ErrorUnknown;
    message: string; // Error message
}

export type LuauTemplateResult = LuauTemplateResultSuccess | LuauTemplateResultError;

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
    let argsJson = JSON.stringify(args);
    if (argsJson.includes('\0')) {
        logger.error("LuauWASM", 'Arguments contain null bytes, which are not allowed across Luau/JS boundary.');
        throw new Error('Arguments contain null bytes, which are not allowed across Luau/JS boundary');
    }

    let module = await getModule();

    let resp = "3unreachable";
    try {
        resp = module.cwrap('luau_template', 'string', ['string', 'string'])(code, argsJson)
    } catch (error) {
        markModuleAsBroken();
        logger.error("LuauWASM", 'Error executing Luau code:', error);
        throw new Error('Error executing Luau code: ' + error);
    }
    let statusCode = resp[0];
    let rest = resp.slice(1);
    switch (statusCode) {
        case '0': {
            // Success
            let resp = JSON.parse(rest);
            return {
                code: LuauTemplateResultCode.Success,
                result: resp,
            }
        }
        case '1': {
            // Error
            return {
                code: LuauTemplateResultCode.ErrorGeneral,
                message: rest,
            }
        }
        case '2': {
            // Luau error
            return {
                code: LuauTemplateResultCode.ErrorLuau,
                message: rest,
            }
        }
        default: {
            // Unknown error
            return {
                code: LuauTemplateResultCode.ErrorUnknown,
                message: rest,
            }
        }
    }
}