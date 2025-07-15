// Inspired from Kite
// SPDX: GPL-3.0
import { Connection, Edge, Node, NodeProps as XYNodeProps } from '@xyflow/react';

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
 */
export enum TypedInputEnum {
	String = 'String',
	Number = 'Number',
	Table = 'Table',
	Boolean = 'Boolean',
	Raw = 'Raw'
}

export const stringToTypedInputEnum = (value: string): TypedInputEnum => {
	switch (value?.toLowerCase()) {
		case 'string':
			return TypedInputEnum.String;
		case 'number':
			return TypedInputEnum.Number;
		case 'table':
			return TypedInputEnum.Table;
		case 'boolean':
			return TypedInputEnum.Boolean;
		case 'raw':
			return TypedInputEnum.Raw;
		default:
			throw new Error(`Unknown TypedInputEnum value: ${value}`);
	}
};

export interface TypedInputString {
	type: TypedInputEnum.String;
	value: string;
}

export interface TypedInputNumber {
	type: TypedInputEnum.Number;
	value: number;
}

export interface TypedInputTable {
	type: TypedInputEnum.Table;
	value: Record<string, unknown>;
}

export interface TypedInputBoolean {
	type: TypedInputEnum.Boolean;
	value: boolean;
}

export interface TypedInputRaw {
	type: TypedInputEnum.Raw;
	value: string; // Raw code or expression
}

export type TypedInput =
	| TypedInputString
	| TypedInputNumber
	| TypedInputTable
	| TypedInputBoolean
	| TypedInputRaw;

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

export enum ConditionalLogicTypeEnum {
	IfEq = 'IfEq',
	IfNeq = 'IfNeq',
	IfGt = 'IfGt',
	IfGte = 'IfGte',
	IfLt = 'IfLt',
	IfLte = 'IfLte',
	Unselected = 'Unselected' // Used for UI to indicate no logic condition is selected
}

export const stringToConditionalLogicTypeEnum = (value: string): ConditionalLogicTypeEnum => {
	switch (value?.toLowerCase()) {
		case 'ifeq':
			return ConditionalLogicTypeEnum.IfEq;
		case 'ifneq':
			return ConditionalLogicTypeEnum.IfNeq;
		case 'ifgt':
			return ConditionalLogicTypeEnum.IfGt;
		case 'ifgte':
			return ConditionalLogicTypeEnum.IfGte;
		case 'iflt':
			return ConditionalLogicTypeEnum.IfLt;
		case 'iflte':
			return ConditionalLogicTypeEnum.IfLte;
		case 'unselected':
			return ConditionalLogicTypeEnum.Unselected;
		default:
			throw new Error(`Unknown ConditionalLogicTypeEnum value: ${value}`);
	}
};

export const conditionalLogicTypeEnumToString = (type: ConditionalLogicTypeEnum): string => {
	switch (type) {
		case ConditionalLogicTypeEnum.IfEq:
			return 'ifeq';
		case ConditionalLogicTypeEnum.IfNeq:
			return 'ifneq';
		case ConditionalLogicTypeEnum.IfGt:
			return 'ifgt';
		case ConditionalLogicTypeEnum.IfGte:
			return 'ifgte';
		case ConditionalLogicTypeEnum.IfLt:
			return 'iflt';
		case ConditionalLogicTypeEnum.IfLte:
			return 'iflte';
		case ConditionalLogicTypeEnum.Unselected:
			return 'unselected'; // For UI purposes
	}
};

export interface ConditionalLogicType {
	type: ConditionalLogicTypeEnum;
	left: TypedInput;
	right: TypedInput;
}

export enum ConditionalTypeEnum {
	LogicExpr = 'LogicExpr',
	ParensBlock = 'ParensBlock',
	Raw = 'Raw',
	Unselected = 'Unselected' // Used for UI to indicate no condition is selected
}

export interface ConditionalTypeContinuable {
	op: 'and' | 'or';
	condition: ConditionalType; // The next condition in the chain
}

export interface ConditionalTypeLogic {
	type: ConditionalTypeEnum.LogicExpr;
	condition: ConditionalLogicType; // The logic condition (e.g., IfEq, IfGt)
	next?: ConditionalTypeContinuable; // Optional next condition in the chain
}

export interface ConditionalTypeParensBlock {
	type: ConditionalTypeEnum.ParensBlock;
	condition: ConditionalType; // The condition inside the parentheses
	next?: ConditionalTypeContinuable; // Optional next condition in the chain
}

export interface ConditionalTypeRaw {
	type: ConditionalTypeEnum.Raw;
	condition: string; // Raw condition for the if statement
	next?: ConditionalTypeContinuable; // Optional next condition in the chain
}

export interface ConditionalTypeUnselected {
	type: ConditionalTypeEnum.Unselected;
}

export type ConditionalType =
	| ConditionalTypeLogic
	| ConditionalTypeParensBlock
	| ConditionalTypeRaw
	| ConditionalTypeUnselected;

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
	data: SharedNodeData;
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
		condition: string;
	};
}

export interface ElseIfConditionNode {
	type: NodeTypeEnum.ElseIfCondition;
	data: SharedNodeData & {
		condition: string;
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

export interface UnknownNode {
	type: NodeTypeEnum.UnknownNode;
	data: SharedNodeData & Record<string, unknown>;
}

export interface GroupNode {
	type: NodeTypeEnum.Group;
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
	| UnknownNode
	| GroupNode;

export type NodeData = Record<string, unknown>;
export type NodeExtData = FlowNodeData & Record<string, unknown>;

export type NodeProps = XYNodeProps<Node<NodeExtData>>;

export type NodeType = Node<NodeExtData>;
