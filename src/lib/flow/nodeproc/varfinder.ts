import { ForLoopNode, ForLoopTypeEnum, NodeTypeEnum, VariableSetNode } from "../data";
import { BaseUpwardNodeProcessor, BaseUpwardNodeProcessorVisit } from "./basenodeproc";

/** 
 * Utility to find all variables within a scope in the flow given by node id by following the path 
 * up the chain 
 */
export class VarFinder extends BaseUpwardNodeProcessor<null, string[]> {
    protected getInitialState(): null {
        return null; // We have no state to maintain.
    }

    protected getInitialOutput(): string[] {
        return [];
    }

    private mergeOutputs(a: string[], b: string[]): string[] {
        for(let variable of b) {
            if(!a.includes(variable)) {
                a.push(variable);
            }
        }

        return a;
    }

    /**
     * Given a single node, adds all variables to the set.
     */
    protected visitNode(state: null, currentOutput: string[], nodeId: string): string[] {
        const data = this.context.getData(nodeId);
        if (!data) return currentOutput;

        switch (data.type) {
            case NodeTypeEnum.SetVariable:
                return this.addVariablesFromSetVariable({ state, currentOutput, nodeId, data });
            case NodeTypeEnum.ForLoop:
                return this.addVariablesFromForLoop({ state, currentOutput, nodeId, data });
            default:
                // For other node types, we don't extract variables.
                return currentOutput;
        }
    }

    /**
     * Adds variables from a SetVariable node.
     */
    private addVariablesFromSetVariable(data: BaseUpwardNodeProcessorVisit<null, string[], VariableSetNode>): string[] {
        if (data.data.data.variable_name) {
            return this.mergeOutputs(data.currentOutput, [data.data.data.variable_name])
        }

        return data.currentOutput;
    }

    /**
     * Adds variables from a ForLoop node.
     */
    private addVariablesFromForLoop(data: BaseUpwardNodeProcessorVisit<null, string[], ForLoopNode>): string[] {
        switch (data.data.data.condition.type) {
            case ForLoopTypeEnum.GeneralizedIteration:
                return this.mergeOutputs(data.currentOutput, data.data.data.condition.varbinds);
            case ForLoopTypeEnum.Range:
                return this.mergeOutputs(data.currentOutput, [data.data.data.condition.varbind]);
            case ForLoopTypeEnum.Raw:
                // Raw loops may not define variables, so we preserve the current output.
                return data.currentOutput;
            default:
                // Unknown loop type, so we preserve the current output.
                return data.currentOutput;
        }
    }
}