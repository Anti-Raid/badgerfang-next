// Inspired from Kite
// SPDX: GPL-3.0
import { Connection, Edge, Node, NodeProps as XYNodeProps } from "@xyflow/react";
import z from "zod";
import { PermissionIndividual } from "./discordperms";
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

export type TypedInput = TypedInputString | TypedInputNumber | TypedInputTable | TypedInputBoolean;

export interface FlowData {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export enum NodeTypeEnum {
    SetVariable,
    IfCondition,
    ElseIfCondition,
    ElseCondition,
    EndCondition,

    // Unsupported for now
    ForLoop,
    BaseCommand,
    CommandArgument,
    
    // Special
    UnknownNode,
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
    node_name: string;
    node_description?: string;
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

export interface ForLoopNode {
    type: NodeTypeEnum.ForLoop;
    data: SharedNodeData & {
        condition?: string;
    };
}

export interface UnknownNode {
    type: NodeTypeEnum.UnknownNode;
    data: SharedNodeData & Record<string, unknown>;
}

export type FlowNodeData = BaseCommandNode | CommandArgumentNode | VariableSetNode | 
IfConditionNode | ElseIfConditionNode | ElseConditionNode | EndConditionNode | ForLoopNode | UnknownNode;

export type NodeData = Record<string, unknown>;
export type NodeExtData = FlowNodeData & Record<string, unknown>;

export type NodeProps = XYNodeProps<Node<NodeData>>;

export type NodeType = Node<NodeData>;

//export const auditLogReasonSchema = z.string().max(512).optional();

export const sharedNodeDataSchema = z.object({
    node_name: z.string().max(32).min(1),
    node_description: z.string().max(100).optional(),   
});

export const baseCommandNodeSchema = sharedNodeDataSchema.extend({
  name: z
    .string()
    .max(32)
    .min(1)
    .regex(
      /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/ug,
      "Must be only lowercase alphanumeric characters and underscores"
    ),
    description: z.string().max(100).min(1),
    command_discord_permissions: z
        .array(
            z
            .string()
            .check(val => {
                const permissions = val.value.split(",");
                for(let perm of permissions) {
                    if(!PermissionIndividual[perm]) {
                        val.issues.push({
                            code: "custom",
                            input: val.value
                        });
                    }
                }
            })
            .max(100)
        )
        .optional(),
    command_kittycat_permissions: z
        .array(z.string().max(100))
        .optional()
});

export const commandArgumentNodeSchema = sharedNodeDataSchema.extend({
    command_argument_type: z.enum(CommandArgumentType),
    command_argument_name: z.string()
    .regex(
      /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/ug,
      "Must be only lowercase alphanumeric characters and underscores"
    )
    .max(32)
    .min(1),
    command_argument_description: z.string().max(100).optional(),
    command_argument_required: z.boolean(),
});

export const variableSetNodeSchema = sharedNodeDataSchema.extend({
    variable_name: z.string().min(1).optional(),
    variable_value: z.string().min(1).optional(),
});

export const forLoopNodeSchema = sharedNodeDataSchema.extend({
    condition: z.string().min(1),
});

export const ifConditionNodeSchema = sharedNodeDataSchema.extend({
    condition: z.string().min(1),
});