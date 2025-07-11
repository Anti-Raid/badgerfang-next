import { IfConditionNode, NodeData, NodeExtData, NodeTypeEnum, TypedInput, TypedInputEnum, VariableSetNode } from "../data";
import { Node, Edge, getOutgoers } from "@xyflow/react";
import { IElseIf, INode, INodeTypeEnum, ITypedInput, ITypedInputEnum } from "./ir";

interface Visit<T> {
    /**
     * The ID of the node being visited.
     */
    nodeId: string;
    /**
     * The data associated with the node being visited.
     */
    data: T;
}

interface VisitResult {
    /**
     * The IR representation of the node being visited.
     */
    ir: INode;
    /**
     * The next node to visit in the flow.
     */
    nextNode: string | null;
}

/**
 * Given nodes, edges and auxData, creates the CodeGen IR for the flow.
 */
export class CodeGenIRGenerator {
    private nodes: Node<NodeData>[];
    private edges: Edge[];
    private auxData: Record<string, NodeExtData>;
    private warnings: string[];
    private werror: boolean;

    constructor(nodes: Node<NodeData>[], edges: Edge[], auxData: Record<string, NodeExtData>, werror: boolean = false) {
        this.nodes = nodes;
        this.edges = edges;
        this.auxData = auxData;
        this.warnings = [];
        this.werror = werror;
    }

    /**
     * Generates the IR representation of the flow.
     * @returns An array of IR nodes representing the flow.
     */
    public generate(): INode[] {
        if (this.nodes.length === 0) {
            return []
        }
        return this.visitNodeAndChildren(this.nodes[0].id);
    }

    /**
     * Utility to push a warning to the warnings array.
     * @param message The warning message to push.
     */
    private pushWarning(message: string): void {
        if (this.werror) {
            throw new Error(message);
        }
        this.warnings.push(message);
    }

    /**
     * Helper to return the direct children of a node
     */
    private getChildrenOfNode(nodeId: string): Node<NodeData>[] {
        return getOutgoers({id: nodeId}, this.nodes, this.edges);
    }

    /**
     * Visits a node and returns its IR representation.
     */
    private visitNode(node: Node<NodeData>): VisitResult {
        const data = this.getAuxDataForNode(node.id);

        switch (data.type) {
            case NodeTypeEnum.SetVariable:
                return this.visitSetVariable({ nodeId: node.id, data });
            case NodeTypeEnum.IfCondition:
                return this.visitIfCondition({ nodeId: node.id, data });
            case NodeTypeEnum.ElseIfCondition | NodeTypeEnum.ElseCondition | NodeTypeEnum.EndCondition:
                throw new Error(`An ${data.type} node must be connected to an IfCondition node.`);
            case NodeTypeEnum.UnknownNode:
                this.pushWarning(`Unknown node type: ${data.type} for node ${node.id}`);
            case NodeTypeEnum.ForLoop:
                // ForLoop is not implemented yet
                throw new Error(`ForLoop is not implemented yet for node ${node.id}`);
            default:
                throw new Error(`Unknown node type: ${data.type} for node ${node.id}`);
        }
    }

    /**
     * Helper to continuously visit nodes and their children and return their IR representation
     */
    private visitNodeAndChildren(nodeId: string): INode[] {
        let currentNodeId: string | null = nodeId;
        let irNodes: INode[] = [];
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

            const visitResult = this.visitNode(node);
            irNodes.push(visitResult.ir);
            currentNodeId = visitResult.nextNode;
        }

        return irNodes;
    }

    /**
     * Visits a VariableSetNode and returns its IR representation.
     */
    private visitSetVariable(node: Visit<VariableSetNode>): VisitResult {
        let variableName = node.data.data.variable_name;
        let variableValue = node.data.data.variable_value;

        if (!variableName) {
            throw new Error(`VariableSetNode ${node.nodeId} is missing variable_name.`);
        }
        if (!variableValue) {
            throw new Error(`VariableSetNode ${node.nodeId} is missing variable_value.`);
        }

        let children = this.getChildrenOfNode(node.nodeId);
        let nextNode: string | null = null;
        if (children.length == 1) {
            nextNode = children[0].id; // Take the first child as the next node
        } else if (children.length > 1) {
            this.pushWarning(`VariableSetNode ${node.nodeId} has multiple children, only the first will be considered.`);
            nextNode = children[0].id; // Take the first child
        }

        return {
            ir: {
                type: INodeTypeEnum.SetVariable,
                data: {
                    variable_name: variableName,
                    variable_value: this.visitTypedInput(variableValue),
                },
            },
            nextNode,
        };
    }

    /**
     * Visits a IfStatement and returns its IR representation.
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
                        this.pushWarning(`IfCondition ${node.nodeId} has multiple Else nodes, only the first will be considered.`);
                    } else {
                        elseNodeId = child.id;
                    }
                    break;
                case NodeTypeEnum.EndCondition:
                    if (endNodeId) {
                        this.pushWarning(`IfCondition ${node.nodeId} has multiple End nodes, only the first will be considered.`);
                    } else {
                        endNodeId = child.id;
                    }
                    break;
                default:
                    if (bodyStart) {
                        this.pushWarning(`IfCondition ${node.nodeId} has multiple Block nodes, only the first will be considered.`);
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
            bodyNodes = this.visitNodeAndChildren(bodyStart);
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
                this.pushWarning(`ElseIfCondition ${elseifId} has multiple outgoing connections, only the first will be considered.`);
            }

            if (elseifChildren.length === 0) {
                throw new Error(`ElseIfCondition ${elseifId} has no outgoing connections.`);
            }

            elseIfs.push({
                condition: elseifData.data.condition,
                body: this.visitNodeAndChildren(elseifChildren[0].id),
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
                this.pushWarning(`ElseCondition ${elseNodeId} has multiple outgoing connections, only the first will be considered.`);
            }
            elseBlock = this.visitNodeAndChildren(elseChildren[0].id);
        }

        if (!endNodeId) {
            throw new Error(`IfCondition ${node.nodeId} is missing a/an matching EndCondition node.`);
        }

        let endChildren = this.getChildrenOfNode(endNodeId);
        if (endChildren.length > 1) {
            this.pushWarning(`EndCondition ${endNodeId} has multiple outgoing connections, only the first will be considered.`);
        }

        let nextNode: string | null = endChildren.length > 0 ? endChildren[0].id : null;

        return {
            ir: {
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
     * Visits a TypedInput value and returns its IR representation.
     * @param value The TypedInput value to convert to IR.
     * @returns The IR representation of the TypedInput value.
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
}