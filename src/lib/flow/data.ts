// Inspired from Kite
// SPDX: GPL-3.0
import { Connection, Edge, Node, NodeProps as XYNodeProps } from '@xyflow/react';
import { SubflowData } from './subnode';

export const numericRegex = /^[0-9]+$/;
export const placeholderRegex = /^\{\{[a-z0-9_.]+\}\}$/;

export type GlobalStaticValidation = (
	srcCons: string[],
	tgtCons: string[],
	value: Edge | Connection,
	source: Node<NodeExtData>,
	target: Node<NodeExtData>,
	getNode: (id: string) => Node<NodeExtData> | undefined
) => boolean;

const isValidationSourceReg: { [key: string]: GlobalStaticValidation } = {};
export const registerValidationSource = (source: string, validation: GlobalStaticValidation) => {
	isValidationSourceReg[source] = validation;
};

export const getValidationSource = (source: string): GlobalStaticValidation | undefined => {
	return isValidationSourceReg[source];
};

const isValidationTargetReg: { [key: string]: GlobalStaticValidation } = {};
export const registerValidationTarget = (target: string, validation: GlobalStaticValidation) => {
	isValidationTargetReg[target] = validation;
};

export const getValidationTarget = (target: string): GlobalStaticValidation | undefined => {
	return isValidationTargetReg[target];
};

/**
 * The different types that a value in Luau can be user-initialized to.
 *
 * Function/Thread/UserData/Buffer are currently not supported here (use Raw for this)
 */
export enum TypedInputEnum {
	Nil = 'Nil',
	String = 'String',
	Number = 'Number',
	Table = 'Table',
	TableArray = 'TableArray',
	Boolean = 'Boolean',
	Vector = 'Vector',
	Raw = 'Raw',
	Parens = 'Parens', // only produced by ComplexSubflow's for now (unless we make a UI for it outside of subflows)
	LogicExpr = 'LogicExpr', // only produced by ComplexSubflow's for now (unless we make a UI for it outside of subflows)
	RelationalExpr = 'RelationalExpr', // only produced by ComplexSubflow's for now (unless we make a UI for it outside of subflows)
	Not = 'Not', // Logical NOT expression
	ComplexSubflow = 'ComplexSubflow' // A subflow that is evaluated to produce a value
}

export const stringToTypedInputEnum = (value: string): TypedInputEnum => {
	switch (value?.toLowerCase()) {
		case 'nil':
			return TypedInputEnum.Nil;
		case 'string':
			return TypedInputEnum.String;
		case 'number':
			return TypedInputEnum.Number;
		case 'table':
			return TypedInputEnum.Table;
		case 'tablearray':
			return TypedInputEnum.TableArray;
		case 'boolean':
			return TypedInputEnum.Boolean;
		case 'vector':
			return TypedInputEnum.Vector;
		case 'raw':
			return TypedInputEnum.Raw;
		case 'parens':
			return TypedInputEnum.Parens;
		case 'logicexpr':
			return TypedInputEnum.LogicExpr;
		case 'relationalexpr':
			return TypedInputEnum.RelationalExpr;
		case 'complexsubflow':
			return TypedInputEnum.ComplexSubflow;
		case 'not':
			return TypedInputEnum.Not;
		default:
			throw new Error(`Unknown TypedInputEnum value: ${value}`);
	}
};

export const typedInputEnumToString = (type: TypedInputEnum): string => {
	switch (type) {
		case TypedInputEnum.Nil:
			return 'nil';
		case TypedInputEnum.String:
			return 'string';
		case TypedInputEnum.Number:
			return 'number';
		case TypedInputEnum.Table:
			return 'table';
		case TypedInputEnum.TableArray:
			return 'tablearray';
		case TypedInputEnum.Boolean:
			return 'boolean';
		case TypedInputEnum.Vector:
			return 'vector';
		case TypedInputEnum.Raw:
			return 'raw';
		case TypedInputEnum.Parens:
			return 'parens';
		case TypedInputEnum.LogicExpr:
			return 'logicexpr';
		case TypedInputEnum.RelationalExpr:
			return 'relationalexpr';
		case TypedInputEnum.ComplexSubflow:
			return 'complexsubflow';
		case TypedInputEnum.Not:
			return 'not';
		default:
			throw new Error(`Unknown TypedInputEnum: ${type}`);
	}
};

export interface TypedInputNil {
	type: TypedInputEnum.Nil;
}

