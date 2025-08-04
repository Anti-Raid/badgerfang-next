import {
	CommandArgumentNode,
	CommandArgumentType,
	CustomCodeNode,
	ForLoopNode,
	ForLoopTypeEnum,
	NodeExtData,
	NodeTypeEnum,
	TypedInput,
	TypedInputEnum,
	VariableSetNode
} from '../data';
import { BaseUpwardNodeProcessor, BaseUpwardNodeProcessorVisit } from './basenodeproc';
import { Node } from '@xyflow/react';

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
		for (let variable of b) {
			for (let existing of a) {
				if (existing.name === variable.name) {
					continue; // Variable already exists, skip adding it again.
				}
			}

			// Add the variable to the output
			a.push(variable);
		}

		return a;
	}

	/**
	 * Given a single node, adds all variables to the set.
	 */
	protected visitNode(
		state: TypeInferrerState,
		currentOutput: InferredVariable[],
		node: Node<NodeExtData>
	): [InferredVariable[], boolean] {
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
				return this.addVariablesFromCommandArgumentNode({
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
		data: BaseUpwardNodeProcessorVisit<TypeInferrerState, InferredVariable[], VariableSetNode>
	): InferredVariable[] {
		if (data.data.data.name) {
			return this.mergeOutputs(data.currentOutput, [
				{
					name: data.data.data.name,
					type: data.data.data.value ? this.inferFromTypedInput(data.data.data.value) : 'unknown'
				}
			]);
		}

		return data.currentOutput;
	}

	/**
	 * Adds variables from a ForLoop node.
	 */
	private addVariablesFromForLoop(
		data: BaseUpwardNodeProcessorVisit<TypeInferrerState, InferredVariable[], ForLoopNode>
	): InferredVariable[] {
		switch (data.data.data.condition.type) {
			case ForLoopTypeEnum.GeneralizedIteration:
				return this.mergeOutputs(
					data.currentOutput,
					data.data.data.condition.varbinds.map((varbind) => {
						return { name: varbind, type: 'unknown' }; // Generalized iteration does not specify types
					})
				);
			case ForLoopTypeEnum.Range:
				return this.mergeOutputs(data.currentOutput, [
					{
						name: data.data.data.condition.varbind,
						type: 'number' // Range loops are numeric
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
	 * Right now, this just passes through the current output and then tells the processor to stop processing upwards if flow-redefines-vars is marked at the top of the code.
	 */
	private addVariablesFromCustomCode(
		data: BaseUpwardNodeProcessorVisit<TypeInferrerState, InferredVariable[], CustomCodeNode>
	): [InferredVariable[], boolean] {
		return [data.currentOutput, !data.data.data.code.startsWith('--@flow-redefines-vars')]; // We need to stop processing upwards as CustomCode may redefine variables [so anything above it is not relevant]
	}

	/**
	 * Add variables from a CommandArgument node.
	 *
	 * Right now, this just passes through the current output and then tells the processor to stop processing upwards if flow-redefines-vars is marked at the top of the code.
	 */
	private addVariablesFromCommandArgumentNode(
		data: BaseUpwardNodeProcessorVisit<TypeInferrerState, InferredVariable[], CommandArgumentNode>
	): [InferredVariable[], boolean] {
		let type = 'unknown'; // Default type if not specified
		switch (data.data.data.type) {
			case CommandArgumentType.String:
				type = 'string';
				break;
			case CommandArgumentType.Integer:
				type = 'number';
				break;
			case CommandArgumentType.Boolean:
				type = 'boolean';
				break;
			case CommandArgumentType.Channel:
				type = 'string'; // Channel ID
				break;
			case CommandArgumentType.Role:
				type = 'string'; // Role ID
				break;
			case CommandArgumentType.User:
				type = 'string'; // User ID
				break;
			case CommandArgumentType.Member:
				type = 'string'; // User ID
				break;
		}

		return [
			this.mergeOutputs(data.currentOutput, [
				{
					name: data.data.data.name,
					type: type
				}
			]),
			true // Continue processing upwards
		];
	}

	private inferFromTypedInput(typedInput: TypedInput): string {
		switch (typedInput.type) {
			case TypedInputEnum.String:
				return 'string';
			case TypedInputEnum.Number:
				return 'number';
			case TypedInputEnum.Table:
				return 'table';
			case TypedInputEnum.Boolean:
				return 'boolean';
			case TypedInputEnum.Raw:
				return 'unknown';
			default:
				return 'unknown';
		}
	}
}
