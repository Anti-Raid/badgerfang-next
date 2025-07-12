// Inspired from Kite
// SPDX: GPL-3.0
import { Connection, Edge, Node, NodeProps as XYNodeProps } from "@xyflow/react";
import { FlowContext } from "./context";

export const numericRegex = /^[0-9]+$/;
export const placeholderRegex = /^\{\{[a-z0-9_.]+\}\}$/;

export type GlobalStaticValidation = (svi: FlowContext, srcCons: string[], tgtCons: string[], value: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => boolean;

const isValidationSourceReg: {[key: string]: GlobalStaticValidation} = {}
export const registerValidationSource = (source: string, validation: GlobalStaticValidation) => {
    isValidationSourceReg[source] = validation;
}

export const getValidationSource = (source: string): GlobalStaticValidation | undefined => {
    return isValidationSourceReg[source];
}

const isValidationTargetReg: {[key: string]: GlobalStaticValidation} = {}
export const registerValidationTarget = (target: string, validation: GlobalStaticValidation) => {
    isValidationTargetReg[target] = validation;
}

export const getValidationTarget = (target: string): GlobalStaticValidation | undefined => {
    return isValidationTargetReg[target];
}

/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum TypedInputEnum {
    String = "String",
    Number = "Number",
    Table = "Table",
    Boolean = "Boolean",
    Raw = "Raw",
}

export const stringToTypedInputEnum = (value: string): TypedInputEnum => {
    switch (value?.toLowerCase()) {
        case "string":
            return TypedInputEnum.String;
        case "number":
            return TypedInputEnum.Number;
        case "table":
            return TypedInputEnum.Table;
        case "boolean":
            return TypedInputEnum.Boolean;
        case "raw":
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

export type TypedInput = TypedInputString | TypedInputNumber | TypedInputTable | TypedInputBoolean | TypedInputRaw;

export enum ForLoopTypeEnum {
    GeneralizedIteration = "GeneralizedIteration",
    Range = "Range",
    Raw = "Raw",
}

/**
 * Luau generalized for loop (for varbinds in iterable do ... end)
 */
export interface ForLoopGeneralizedIteration {
    type: ForLoopTypeEnum.GeneralizedIteration;
    varbinds: string[]
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
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export enum NodeTypeEnum {
    SetVariable = "SetVariable",
    IfCondition = "IfCondition",
    ElseIfCondition = "ElseIfCondition",
    ElseCondition = "ElseCondition",
    EndCondition = "EndCondition",
    CustomCode = "CustomCode",

    // Unsupported for now
    ForLoop = "ForLoop",
    BaseCommand = "BaseCommand",
    CommandArgument = "CommandArgument",
    
    // Special
    UnknownNode = "UnknownNode",
}

export enum CommandArgumentType {
    String = "string",
    Integer = "integer",
    Boolean = "boolean",
    User = "user",
    Channel = "channel",
    Role = "role",
    Member = "member",
}

export interface SharedNodeData {
    comment?: string;
}

export interface BaseCommandNode {
    type: NodeTypeEnum.BaseCommand;
    data: SharedNodeData & {
        command_name: string;
        command_description: string[];
        command_kittycat_permissions?: string[];
    };
}

export interface CommandArgumentNode {
    type: NodeTypeEnum.CommandArgument;
    data: SharedNodeData & {
        command_argument_type: CommandArgumentType;
        command_argument_name: string;
        command_argument_description?: string;
        command_argument_required: boolean;
    };
}

export interface VariableSetNode {
    type: NodeTypeEnum.SetVariable;
    data: SharedNodeData & {
        variable_name?: string;
        variable_value?: TypedInput;
    }
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

export type FlowNodeData = BaseCommandNode | CommandArgumentNode | VariableSetNode | 
IfConditionNode | ElseIfConditionNode | ElseConditionNode | EndConditionNode | CustomCodeNode |
ForLoopNode | UnknownNode;

export type NodeData = Record<string, unknown>;
export type NodeExtData = FlowNodeData & Record<string, unknown>;

export type NodeProps = XYNodeProps<Node<NodeData>>;

export type NodeType = Node<NodeData>;

