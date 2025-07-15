/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum ITypedInputEnum {
	String = 'IString',
	Number = 'INumber',
	Table = 'ITable',
	Boolean = 'IBoolean',
	Raw = 'IRaw'
}

export interface ITypedInputString {
	type: ITypedInputEnum.String;
	value: string;
}

export interface ITypedInputNumber {
	type: ITypedInputEnum.Number;
	value: number;
}

export interface ITypedInputTable {
	type: ITypedInputEnum.Table;
	value: Record<string, unknown>;
}

export interface ITypedInputBoolean {
	type: ITypedInputEnum.Boolean;
	value: boolean;
}

export interface ITypedInputRaw {
	type: ITypedInputEnum.Raw;
	value: string; // Raw code or expression
}

export type ITypedInput =
	| ITypedInputString
	| ITypedInputNumber
	| ITypedInputTable
	| ITypedInputBoolean
	| ITypedInputRaw;

export enum IForLoopTypeEnum {
	GeneralizedIteration = 'IGeneralizedIteration',
	Range = 'IRange',
	Raw = 'IRaw'
}

/**
 * Luau generalized for loop (for varbinds in iterable do ... end)
 */
export interface IForLoopGeneralizedIteration {
	type: IForLoopTypeEnum.GeneralizedIteration;
	varbinds: string[];
	iterable: ITypedInput;
}

/**
 * Luau numeric for loop (for i = start, end [, step] do ... end)
 */
export interface IForLoopRange {
	type: IForLoopTypeEnum.Range;
	varbind: string;
	start: number;
	end: number;
	step?: number; // Optional step value
}

export interface IForLoopRaw {
	type: IForLoopTypeEnum.Raw;
	condition: string; // Raw condition for the loop
}

export type IForLoopType = IForLoopGeneralizedIteration | IForLoopRange | IForLoopRaw;

export enum IConditionalLogicTypeEnum {
    IfEq = 'IIfEq',
    IfNeq = 'IIfNeq',
    IfGt = 'IIfGt',
    IfGte = 'IIfGte',
    IfLt = 'IIfLt',
    IfLte = 'IIfLte',
}

export interface IConditionalLogicType {
    type: IConditionalLogicTypeEnum;
    left: ITypedInput;
    right: ITypedInput;
}

export enum IConditionalTypeEnum {
    LogicExpr = 'ILogicExpr',
    ParensBlock = 'IParensBlock',
    Raw = 'IRaw',
	Literal = 'ILiteral',
}

export enum IConditionalTypeContinuableEnum {
    And = 'IAnd',
    Or = 'IOr'
}

export interface IConditionalTypeContinuable {
    op: IConditionalTypeContinuableEnum;
    condition: IConditionalType; // The next condition in the chain
}

export interface IConditionalTypeLogic {
    type: IConditionalTypeEnum.LogicExpr;
    condition: IConditionalLogicType; // The logic condition (e.g., IfEq, IfGt)
    next?: IConditionalTypeContinuable; // Optional next condition in the chain
}

export interface IConditionalTypeParensBlock {
    type: IConditionalTypeEnum.ParensBlock;
    condition: IConditionalType; // The condition inside the parentheses
    next?: IConditionalTypeContinuable; // Optional next condition in the chain
}

export interface IConditionalTypeRaw {
    type: IConditionalTypeEnum.Raw;
    condition: string; // Raw condition for the if statement
    next?: IConditionalTypeContinuable; // Optional next condition in the chain
}

export interface IConditionalTypeLiteral {
	type: IConditionalTypeEnum.Literal;
	value: ITypedInput; // Literal value for the condition
	next?: IConditionalTypeContinuable; // Optional next condition in the chain
}

export type IConditionalType =
    | IConditionalTypeLogic
    | IConditionalTypeParensBlock
    | IConditionalTypeRaw
	| IConditionalTypeLiteral;

/**
 * A abstract syntax tree node type for code generation.
 */
export enum INodeTypeEnum {
	SetVariable = 'ISetVariable',
	IfCondition = 'IIfCondition',
	ForLoop = 'IForLoop',
	CustomCode = 'ICustomCode',
	Block = 'IBlock'
}

export interface IVariableSetNode {
	type: INodeTypeEnum.SetVariable;
	data: {
		name: string;
		value: ITypedInput;
	};
}

export interface IIfConditionNode {
	type: INodeTypeEnum.IfCondition;
	data: {
		condition: IConditionalType;
		body: INode[];
		elseifs?: IElseIf[];
		else?: INode[];
	};
}

export interface IElseIf {
	condition: IConditionalType;
	body: INode[];
}

export interface IForLoopNode {
	type: INodeTypeEnum.ForLoop;
	data: {
		condition: IForLoopType;
		body: INode[];
	};
}

export interface ICustomCodeNode {
	type: INodeTypeEnum.CustomCode;
	data: {
		code: string;
	};
}

export interface IBlockNode {
	type: INodeTypeEnum.Block;
	data: {
		body: INode[];
	};
}

export type INode =
	| IVariableSetNode
	| IIfConditionNode
	| IForLoopNode
	| ICustomCodeNode
	| IBlockNode;

export interface ICommandArgument {
	type: ICommandArgumentType;
	name: string;
	description?: string;
	required: boolean;
}

export enum IPreludeTypeEnum {
	// No prelude, just start up the flow
	Library = 'ILibrary',
	// Command node that starts the flow for a command
	Command = 'ICommand'
}

export interface IPreludeLibrary {
	type: IPreludeTypeEnum.Library;
}

export interface IPreludeCommand {
	type: IPreludeTypeEnum.Command;
	data: {
		name: string;
		description: string;
		arguments: ICommandArgument[];
	};
}

export type IPreludeData = IPreludeLibrary | IPreludeCommand;

/**
 * Command argument types for the command nodes.
 */
export enum ICommandArgumentType {
	String = 'IString',
	Integer = 'IInteger',
	Boolean = 'IBoolean',
	User = 'IUser',
	Channel = 'IChannel',
	Role = 'IRole',
	Member = 'IMember'
}

/**
 * AST class
 */
export class CodeGenAST {
	/**
	 * Start node type
	 */
	public prelude: IPreludeData;

	/**
	 * The nodes in the IR.
	 */
	public nodes: INode[];
	/**
	 * Error messages generated during the IR generation.
	 */
	public errors: string[];
	/**
	 * Warnings generated during the IR generation.
	 */
	public warnings: string[];
	/**
	 * Fatal error that occurred during the IR generation.
	 * If this is set, the IR generation failed and should not be used.
	 */
	public fatalError?: string;
	/**
	 * Dependencies that the generated code needs.
	 */
	public dependencies: string[];

	constructor(
		prelude: IPreludeData = { type: IPreludeTypeEnum.Library },
		nodes: INode[] = [],
		errors: string[] = [],
		warnings: string[] = [],
		dependencies: string[] = [],
		fatalError?: string
	) {
		this.prelude = prelude;
		this.nodes = nodes;
		this.errors = errors;
		this.warnings = warnings;
		this.dependencies = dependencies;
		this.fatalError = fatalError;
	}

	toJSON(): Record<string, unknown> {
		return {
			nodes: this.nodes,
			prelude: this.prelude,
			warnings: this.warnings,
			errors: this.errors,
			dependencies: this.dependencies,
			fatalError: this.fatalError
		};
	}
}
