import { CommandArgumentNode, CommandArgumentType, CommandNode, CustomCodeNode, ForLoopNode, ForLoopType, ForLoopTypeEnum, IfConditionNode, LibraryNode, NodeData, NodeExtData, NodeTypeEnum, TypedInput, TypedInputEnum, VariableSetNode } from "../data";
import { Node, Edge, getOutgoers, getIncomers } from "@xyflow/react";
import { CodeGenAST, ICommandArgument, ICommandArgumentType, IElseIf, IForLoopType, IForLoopTypeEnum, INode, INodeTypeEnum, IPreludeTypeEnum, ITypedInput, ITypedInputEnum } from "./ast";
import { baseCommandNodeSchema } from "../validation";
import z from "zod";

interface Visit<T> {
    /**
     * The ID of the node being visited.
     */
    nodeId: string;
    /**
     * The current AST being built.
     */
    currentAst: CodeGenAST;
    /**
     * The data associated with the node being visited.
     */
    data: T;
}

interface VisitResult {
    /**
     * The AST representation of the node being visited.
     */
    ast: INode | null;
    /**
     * The next node to visit in the flow.
     */
    nextNode: string | null;
}

const startNodeTypes = [
    NodeTypeEnum.LibraryNode,
    NodeTypeEnum.CommandNode
]

/**
 * Given nodes, edges and auxData, creates the CodeGen AST for the flow.
 */
export class CodeGenASTGenerator {
    private nodes: Node<NodeData>[];
    private edges: Edge[];
    private auxData: Record<string, NodeExtData>;

    /**
     * Creates a new CodeGenASTGenerator instance to convert between the nodes and edges of a flow
     * into a CodeGenAST (Block2AST)
     * 
     * The reason this is not a static method on AST directly is to separate the type definition of AST
     * from the conversion code.
     * 
     * @param nodes The nodes of the graph
     * @param edges The edges of the graph
     * @param auxData The auxiliary data for the nodes, containing additional information about each node.
     */
    constructor(nodes: Node<NodeData>[], edges: Edge[], auxData: Record<string, NodeExtData>) {
        this.nodes = nodes;
        this.edges = edges;
        this.auxData = auxData;
    }

    /**
     * Generates the AST representation of the flow.
     * 
     * Note that this function is guaranteed to not throw an error, but will instead return a CodeGenAST with a fatalError set if an error occurs.
     * 
     * @returns The AST representing the flow.
     */
    public generate(): CodeGenAST {
        let currentAst= new CodeGenAST();

        // Find a start node
        const startNode = this.nodes.filter(node => startNodeTypes.includes(this.auxData[node.id]?.type));

        if (startNode.length === 0) {
            currentAst.fatalError = "No Start Node (Library/Command nodes) found in the flow.";
            return currentAst;
        } else if (startNode.length > 1) {
            currentAst.fatalError = "Multiple Start Nodes (Library/Command nodes) found in the flow.";
            return currentAst;
        }
        try {
            currentAst.nodes = this.visitNodeAndChildren(currentAst, startNode[0].id);
        } catch (error) {
            currentAst.fatalError = `Error generating AST: ${error instanceof Error ? error.message : String(error)}`;
        }
        return currentAst;
    }

    /**
     * Utility to push a warning to the warnings array.
     * @param message The warning message to push.
     */
    private pushWarning(currentAst: CodeGenAST, message: string): void {
        currentAst.warnings.push(message);
    }

    /**
     * Utility to push an error to the errors array.
     * @param message The error message to push.
     */
    private pushError(currentAst: CodeGenAST, message: string): void {
        currentAst.errors.push(message);
    }

    /**
     * Helper to return the parents of a node
     */
    private getParentOfNode(nodeId: string): Node<NodeData>[] {
        return getIncomers({id: nodeId}, this.nodes, this.edges);
    }

    /**
     * Helper to return the direct children of a node
     */
    private getChildrenOfNode(nodeId: string): Node<NodeData>[] {
        return getOutgoers({id: nodeId}, this.nodes, this.edges);
    }

