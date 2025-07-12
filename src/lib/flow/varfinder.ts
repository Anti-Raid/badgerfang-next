import logger from "../logger";
import { FlowContext } from "./context";
import { ForLoopNode, ForLoopTypeEnum, NodeData, NodeTypeEnum, VariableSetNode } from "./data";
import { Node, Edge } from "@xyflow/react";

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
     * The variables found in the current visit.
     */
    variables: string[];
}

/** 
 * Utility to find all variables within a scope in the flow given by node id by following the path 
 * up the chain 
 */
export class VarFinder {
    private context: FlowContext;
    private nodes: Node<NodeData>[];
    private edges: Edge[];

    constructor(context: FlowContext, nodes: Node<NodeData>[], edges: Edge[]) {
        this.context = context;
        this.nodes = nodes;
        this.edges = edges;
    }

    /**
     * Finds all variables in the flow starting from a given node ID.
     * 
     * This works by going upwards in the flow graph, starting from the given node ID
     * hence ensuring that we only find variables that are defined in the current scope.
     * 
     * @param nodeId The ID of the node to start from.
     */
    public findVariables(nodeId: string): string[] {
        let variables: string[] = [];
        const visitedNodes = new Set<string>();
        const stack: string[] = [nodeId];
        for(const node of stack) {
            if (!node || visitedNodes.has(node)) continue;
            visitedNodes.add(node);

            // Visit the node and collect variables
            const visitResult = this.visitNode(node);
            for(let variable of visitResult.variables) {
                if(!variables.includes(variable)) {
                    variables.push(variable);
                }
            }

            // Add source nodes
            let srcNodes = this.nodes.filter(n => n.id === node).map(n => n.id);
            if(srcNodes.length > 1) {
                logger.warn("VarFinder", `Multiple source nodes found for node ${node}. This may lead to unexpected results.`);
            }
            stack.concat(srcNodes)
        }

        return variables;
    }

    /**
     * Given a single node, adds all variables to the set.
     */
    private visitNode(nodeId: string): VisitResult {
        const data = this.context.getData(nodeId);
        if (!data) return { variables: [] };

        switch (data.type) {
            case NodeTypeEnum.SetVariable:
                return this.addVariablesFromSetVariable({ nodeId, data });
            case NodeTypeEnum.ForLoop:
                return this.addVariablesFromForLoop({ nodeId, data });
            default:
                // For other node types, we don't extract variables.
                return { variables: [] };
        }
    }

    /**
     * Adds variables from a SetVariable node.
     */
    private addVariablesFromSetVariable(data: Visit<VariableSetNode>): VisitResult {
        if (data.data.data.variable_name) {
            return { variables: [data.data.data.variable_name] };
        }

        return { variables: [] };
    }

    /**
     * Adds variables from a ForLoop node.
     */
    private addVariablesFromForLoop(data: Visit<ForLoopNode>): VisitResult {
        switch (data.data.data.condition.type) {
            case ForLoopTypeEnum.GeneralizedIteration:
                return { variables: data.data.data.condition.varbinds };
            case ForLoopTypeEnum.Range:
                return { variables: [data.data.data.condition.varbind] };
            case ForLoopTypeEnum.Raw:
                // Raw loops may not define variables, so we return an empty array.
                return { variables: [] };
            default:
                // Unknown loop type, return empty.
                return { variables: [] };
        }
    }
}