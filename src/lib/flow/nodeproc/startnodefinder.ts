import { CommandNode, LibraryNode, NodeExtData, NodeTypeEnum } from '../data';
import { BaseUpwardNodeProcessor } from './basenodeproc';
import { Node } from '@xyflow/react';

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

	protected visitNode(
		_state: null,
		currentOutput: LibraryNode | null,
		node: Node<NodeExtData>
	): [LibraryNode | null, boolean] {
		if (currentOutput) {
			return [currentOutput, false]; // If we already found the target node, return it and don't continue.
		}

		switch (node.data.type) {
			case NodeTypeEnum.LibraryNode:
				return [node.data, false];
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

	protected visitNode(
		_state: null,
		currentOutput: CommandNode | null,
		node: Node<NodeExtData>
	): [CommandNode | null, boolean] {
		if (currentOutput) {
			return [currentOutput, false]; // If we already found the target node, return it and don't continue.
		}

		switch (node.data.type) {
			case NodeTypeEnum.CommandNode:
				return [node.data, false];
			default:
				// For other node types, just passthrough the current output.
				return [currentOutput, true];
		}
	}
}
