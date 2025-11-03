import { Edge, XYPosition, Node } from '@xyflow/react';

export interface OutputNode {
	type: 'OutputNode';
}

export interface NumberNode {
	type: 'NumberNode';
	value: number;
}

export interface UnknownNode {
	type: 'UnknownNode';
}

export type SubflowNodeData = OutputNode | NumberNode | UnknownNode;

export type SubflowNodeExtData = SubflowNodeData & Record<string, unknown>;

export interface SubflowData {
	nodes: Node<SubflowNodeExtData>[];
	edges: Edge[];
}

export type SubflowNodeType = Node<SubflowNodeExtData>;

export const defaultNodeDataForType: Record<string, SubflowNodeExtData> = {
	unknown: {
		type: 'UnknownNode'
	}
};

export function createSNode(
	type: string,
	position: XYPosition,
	data?: SubflowNodeExtData,
	parent?: string
): Node<SubflowNodeExtData> {
	const id = getNodeId();

	let node: Node<SubflowNodeExtData> = {
		id,
		type,
		position,
		data: data ? data : defaultNodeDataForType[type] || defaultNodeDataForType['unknown']
	};

	if (parent) {
		node.parentId = parent;
		node.expandParent = true;
		node.extent = 'parent';
	}

	return node;
}

export function getUniqueId(): number {
	return Math.floor(Math.random() * 1000000);
}

export function getNodeId(): string {
	return `snode:${getUniqueId().toString()}`;
}

export function getEdgeId(): string {
	return `sedge:${getUniqueId().toString()}`;
}
