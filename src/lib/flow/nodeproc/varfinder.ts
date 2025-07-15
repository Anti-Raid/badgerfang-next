import { Node } from '@xyflow/react';
import {
	CommandArgumentNode,
	CustomCodeNode,
	ForLoopNode,
	ForLoopTypeEnum,
	NodeExtData,
	NodeTypeEnum,
	VariableSetNode
} from '../data';
import { BaseUpwardNodeProcessor, BaseUpwardNodeProcessorVisit } from './basenodeproc';

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
		for (let variable of b) {
			if (!a.includes(variable)) {
				a.push(variable);
			}
		}

		return a;
	}

	/**
	 * Given a single node, adds all variables to the set.
	 */
	protected visitNode(
		state: null,
		currentOutput: string[],
		node: Node<NodeExtData>
	): [string[], boolean] {
		switch (node.data.type) {
			case NodeTypeEnum.SetVariable:
				return [
					this.addVariablesFromSetVariable({
						state,
						currentOutput,
						nodeId: node.id,
						data: node.data
					}),
					true
				];
			case NodeTypeEnum.ForLoop:
				return [
					this.addVariablesFromForLoop({ state, currentOutput, nodeId: node.id, data: node.data }),
					true
				];
			case NodeTypeEnum.CustomCode:
				return this.addVariablesFromCustomCode({
					state,
					currentOutput,
					nodeId: node.id,
					data: node.data
				});
			case NodeTypeEnum.CommandArgumentNode:
				return this.addVariablesFromCommandArgument({
					state,
					currentOutput,
					nodeId: node.id,
					data: node.data
				});
			default:
				// For other node types, we don't extract variables.
				return [currentOutput, true];
		}
	}

	/**
	 * Adds variables from a SetVariable node.
	 */
	private addVariablesFromSetVariable(
		data: BaseUpwardNodeProcessorVisit<null, string[], VariableSetNode>
	): string[] {
		if (data.data.data.name) {
			return this.mergeOutputs(data.currentOutput, [data.data.data.name]);
		}

		return data.currentOutput;
	}

	/**
	 * Adds variables from a ForLoop node.
	 */
	private addVariablesFromForLoop(
		data: BaseUpwardNodeProcessorVisit<null, string[], ForLoopNode>
	): string[] {
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

	/**
	 * Add variables from a CustomCode node.
	 *
	 * Right now, this just passes through the current output and then tells the processor to stop processing upwards as CustomCode may redefine variables defined above it.
	 */
	private addVariablesFromCustomCode(
		data: BaseUpwardNodeProcessorVisit<null, string[], CustomCodeNode>
	): [string[], boolean] {
		return [data.currentOutput, !data.data.data.code.startsWith('--@flow-redefines-vars')]; // We need to stop processing upwards as CustomCode may redefine variables [so anything above it is not relevant]
	}

	/**
	 * Add variables from a CommandArgumentNode
	 */
	private addVariablesFromCommandArgument(
		data: BaseUpwardNodeProcessorVisit<null, string[], CommandArgumentNode>
	): [string[], boolean] {
		// CommandArgumentNodes do not define variables, so we just passthrough the current output.
		return [this.mergeOutputs(data.currentOutput, [data.data.data.name]), true];
	}
}
