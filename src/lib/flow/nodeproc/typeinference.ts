import { ForLoopNode, ForLoopTypeEnum, NodeTypeEnum, TypedInput, TypedInputEnum, VariableSetNode } from "../data";
import { BaseUpwardNodeProcessor, BaseUpwardNodeProcessorVisit } from "./basenodeproc";

export interface InferredVariable {
    name: string;
    type: string; // Type of the variable, e.g., "string", "number", etc (can be 'unknown' if not inferable).
}

/**
 * To be expanded
 */
export interface TypeInferrerState {}

/** 
 * Utility to attempt to perform basic type inferrence of variables within a scope in the flow given by node id by following the path
 */
export class TypeInferrer extends BaseUpwardNodeProcessor<TypeInferrerState, InferredVariable[]> {
    protected getInitialState(): TypeInferrerState {
        return {};
    }

    protected getInitialOutput(): InferredVariable[] {
        return [];
    }

    protected mergeOutputs(a: InferredVariable[], b: InferredVariable[]): InferredVariable[] {
        // If we already have the variable in 'a', then do nothing as we are now at a earlier scope.
        // Otherwise, add it to the output.
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
    protected visitNode(state: TypeInferrerState, currentOutput: InferredVariable[], nodeId: string): InferredVariable[] {
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
    private addVariablesFromSetVariable(data: BaseUpwardNodeProcessorVisit<TypeInferrerState, InferredVariable[], VariableSetNode>): InferredVariable[] {
        if (data.data.data.variable_name) {
            return this.mergeOutputs(
                data.currentOutput,
                [
                    {
                        name: data.data.data.variable_name,
                        type: data.data.data.variable_value ? this.inferFromTypedInput(data.data.data.variable_value) : "unknown"
                    }
                ]
            );
        }

        return data.currentOutput;
    }

    /**
     * Adds variables from a ForLoop node.
     */
    private addVariablesFromForLoop(data: BaseUpwardNodeProcessorVisit<TypeInferrerState, InferredVariable[], ForLoopNode>): InferredVariable[] {
        switch (data.data.data.condition.type) {
            case ForLoopTypeEnum.GeneralizedIteration:
                return this.mergeOutputs(data.currentOutput, data.data.data.condition.varbinds.map(varbind => {
                    return { name: varbind, type: "unknown" }; // Generalized iteration does not specify types
                }));
            case ForLoopTypeEnum.Range:
                return this.mergeOutputs(data.currentOutput, [
                    {
                        name: data.data.data.condition.varbind,
                        type: "number", // Range loops are numeric
                    }
                ]);
            case ForLoopTypeEnum.Raw:
                // Raw loops may not define variables, so we return an empty array.
                return data.currentOutput;
            default:
                // Unknown loop type, return empty.
                return data.currentOutput;
        }
    }

    /**
     * Add variables from a CustomCode node.
     * 
     * This function right now clears the entire current output as CustomCode nodes may redefine variables.
     */
    private addVariablesFromCustomCode(_data: BaseUpwardNodeProcessorVisit<TypeInferrerState, InferredVariable[], any>): InferredVariable[] {
        return []; // Clear current output as CustomCode may redefine variables
    }

    private inferFromTypedInput(typedInput: TypedInput): string {
        switch (typedInput.type) {
            case TypedInputEnum.String:
                return "string";
            case TypedInputEnum.Number:
                return "number";
            case TypedInputEnum.Table:
                return "table";
            case TypedInputEnum.Boolean:
                return "boolean";
            case TypedInputEnum.Raw:
                return "unknown";
            default:
                return "unknown";
        }
    }
}