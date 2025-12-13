import { Edge, XYPosition, Node } from '@xyflow/react';
import { TypedInput, TypedInputEnum } from './data';

export enum SubnodeTypeEnum {
	OutputNode = 'OutputNode',
	TypedInputNode = 'NumberNode', // done
	AndNode = 'AndNode',
	OrNode = 'OrNode',
	NotNode = 'NotNode',
	ParensNode = 'ParensNode',
	UnknownNode = 'UnknownNode'
}

export interface OutputNode {
	type: SubnodeTypeEnum.OutputNode;
}

export interface TypedInputNode {
	type: SubnodeTypeEnum.TypedInputNode;
	value: TypedInput;
}

export interface AndNode {
	type: SubnodeTypeEnum.AndNode;
}

export interface OrNode {
	type: SubnodeTypeEnum.OrNode;
}

export interface NotNode {
	type: SubnodeTypeEnum.NotNode;
}

export interface UnknownNode {
	type: SubnodeTypeEnum.UnknownNode;
}

export interface ParensNode {
	type: SubnodeTypeEnum.ParensNode;
}

export type SubflowNodeData = OutputNode | TypedInputNode | AndNode | OrNode | NotNode | ParensNode | UnknownNode;

export type SubflowNodeExtData = SubflowNodeData & Record<string, unknown>;

export interface SubflowData {
	nodes: Node<SubflowNodeExtData>[];
	edges: Edge[];
}

export type SubflowNodeType = Node<SubflowNodeExtData>;

export const defaultNodeDataForType: Record<string, SubflowNodeExtData> = {
	unknown: {
		type: SubnodeTypeEnum.UnknownNode
	},
	output: {
		type: SubnodeTypeEnum.OutputNode
	},
	typedinput: {
		type: SubnodeTypeEnum.TypedInputNode,
		value: {
			type: TypedInputEnum.Nil
		}
	},
	and: {
		type: SubnodeTypeEnum.AndNode
	},
	or: {
		type: SubnodeTypeEnum.OrNode
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