    /**
     * Visits a node and returns its AST representation.
     */
    private visitNode(currentAst: CodeGenAST, node: Node<NodeData>): VisitResult {
        const data = this.getAuxDataForNode(node.id);

        switch (data.type) {
            case NodeTypeEnum.LibraryNode:
                return this.visitLibraryNode({ nodeId: node.id, data, currentAst});
            case NodeTypeEnum.CommandNode:
                return this.visitCommandNode({ nodeId: node.id, data, currentAst});
            case NodeTypeEnum.CommandArgumentNode:
                throw new Error(`CommandArgumentNode ${node.id} should not be visited directly, it should be the source of a CommandNode.`);
            case NodeTypeEnum.SetVariable:
                return this.visitSetVariable({ nodeId: node.id, data, currentAst});
            case NodeTypeEnum.IfCondition:
                return this.visitIfCondition({ nodeId: node.id, data, currentAst});
            case NodeTypeEnum.ElseIfCondition:
                throw new Error(`An ElseIfCondition node must be connected to an IfCondition node or a ForLoop node.`);
            case NodeTypeEnum.ElseCondition:
                throw new Error(`An ElseCondition node must be connected to an IfCondition node or a ForLoop node.`);
            case NodeTypeEnum.EndCondition:
                throw new Error(`An EndCondition node must be connected to an IfCondition node or a ForLoop node.`);
            case NodeTypeEnum.ForLoop:
                return this.visitForLoop({ nodeId: node.id, data, currentAst});
            case NodeTypeEnum.CustomCode:
                return this.visitCustomCode({ nodeId: node.id, data, currentAst});
            case NodeTypeEnum.UnknownNode:
                throw new Error(`Unknown node type ${data.type} encountered.`);
        }
    }

    /**
     * Helper to continuously visit nodes and their children and return their AST representation
     */
    private visitNodeAndChildren(currentAst: CodeGenAST, nodeId: string): INode[] {
        let currentNodeId: string | null = nodeId;
        let astNodes: INode[] = [];
        let visited = new Set<string>();
        while (currentNodeId) {
            if (visited.has(currentNodeId)) {
                throw new Error(`Cycle detected in flow starting from node ${nodeId} at node ${currentNodeId}`);
            }

            visited.add(currentNodeId);

            const node = this.nodes.find(n => n.id === currentNodeId);
            if (!node) {
                throw new Error(`Node with ID ${currentNodeId} not found`);
            }

            const visitResult = this.visitNode(currentAst, node);
            if (visitResult.ast) {
                astNodes.push(visitResult.ast);
            }
            currentNodeId = visitResult.nextNode;
        }

        return astNodes;
    }

    /**
     * Visits a LibraryNode and returns its AST representation.
     */
    private visitLibraryNode(node: Visit<LibraryNode>): VisitResult {
        // Visit start node data and set the start node type in the AST
        node.currentAst.prelude = { type: IPreludeTypeEnum.Library };

        let children = this.getChildrenOfNode(node.nodeId);
        let nextNode: string | null = null;
        if (children.length == 1) {
            nextNode = children[0].id; // Take the first child as the next node
        } else if (children.length > 1) {
            this.pushWarning(node.currentAst, `StartNode ${node.nodeId} has multiple children, only the first will be considered.`);
            nextNode = children[0].id; // Take the first child
        }

        return {
            ast: null,
            nextNode
        }
    }

    /**
     * Visits a CommandNode and returns its AST representation.
     */
    private visitCommandNode(node: Visit<CommandNode>): VisitResult {
        let incoming = this.getParentOfNode(node.nodeId);
        let commandArguments: ICommandArgument[] = [];
        for (const parent of incoming) {
            const argData = this.getAuxDataForNode(parent.id);
            if (argData.type !== NodeTypeEnum.CommandArgumentNode) {
                this.pushError(node.currentAst, `CommandNode ${node.nodeId} has a parent of type ${argData.type}, expected CommandArgumentNode. Invalid aux data?`);
                continue;
            }

            commandArguments.push(this.visitCommandArgumentNode(node.currentAst, argData))
        }

        // Visit start node data and set the start node type in the AST
        let res = baseCommandNodeSchema.safeParse(node.data.data); // Validate the command node data
        if (res.error) {
            this.pushError(node.currentAst, z.prettifyError(res.error));
        }

        node.currentAst.prelude = { type: IPreludeTypeEnum.Command, data: { name: node.data.data.name, description: node.data.data.description, arguments: commandArguments } };

        let children = this.getChildrenOfNode(node.nodeId);
        let nextNode: string | null = null;
        if (children.length == 1) {
            nextNode = children[0].id; // Take the first child as the next node
        } else if (children.length > 1) {
            this.pushWarning(node.currentAst, `StartNode ${node.nodeId} has multiple children, only the first will be considered.`);
            nextNode = children[0].id; // Take the first child
        }

        return {
            ast: null,
            nextNode
        }
    }

