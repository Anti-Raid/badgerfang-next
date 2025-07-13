import { NodeTypeEnum, StartNodeData } from "../data";
import { BaseUpwardNodeProcessor } from "./basenodeproc";

/** 
 * Utility to find the start in a flow given by node id by following the path 
 * up the chain 
 */
export class StartNodeFinder extends BaseUpwardNodeProcessor<null, StartNodeData | null> {
    protected getInitialState(): null {
        return null; // We have no state to maintain.
    }

    protected getInitialOutput(): StartNodeData | null {
        return null; // No start node found initially.
    }

    protected visitNode(_state: null, currentOutput: StartNodeData | null, nodeId: string): [StartNodeData | null, boolean] {
        if (currentOutput) {
            return [currentOutput, false]; // If we already found a start node, return it and don't continue.
        }
        const data = this.context.getData(nodeId);
        if (!data) return [currentOutput, true]; // Passthrough and continue

        switch (data.type) {
            case NodeTypeEnum.StartNode:
                return [data.data.nodeType, false]; // Return the StartNodeData if this is a StartNode.
            default:
                // For other node types, just passthrough the current output.
                return [currentOutput, true];
        }
    }
}