/**
 * The different types that a value in Luau can be user-initialized to.
 */
export enum ITypedInputEnum {
    String = "String",
    Number = "Number",
    Table = "Table",
    Boolean = "Boolean",
    Raw = "Raw",
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

export type ITypedInput = ITypedInputString | ITypedInputNumber | ITypedInputTable | ITypedInputBoolean | ITypedInputRaw;

export enum IForLoopTypeEnum {
    GeneralizedIteration = "GeneralizedIteration",
    Range = "Range",
    Raw = "Raw",
}

/**
 * Luau generalized for loop (for varbinds in iterable do ... end)
 */
export interface IForLoopGeneralizedIteration {
    type: IForLoopTypeEnum.GeneralizedIteration;
    varbinds: string[]
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

export type INode = IVariableSetNode | IIfConditionNode | IForLoopNode | ICustomCodeNode | IBlockNode;

export interface ICommandArgument {
    type: ICommandArgumentType;
    name: string;
    description?: string;
    required: boolean;
}

export enum IPreludeTypeEnum {
    // No prelude, just start up the flow
    Library = "Library",
    // Command node that starts the flow for a command
    Command = "Command",
}

export interface IPreludeLibrary {
    type: IPreludeTypeEnum.Library;
}

export interface IPreludeCommand {
    type: IPreludeTypeEnum.Command;
    data: {
        name: string;
        description: string[];
        arguments: ICommandArgument[];
    };
}

export type IPreludeData = IPreludeLibrary | IPreludeCommand;

/**
 * Command argument types for the command nodes.
 */
export enum ICommandArgumentType {
    String = "string",
    Integer = "integer",
    Boolean = "boolean",
    User = "user",
    Channel = "channel",
    Role = "role",
    Member = "member",
}

/**
 * Internal representation class
 */
export class CodeGenIR {
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

    constructor(prelude: IPreludeData = {type: IPreludeTypeEnum.Library}, nodes: INode[] = [], errors: string[] = [], warnings: string[] = [], dependencies: string[] = [], fatalError?: string) {
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
            fatalError: this.fatalError,
        };
    }
}