    /**
     * Visits a VariableSetNode and returns its AST representation.
     */
    private visitSetVariable(node: Visit<VariableSetNode>): VisitResult {
        let variableName = node.data.data.name;
        let variableValue = node.data.data.value;

        if (!variableName) {
            throw new Error(`VariableSetNode ${node.nodeId} is missing variable name.`);
        }
        if (!variableValue) {
            throw new Error(`VariableSetNode ${node.nodeId} is missing variable value.`);
        }

        let children = this.getChildrenOfNode(node.nodeId);
        let nextNode: string | null = null;
        if (children.length == 1) {
            nextNode = children[0].id; // Take the first child as the next node
        } else if (children.length > 1) {
            this.pushWarning(node.currentAst, `VariableSetNode ${node.nodeId} has multiple children, only the first will be considered.`);
            nextNode = children[0].id; // Take the first child
        }

        return {
            ast: {
                type: INodeTypeEnum.SetVariable,
                data: {
                    name: variableName,
                    value: this.visitTypedInput(variableValue),
                },
            },
            nextNode,
        };
    }

    /**
     * Visits a CustomCodeNode and returns its AST representation.
     */
    private visitCustomCode(node: Visit<CustomCodeNode>): VisitResult {
        let code = node.data.data.code;

        if (code === undefined) {
            throw new Error(`CustomCodeNode ${node.nodeId} is missing code.`);
        }

        let children = this.getChildrenOfNode(node.nodeId);
        let nextNode: string | null = null;
        if (children.length == 1) {
            nextNode = children[0].id; // Take the first child as the next node
        } else if (children.length > 1) {
            this.pushWarning(node.currentAst, `CustomCodeNode ${node.nodeId} has multiple children, only the first will be considered.`);
            nextNode = children[0].id; // Take the first child
        }

        return {
            ast: {
                type: INodeTypeEnum.CustomCode,
                data: {
                    code: code,
                },
            },
            nextNode,
        };
    }