export interface TypedInputString {
	type: TypedInputEnum.String;
	value: string;
	interpolated: boolean;
}

export interface TypedInputNumber {
	type: TypedInputEnum.Number;
	value: number;
}

export interface TypedInputTableEntry {
	key: TypedInput;
	value: TypedInput;
}

export interface TypedInputTable {
	type: TypedInputEnum.Table;
	value: TypedInputTableEntry[];
	inline: boolean;
}

export interface TypedInputTableArray {
	type: TypedInputEnum.TableArray;
	value: TypedInput[];
	inline: boolean;
}

export interface TypedInputBoolean {
	type: TypedInputEnum.Boolean;
	value: boolean;
}

export interface TypedInputVector {
	type: TypedInputEnum.Vector;
	x: number;
	y: number;
	z: number;
}

export interface TypedInputRaw {
	type: TypedInputEnum.Raw;
	value: string; // Raw code or expression
}

export interface TypedInputParens {
	type: TypedInputEnum.Parens;
	inner: TypedInput;
}

export enum TypedInputLogicType {
	And = 'And',
	Or = 'Or'
}

// Method 1: a and b or c => { type: And, lvalue: a, rvalue: { type: Or, lvalue: b, rvalue: c } }
// Method 2: a and b or c => { operand: a, operations: [ { type: And, value: b }, { type: Or, value: c } ] }
export interface TypedInputLogicStmt {
	type: TypedInputEnum.LogicExpr;
	condition: TypedInputLogicType; // The logic condition
	operands: TypedInput[]; // The operands involved in the logic expression
}

export enum RelationalOperatorType {
	Eq = 'Eq',
	Neq = 'Neq',
	Gt = 'Gt',
	Gte = 'Gte',
	Lt = 'Lt',
	Lte = 'Lte'
}

export interface TypedInputRelationalExpr {
	type: TypedInputEnum.RelationalExpr;
	operator: RelationalOperatorType; // The relational operator
	lvalue: TypedInput; // The left-hand side value
	rvalue: TypedInput; // The right-hand side value
}

export interface TypedInputNot {
	type: TypedInputEnum.Not;
	value: TypedInput;
}

export interface TypedInputComplexSubflow {
	type: TypedInputEnum.ComplexSubflow;
	flow: SubflowData;
}

export type TypedInput =
	| TypedInputNil
	| TypedInputString
	| TypedInputNumber
	| TypedInputTable
	| TypedInputTableArray
	| TypedInputBoolean
	| TypedInputVector
	| TypedInputRaw
	| TypedInputParens
	| TypedInputLogicStmt
	| TypedInputRelationalExpr
	| TypedInputNot
	| TypedInputComplexSubflow;

export enum ForLoopTypeEnum {
	GeneralizedIteration = 'GeneralizedIteration',
	Range = 'Range',
	Raw = 'Raw'
}

/**
 * Luau generalized for loop (for varbinds in iterable do ... end)
 */
export interface ForLoopGeneralizedIteration {
	type: ForLoopTypeEnum.GeneralizedIteration;
	varbinds: string[];
	iterable: TypedInput;
}

/**
 * Luau numeric for loop (for i = start, end [, step] do ... end)
 */
export interface ForLoopRange {
	type: ForLoopTypeEnum.Range;
	varbind: string;
	start: number;
	end: number;
	step?: number; // Optional step value
}

export interface ForLoopRaw {
	type: ForLoopTypeEnum.Raw;
	condition: string; // Raw condition for the loop
}

export type ForLoopType = ForLoopGeneralizedIteration | ForLoopRange | ForLoopRaw;

export interface FlowData {
	nodes: Node<NodeExtData>[];
	edges: Edge[];
}

export enum NodeTypeEnum {
	// Start nodes of the flow
	LibraryNode = 'LibraryNode',
	CommandNode = 'CommandNode',
	CommandArgumentNode = 'CommandArgumentNode',

	// Basic ops
	SetVariable = 'SetVariable',
	IfCondition = 'IfCondition',
	ElseIfCondition = 'ElseIfCondition',
	ElseCondition = 'ElseCondition',
	EndCondition = 'EndCondition',
	CustomCode = 'CustomCode',
	ForLoop = 'ForLoop',
	WhileLoop = 'WhileLoop',

	// API nodes
	APINode = 'APINode',

