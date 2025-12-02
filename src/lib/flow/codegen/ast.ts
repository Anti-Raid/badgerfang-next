import { ASTPreludeApply } from './ast_transforms';

/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum ITypedInputEnum {
	Nil = 'INil',
	String = 'IString',
	Number = 'INumber',
	Table = 'ITable',
	TableArray = 'ITableArray',
	Boolean = 'IBoolean',
	Vector = 'IVector',
	Raw = 'IRaw'
}

export interface ITypedInputNil {
	type: ITypedInputEnum.Nil;
}

export interface ITypedInputString {
	type: ITypedInputEnum.String;
	value: string;
	interpolated: boolean;
}

export interface ITypedInputNumber {
	type: ITypedInputEnum.Number;
	value: number;
}

export interface ITypedInputTableEntry {
	key: ITypedInput;
	value: ITypedInput;
}

export interface ITypedInputTable {
	type: ITypedInputEnum.Table;
	value: ITypedInputTableEntry[];
	inline: boolean;
}

export interface ITypedInputTableArray {
	type: ITypedInputEnum.TableArray;
	value: ITypedInput[];
	inline: boolean;
}

export interface ITypedInputBoolean {
	type: ITypedInputEnum.Boolean;
	value: boolean;
}

export interface ITypedInputVector {
	type: ITypedInputEnum.Vector;
	x: number;
	y: number;
	z: number;
}

export interface ITypedInputRaw {
	type: ITypedInputEnum.Raw;
	value: string; // Raw code or expression
}

export type ITypedInput =
	| ITypedInputNil
	| ITypedInputString
	| ITypedInputNumber
	| ITypedInputTable
	| ITypedInputTableArray
	| ITypedInputBoolean
	| ITypedInputVector
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
	IfLte = 'IIfLte'
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
	Literal = 'ILiteral'
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
	WhileLoop = 'IWhileLoop',
	CustomCode = 'ICustomCode',
	Block = 'IBlock',

	LocalFunctionDeclaration = 'LocalFunctionDeclaration',
	FunctionDeclaration = 'FunctionDeclaration'
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

export interface WhileLoopNode {
	type: INodeTypeEnum.WhileLoop;
	data: {
		condition: IConditionalType;
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

export interface ILocalFunctionDeclaration {
	type: INodeTypeEnum.LocalFunctionDeclaration;
	name: string; // The name of the function
	params: IFunctionParameter[]; // The parameters of the function
	body: INode[]; // The body of the function
	returnType: IFunctionReturn; // Optional return type of the function
}

export interface IFunctionDeclaration {
	type: INodeTypeEnum.FunctionDeclaration;
	name: string; // The name of the function
	params: IFunctionParameter[]; // The parameters of the function
	body: INode[]; // The body of the function
	returnType: IFunctionReturn; // Optional return type of the function
}

export interface IFunctionParameter {
	name: string; // The name of the parameter
	type?: string; // Optional type of the parameter
}

export interface IFunctionReturn {
	type?: string; // The type of the return value
}

export type INode =
	| IVariableSetNode
	| IIfConditionNode
	| IForLoopNode
	| WhileLoopNode
	| ICustomCodeNode
	| IBlockNode
	| ILocalFunctionDeclaration
	| IFunctionDeclaration;

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
	Command = 'ICommand',
	// Prelude has already been applied
	Applied = 'IApplied'
}

export interface IPreludeApplied {
	type: IPreludeTypeEnum.Applied;
}

export interface IPreludeLibrary {
	type: IPreludeTypeEnum.Library;
	data: {
		name: string;
	};
}

export interface IPreludeCommand {
	type: IPreludeTypeEnum.Command;
	data: {
		name: string;
		description: string;
		arguments: ICommandArgument[];
	};
}

export type IPreludeData = IPreludeLibrary | IPreludeCommand | IPreludeApplied;

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
	public dependencies: Record<string, string>;

	constructor(
		prelude: IPreludeData = { type: IPreludeTypeEnum.Library, data: { name: 'Unnamed Library' } },
		nodes: INode[] = [],
		errors: string[] = [],
		warnings: string[] = [],
		dependencies: Record<string, string> = {},
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

	isError(): boolean {
		return this.errors.length > 0 || !!this.fatalError;
	}

	applyTransform(transform: (ast: CodeGenAST) => void): void {
		if (this.isError()) {
			throw new Error('Cannot apply transforms to an AST with errors or a fatal error');
		}

		try {
			transform(this);
		} catch (error) {
			this.fatalError = `AST transform failed unexpectedly: ${error?.toString()}`;
		}
	}

	applyDefaultTransforms(): void {
		this.applyTransform((ast) => {
			new ASTPreludeApply(ast).transform();
		});
	}
}