    /**
     * Visits a IfStatement and returns its AST representation.
     */
    private visitIfCondition(node: Visit<IfConditionNode>): VisitResult {
        // Find the block, continuation statement and end condition nodes from children
        let children = this.getChildrenOfNode(node.nodeId);
        let bodyStart: string | null = null;
        let elseifNodeIds: string[] = [];
        let elseNodeId: string | null = null;
        let endNodeId: string | null = null;

        for (const child of children) {
            const childData = this.getAuxDataForNode(child.id);
            switch (childData.type) {
                case NodeTypeEnum.ElseIfCondition:
                    elseifNodeIds.push(child.id);
                    break;
                case NodeTypeEnum.ElseCondition:
                    if (elseNodeId) {
                        this.pushWarning(node.currentAst, `IfCondition ${node.nodeId} has multiple Else nodes, only the first will be considered.`);
                    } else {
                        elseNodeId = child.id;
                    }
                    break;
                case NodeTypeEnum.EndCondition:
                    if (endNodeId) {
                        this.pushWarning(node.currentAst, `IfCondition ${node.nodeId} has multiple End nodes, only the first will be considered.`);
                    } else {
                        endNodeId = child.id;
                    }
                    break;
                default:
                    if (bodyStart) {
                        this.pushWarning(node.currentAst, `IfCondition ${node.nodeId} has multiple Block nodes, only the first will be considered.`);
                    } else {
                        bodyStart = child.id;
                    }
                    break;
            }
        }

        // Sort the elseif nodes by their index
        elseifNodeIds.sort((a, b) => {
            const aData = this.getAuxDataForNode(a);
            const bData = this.getAuxDataForNode(b);
            if (aData.type !== NodeTypeEnum.ElseIfCondition || bData.type !== NodeTypeEnum.ElseIfCondition) {
                throw new Error(`Expected ElseIfCondition nodes, but got ${aData.type} and ${bData.type}`);
            }
            return aData.data.index - bData.data.index;
        });

        let bodyNodes: INode[] = [];
        if (bodyStart) {
            bodyNodes = this.visitNodeAndChildren(node.currentAst, bodyStart);
        }

        let elseIfs: IElseIf[] = [];
        for (const elseifId of elseifNodeIds) {
            const elseifData = this.getAuxDataForNode(elseifId);
            if (elseifData.type !== NodeTypeEnum.ElseIfCondition) {
                throw new Error(`Expected ElseIfCondition node, but got ${elseifData.type}`);
            }

            // Get the outgoing nodes from the elseif node
            const elseifChildren = this.getChildrenOfNode(elseifId);
            if (elseifChildren.length !== 1) {
                this.pushWarning(node.currentAst, `ElseIfCondition ${elseifId} has multiple outgoing connections, only the first will be considered.`);
            }

            if (elseifChildren.length === 0) {
                throw new Error(`ElseIfCondition ${elseifId} has no outgoing connections.`);
            }

            elseIfs.push({
                condition: elseifData.data.condition,
                body: this.visitNodeAndChildren(node.currentAst, elseifChildren[0].id),
            });
        }

        let elseBlock: INode[] | undefined = undefined;
        if (elseNodeId) {
            const elseData = this.getAuxDataForNode(elseNodeId);
            if (elseData.type !== NodeTypeEnum.ElseCondition) {
                throw new Error(`Expected ElseCondition node, but got ${elseData.type}`);
            }
            const elseChildren = this.getChildrenOfNode(elseNodeId);
            if (elseChildren.length !== 1) {
                this.pushWarning(node.currentAst, `ElseCondition ${elseNodeId} has multiple outgoing connections, only the first will be considered.`);
            }
            elseBlock = this.visitNodeAndChildren(node.currentAst, elseChildren[0].id);
        }

        if (!endNodeId) {
            throw new Error(`IfCondition ${node.nodeId} is missing a/an matching EndCondition node.`);
        }

        let endChildren = this.getChildrenOfNode(endNodeId);
        if (endChildren.length > 1) {
            this.pushWarning(node.currentAst, `EndCondition ${endNodeId} has multiple outgoing connections, only the first will be considered.`);
        }

        let nextNode: string | null = endChildren.length > 0 ? endChildren[0].id : null;

        return {
            ast: {
                type: INodeTypeEnum.IfCondition,
                data: {
                    condition: node.data.data.condition,
                    body: bodyNodes,
                    elseifs: elseIfs.length > 0 ? elseIfs : undefined,
                    else: elseBlock,
                },
            },
            nextNode, // The next node is the EndCondition's first child, if any
        }
    }

    /**
     * Visits a ForLoop and returns its AST representation.
     */
    private visitForLoop(node: Visit<ForLoopNode>): VisitResult {
        // Find the block, continuation statement and end condition nodes from children
        let children = this.getChildrenOfNode(node.nodeId);
        let bodyStart: string | null = null;
        let endNodeId: string | null = null;

        for (const child of children) {
            const childData = this.getAuxDataForNode(child.id);
            switch (childData.type) {
                case NodeTypeEnum.EndCondition:
                    if (endNodeId) {
                        this.pushWarning(node.currentAst, `ForLoop ${node.nodeId} has multiple End nodes, only the first will be considered.`);
                    } else {
                        endNodeId = child.id;
                    }
                    break;
                default:
                    if (bodyStart) {
                        this.pushWarning(node.currentAst, `ForLoop ${node.nodeId} has multiple Block nodes, only the first will be considered.`);
                    } else {
                        bodyStart = child.id;
                    }
                    break;
            }
        }

        let bodyNodes: INode[] = [];
        if (bodyStart) {
            bodyNodes = this.visitNodeAndChildren(node.currentAst, bodyStart);
        }

        if (!endNodeId) {
            throw new Error(`ForLoop ${node.nodeId} is missing a/an matching EndCondition node.`);
        }

        let endChildren = this.getChildrenOfNode(endNodeId);
        if (endChildren.length > 1) {
            this.pushWarning(node.currentAst, `EndCondition ${endNodeId} has multiple outgoing connections, only the first will be considered.`);
        }

        let nextNode: string | null = endChildren.length > 0 ? endChildren[0].id : null;

        return {
            ast: {
                type: INodeTypeEnum.ForLoop,
                data: {
                    condition: this.visitForLoopType(node.data.data.condition),
                    body: bodyNodes,
                },
            },
            nextNode, // The next node is the EndCondition's first child, if any
        }
    }

