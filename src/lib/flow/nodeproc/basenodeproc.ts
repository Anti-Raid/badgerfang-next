import { Edge, getIncomers, Node } from "@xyflow/react";
import { FlowContext } from "../context";
import { NodeData, NodeTypeEnum } from "../data";
import logger from "@/lib/logger";

export interface BaseUpwardNodeProcessorVisit<State, Output, T> {
    /**
     * The current state of the processor.
     */
    state: State;
    /**
     * The current output of the processor.
     */
    currentOutput: Output;
    /**
     * The ID of the node being visited.
     */
    nodeId: string;
    /**
     * The data associated with the node being visited.
     */
    data: T;
}

/**
 * Base class for processing nodes in a flow upwards to the root
 */
export abstract class BaseUpwardNodeProcessor<State, Output> {
    protected context: FlowContext;
    protected nodes: Node<NodeData>[];
    protected edges: Edge[];

    constructor(context: FlowContext, nodes: Node<NodeData>[], edges: Edge[]) {
        this.context = context;
        this.nodes = nodes;
        this.edges = edges;
    }

    /**
     * Executes the upward node processor flow starting from a given node ID.
     * 
     * This works by going upwards in the flow graph, starting from the given node ID
     * hence ensuring that we only trace the path of the current scope.
     * 
     * @param nodeId The ID of the node to start from.
     */
    public execute(nodeId: string): Output {
        let state: State = this.getInitialState();
        let output: Output = this.getInitialOutput();
        const visitedNodes = new Set<string>();
        const stack: string[] = [nodeId];
        let continueFlag = true; // Flag to stop processing if needed
        for(const node of stack) {
            if (!node || visitedNodes.has(node)) {
                logger.warn("BaseUpwardNodeProcessor", `Skipping node ${node} as it is already visited or invalid.`);
            };
            visitedNodes.add(node);

            // Visit the node and collect outputs
            [output, continueFlag] = this.visitNode(state, output, node);

            if (!continueFlag) {
                logger.debug("BaseUpwardNodeProcessor", `Stopping processing at node ${node} as per visitNode return value.`);
                break; // Stop processing if visitNode indicates to stop
            }

            // Add source nodes
            let srcNodes = getIncomers({ id: node }, this.nodes, this.edges).map(n => n.id);
            if(srcNodes.length > 1) {
                // Check if CommandNode, if so, this is fully expected
                if (this.context.getData(node)?.type !== NodeTypeEnum.CommandNode) {
                    // Otherwise, log a warning
                    logger.warn("BaseUpwardNodeProcessor", `Multiple source nodes found for node ${node}. This may lead to unexpected results.`);
                }
            }
            stack.concat(srcNodes)
        }

        return output;
    }

    /**
     * Performs the action on a sigle node and returns the output.
     * 
     * The second return value indicates whether the processor should continue processing (true) or not (false)
     */
    protected abstract visitNode(state: State, currentOutput: Output, nodeId: string): [Output, boolean];

    /**
     * Returns the starting value for the output.
     */
    protected abstract getInitialOutput(): Output;

    /**
     * Returns the initial state that will be passed to all invocations of visitNode.
     */
    protected abstract getInitialState(): State;

}