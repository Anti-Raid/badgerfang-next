import { CommandNode, LibraryNode, NodeTypeEnum } from "../data";
import { BaseUpwardNodeProcessor } from "./basenodeproc";

/** 
 * Utility to find the start in a flow given by node id by following the path 
 * up the chain 
 */
export class LibraryNodeFinder extends BaseUpwardNodeProcessor<null, LibraryNode | null> {
    protected getInitialState(): null {
        return null; // We have no state to maintain.
    }

    protected getInitialOutput(): LibraryNode | null {
        return null; // No start node found initially.
    }

    protected visitNode(_state: null, currentOutput: LibraryNode | null, nodeId: string): [LibraryNode | null, boolean] {
        if (currentOutput) {
            return [currentOutput, false]; // If we already found the target node, return it and don't continue.
        }
        const data = this.context.getData(nodeId);
        if (!data) return [currentOutput, true]; // Passthrough and continue

        switch (data.type) {
            case NodeTypeEnum.LibraryNode:
                return [data, false]; 
            default:
                // For other node types, just passthrough the current output.
                return [currentOutput, true];
        }
    }
}

/** 
 * Utility to find the start in a flow given by node id by following the path 
 * up the chain 
 */
export class CommandNodeFinder extends BaseUpwardNodeProcessor<null, CommandNode | null> {
    protected getInitialState(): null {
        return null; // We have no state to maintain.
    }

    protected getInitialOutput(): CommandNode | null {
        return null; // No start node found initially.
    }

    protected visitNode(_state: null, currentOutput: CommandNode | null, nodeId: string): [CommandNode | null, boolean] {
        if (currentOutput) {
            return [currentOutput, false]; // If we already found the target node, return it and don't continue.
        }
        const data = this.context.getData(nodeId);
        if (!data) return [currentOutput, true]; // Passthrough and continue

        switch (data.type) {
            case NodeTypeEnum.CommandNode:
                return [data, false];
            default:
                // For other node types, just passthrough the current output.
                return [currentOutput, true];
        }
    }
}