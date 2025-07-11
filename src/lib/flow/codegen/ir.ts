
/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum ITypedInputEnum {
    String,
    Number,
    Table,
    Boolean,
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

export type ITypedInput = ITypedInputString | ITypedInputNumber | ITypedInputTable | ITypedInputBoolean;

/**
 * A internal representation node type for code generation.
 */
export enum INodeTypeEnum {
    SetVariable,
    IfCondition,
    ForLoop,
    Block,
}

export interface IVariableSetNode {
    type: INodeTypeEnum.SetVariable;
    data: {
        variable_name: string;
        variable_value: ITypedInput;
    }
}

export interface IIfConditionNode {
    type: INodeTypeEnum.IfCondition;
    data: {
        condition: string;
        body: INode[];
        elseifs?: IElseIf[];
        else?: INode[];
    };
}

export interface IElseIf {
    condition: string;
    body: INode[];
}

export interface IForLoopNode {
    type: INodeTypeEnum.ForLoop;
    data: {
        condition: string;
        body: INode[];
    };
}

export interface IBlockNode {
    type: INodeTypeEnum.Block;
    data: {
        body: INode[];
    };
}

export type INode = IVariableSetNode | IIfConditionNode | IForLoopNode;