    /**
     * Visits a TypedInput value and returns its AST representation.
     * @param value The TypedInput value to convert to AST.
     * @returns The AST representation of the TypedInput value.
     */
    private visitTypedInput(value: TypedInput): ITypedInput {
        switch (value.type) {
            case TypedInputEnum.String:
                return {
                    type: ITypedInputEnum.String,
                    value: value.value,
                }
            case TypedInputEnum.Number:
                return {
                    type: ITypedInputEnum.Number,
                    value: value.value,
                }
            case TypedInputEnum.Table:
                return {
                    type: ITypedInputEnum.Table,
                    value: value.value
                }
            case TypedInputEnum.Boolean:
                return {
                    type: ITypedInputEnum.Boolean,
                    value: value.value,
                }
            case TypedInputEnum.Raw:
                return {
                    type: ITypedInputEnum.Raw, // Raw is treated as a string in AST
                    value: value.value,
                }
        }
    }

    /**
     * Visits a ForLoopType value and returns its AST representation.
     * @param value The ForLoopType value to convert to AST.
     * @returns The AST representation of the ForLoopType value.
     */
    private visitForLoopType(value: ForLoopType): IForLoopType {
        switch (value.type) {
            case ForLoopTypeEnum.GeneralizedIteration:
                return {
                    type: IForLoopTypeEnum.GeneralizedIteration,
                    varbinds: value.varbinds,
                    iterable: this.visitTypedInput(value.iterable),
                };
            case ForLoopTypeEnum.Range:
                return {
                    type: IForLoopTypeEnum.Range,
                    varbind: value.varbind,
                    start: value.start,
                    end: value.end,
                    step: value.step, // Optional step value
                };
            case ForLoopTypeEnum.Raw:
                return {
                    type: IForLoopTypeEnum.Raw,
                    condition: value.condition, // Raw condition for the loop
                };
        }
    }

    /**
     * Returns the auxilliary data for the given node ID.
     * @param nodeId The ID of the node to get auxiliary data for.
     * @returns The auxiliary data for the node.
     */
    private getAuxDataForNode(nodeId: string): NodeExtData {
        const data = this.auxData[nodeId];
        if (!data) {
            throw new Error(`Auxiliary data not found for node ${nodeId}`);
        }
        return data;
    }

    /**
     * Returns the AST representation of a CommandArgument.
     * @param arg The CommandArgument to convert to AST.
     * @returns The AST representation of the CommandArgument.
     */
    private visitCommandArgumentNode(currentAst: CodeGenAST, arg: CommandArgumentNode): ICommandArgument {
        let res = baseCommandNodeSchema.safeParse(arg.data); // Validate the argument structure

        if(res.error) {
            this.pushError(currentAst, z.prettifyError(res.error));
        }

        const cmdArgTypeMap = {
            [CommandArgumentType.String]: ICommandArgumentType.String,
            [CommandArgumentType.Integer]: ICommandArgumentType.Integer,
            [CommandArgumentType.Boolean]: ICommandArgumentType.Boolean,
            [CommandArgumentType.User]: ICommandArgumentType.User,
            [CommandArgumentType.Channel]: ICommandArgumentType.Channel,
            [CommandArgumentType.Role]: ICommandArgumentType.Role,
            [CommandArgumentType.Member]: ICommandArgumentType.Member,
        }

        let type = cmdArgTypeMap[arg.data.type];
        if (!type) {
            throw new Error(`Unknown CommandArgumentType ${arg.data.type} for argument ${arg.data.name} in command argument \`${arg.data.name}\``);
        }

        return {
            type,
            name: arg.data.name,
            description: arg.data.description,
            required: arg.data.required,
        }
    }
}