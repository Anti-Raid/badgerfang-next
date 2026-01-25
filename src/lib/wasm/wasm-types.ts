export enum LuauTemplateResultCode {
	Success = 0,
	ErrorGeneral = 1,
	ErrorLuau = 2,
	ErrorUnknown = 3,
	ErrorFatal = 4
}

export type LuauTemplateResult =
	| { code: LuauTemplateResultCode.Success; result: any }
	| { 
		code: LuauTemplateResultCode.ErrorGeneral | LuauTemplateResultCode.ErrorLuau | LuauTemplateResultCode.ErrorUnknown | LuauTemplateResultCode.ErrorFatal; 
		message: string 
	};
