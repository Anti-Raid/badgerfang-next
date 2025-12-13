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

/**
 * Construct a subflow node object with default data and optional parent linkage.
 *
 * @param type - The node type key used to select default node data when `data` is not provided.
 * @param position - The node's position in the canvas.
 * @param data - Optional explicit node data; when omitted a default for `type` (or the unknown default) is used.
 * @param parent - Optional parent node id; when provided the node will be attached to that parent (`parentId` set, `expandParent` true, and `extent` set to `'parent'`).
 * @returns The newly created Node<SubflowNodeExtData>.
 */
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

/**
 * Generates a pseudo-random integer identifier.
 *
 * @returns An integer between 0 and 999,999 inclusive.
 */
export function getUniqueId(): number {
	return Math.floor(Math.random() * 1000000);
}

/**
 * Generate a new unique identifier for a subnode.
 *
 * @returns A string in the form `snode:<number>` where `<number>` is a generated integer identifier.
 */
export function getNodeId(): string {
	return `snode:${getUniqueId().toString()}`;
}

/**
 * Generate a unique identifier for a subflow edge.
 *
 * @returns A string in the form `sedge:<number>`, where `<number>` is a pseudo-random integer between 0 and 999,999.
 */
export function getEdgeId(): string {
	return `sedge:${getUniqueId().toString()}`;
}