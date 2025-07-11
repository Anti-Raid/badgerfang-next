
/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum ITypedInputEnum {
    String = "String",
    Number = "Number",
    Table = "Table",
    Boolean = "Boolean",
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
    SetVariable = "SetVariable",
    IfCondition = "IfCondition",
    ForLoop = "ForLoop",
    CustomCode = "CustomCode",
    Block = "Block",
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

export type INode = IVariableSetNode | IIfConditionNode | IForLoopNode | ICustomCodeNode | IBlockNode;

/**
 * Internal representation class
 */
export class CodeGenIR {
    /**
     * The nodes in the IR.
     */
    public nodes: INode[];
    /**
     * Warnings generated during the IR generation.
     */
    public warnings: string[];
    /**
     * Dependencies that the generated code needs.
     */
    public dependencies: string[];

    constructor(nodes: INode[] = [], warnings: string[] = [], dependencies: string[] = []) {
        this.nodes = nodes;
        this.warnings = warnings;
        this.dependencies = dependencies;
    }
    
    toJSON(): Record<string, unknown> {
        return {
            nodes: this.nodes,
            warnings: this.warnings,
            dependencies: this.dependencies,
        };
    }
}