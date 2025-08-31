import { NodeExtData, NodeTypeEnum } from './data';
import { Node } from '@xyflow/react';

export const startNodeTypes = [NodeTypeEnum.LibraryNode, NodeTypeEnum.CommandNode];

export const findStartNode = (nodes: Node<NodeExtData>[]): Node<NodeExtData> | null => {
	for (const node of nodes) {
		if (startNodeTypes.includes(node.data.type)) {
			return node;
		}
	}
	return null;
};

export const getStartNodeTitle = (node: Node<NodeExtData>): string => {
	switch (node.data.type) {
		case NodeTypeEnum.LibraryNode:
			return `Library \`${node.data.data.name || 'Unnamed'}\``;
		case NodeTypeEnum.CommandNode:
			return `Command \`${node.data.data.name || 'Unnamed'}\``;
		default:
			return `Unknown Start Node: ${node.data.type})`;
	}
};

export const getStartNodeTitleFromNodes = (nodes: Node<NodeExtData>[]): string | null => {
	const startNode = findStartNode(nodes);
	if (!startNode) {
		return null;
	}
	return getStartNodeTitle(startNode);
};
