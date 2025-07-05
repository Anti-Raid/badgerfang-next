export enum LuauTemplateResultCode {
    Success = 0,
    ErrorGeneral = 1,
    ErrorLuau = 2,
    ErrorUnknown = 3,
    ErrorFatal = 4, // Fatal error, module is possible broken
}

export interface LuauTemplateResultSuccess {
    code: LuauTemplateResultCode.Success;
    result: any; // The result of the Luau code execution
}

export interface LuauTemplateResultError {
    code: LuauTemplateResultCode.ErrorGeneral | LuauTemplateResultCode.ErrorLuau | LuauTemplateResultCode.ErrorUnknown | LuauTemplateResultCode.ErrorFatal;
    message: string; // Error message
}

export type LuauTemplateResult = LuauTemplateResultSuccess | LuauTemplateResultError;