	// Special
	UnknownNode = 'UnknownNode',
	Group = 'Group'
}

/**
 * Command argument types for the command nodes.
 */
export enum CommandArgumentType {
	String = 'string',
	Integer = 'integer',
	Boolean = 'boolean',
	User = 'user',
	Channel = 'channel',
	Role = 'role',
	Member = 'member'
}

export const stringToCommandArgumentType = (value: string): CommandArgumentType => {
	switch (value?.toLowerCase()) {
		case 'string':
			return CommandArgumentType.String;
		case 'integer':
			return CommandArgumentType.Integer;
		case 'boolean':
			return CommandArgumentType.Boolean;
		case 'user':
			return CommandArgumentType.User;
		case 'channel':
			return CommandArgumentType.Channel;
		case 'role':
			return CommandArgumentType.Role;
		case 'member':
			return CommandArgumentType.Member;
		default:
			throw new Error(`Unknown CommandArgumentType value: ${value}`);
	}
};

export const commandArgumentTypeToString = (type: CommandArgumentType): string => {
	switch (type) {
		case CommandArgumentType.String:
			return 'string';
		case CommandArgumentType.Integer:
			return 'integer';
		case CommandArgumentType.Boolean:
			return 'boolean';
		case CommandArgumentType.User:
			return 'user';
		case CommandArgumentType.Channel:
			return 'channel';
		case CommandArgumentType.Role:
			return 'role';
		case CommandArgumentType.Member:
			return 'member';
		default:
			throw new Error(`Unknown CommandArgumentType: ${type}`);
	}
};

export interface SharedNodeData {
	comment?: string;
}

export interface LibraryNode {
	type: NodeTypeEnum.LibraryNode;
	data: SharedNodeData & {
		name: string; // Name of the library
	};
}

export interface CommandNode {
	type: NodeTypeEnum.CommandNode;
	data: SharedNodeData & {
		name: string;
		description: string;
	};
}

export interface CommandArgumentNode {
	type: NodeTypeEnum.CommandArgumentNode;
	data: SharedNodeData & {
		type: CommandArgumentType;
		name: string;
		description: string;
		required: boolean;
	};
}

export interface VariableSetNode {
	type: NodeTypeEnum.SetVariable;
	data: SharedNodeData & {
		name?: string;
		value?: TypedInput;
	};
}

export interface IfConditionNode {
	type: NodeTypeEnum.IfCondition;
	data: SharedNodeData & {
		condition: TypedInput;
	};
}

export interface ElseIfConditionNode {
	type: NodeTypeEnum.ElseIfCondition;
	data: SharedNodeData & {
		condition: TypedInput;
		index: number; // Index of the elseif in the chain
	};
}

export interface ElseConditionNode {
	type: NodeTypeEnum.ElseCondition;
	data: SharedNodeData;
}

export interface EndConditionNode {
	type: NodeTypeEnum.EndCondition;
	data: SharedNodeData;
}

export interface CustomCodeNode {
	type: NodeTypeEnum.CustomCode;
	data: SharedNodeData & {
		code: string; // Custom code to execute
	};
}

export interface ForLoopNode {
	type: NodeTypeEnum.ForLoop;
	data: SharedNodeData & {
		condition: ForLoopType;
	};
}

export interface WhileLoopNode {
	type: NodeTypeEnum.WhileLoop;
	data: SharedNodeData & {
		condition: TypedInput; // Condition for the while loop
	};
}

export interface UnknownNode {
	type: NodeTypeEnum.UnknownNode;
	data: SharedNodeData & Record<string, unknown>;
}

export interface GroupNode {
	type: NodeTypeEnum.Group;
}

export interface APINode {
	type: NodeTypeEnum.APINode;
	data: SharedNodeData & {
		nodeidl: string;
		inputValues: TypedInput;
	};
}

export type FlowNodeData =
	| LibraryNode
	| CommandNode
	| CommandArgumentNode
	| VariableSetNode
	| IfConditionNode
	| ElseIfConditionNode
	| ElseConditionNode
	| EndConditionNode
	| CustomCodeNode
	| ForLoopNode
	| WhileLoopNode
	| APINode
	| UnknownNode
	| GroupNode;

export type NodeData = Record<string, unknown>;
export type NodeExtData = FlowNodeData & Record<string, unknown>;

export type NodeProps = XYNodeProps<Node<NodeExtData>>;

export type NodeType = Node<NodeExtData>;
