// Originated from Kite
// SPDX: GPL-3.0
import { Node, XYPosition } from '@xyflow/react';
import { useMemo } from 'react';
import {
	CommandArgumentType,
	ForLoopTypeEnum,
	NodeExtData,
	NodeTypeEnum,
	TypedInputEnum,
	TypedInputString
} from './data';
import { Node as IDLNode } from './nodeidl/nodeidl';

export interface NodeValues {
  defaultTitle: string;
  defaultDescription: string;
  helpUrl?: string;
}

// ----------------------
// Helper functions
// ----------------------
const createEmptyTypedInputString = (): TypedInputString => ({
	type: TypedInputEnum.String,
	value: '',
	interpolated: false
});

const createEmptyForLoopIterable = (): TypedInputString => createEmptyTypedInputString();

// ----------------------
// Node type definitions
// ----------------------
const unknownNodeType: NodeValues = {
  defaultTitle: 'Unknown',
  defaultDescription: 'Unknown node type.'
};

export const nodeTypes: Record<string, NodeValues> = {
	unknown: unknownNodeType,
	library: {
		defaultTitle: 'Library',
		defaultDescription: 'The starting point of a library.'
	},
	command: {
		defaultTitle: 'Command',
		defaultDescription: 'The starting point of a Discord command.'
	},
	command_argument: {
		defaultTitle: 'Command Argument',
		defaultDescription: 'An argument for a command.'
	},
	set_variable: {
		defaultTitle: 'Set Variable',
		defaultDescription: 'Sets a variable to a value.'
	},
	if_condition: {
		defaultTitle: 'If Condition',
		defaultDescription: 'Executes code based on condition.'
	},
	elseif_condition: {
		defaultTitle: 'Else If Condition',
		defaultDescription: 'Executes code based on condition.'
	},
	end_condition: {
		defaultTitle: 'End Condition/Loop',
		defaultDescription: 'Ends the conditional chain/loop.'
	},
	for_loop: {
		defaultTitle: 'For Loop',
		defaultDescription: 'Executes code in a loop based on condition.'
	},
	while_loop: {
		defaultTitle: 'While Loop',
		defaultDescription: 'Executes code in a loop while condition is true.'
	},
	custom_code: {
		defaultTitle: 'Custom Code',
		defaultDescription: 'Executes custom code.'
	},
	api_node: {
		defaultTitle: 'API Node',
		defaultDescription: 'A node that implements nodeidl schema.'
	},
	group_x: {
		defaultTitle: 'Group',
		defaultDescription: 'Groups nodes together for organization.'
	}
};

// ----------------------
// Default node data
// ----------------------

// ----------------------
// Default node data
// ----------------------
export const defaultNodeDataForType: Record<string, NodeExtData> = {
	unknown: {
		type: NodeTypeEnum.UnknownNode,
		data: {}
	},
	library: {
		type: NodeTypeEnum.LibraryNode,
		data: {
			name: ''
		}
	},
	command: {
		type: NodeTypeEnum.CommandNode,
		data: {
			name: '',
			description: ''
		}
	},
	command_argument: {
		type: NodeTypeEnum.CommandArgumentNode,
		data: {
			name: '',
			description: '',
			type: CommandArgumentType.String,
			required: false
		}
	},
	set_variable: {
		type: NodeTypeEnum.SetVariable,
		data: {
			name: '',
			value: createEmptyTypedInputString()
		}
	},
	if_condition: {
		type: NodeTypeEnum.IfCondition,
		data: {
			condition: {
				type: TypedInputEnum.Nil
			}
		}
	},
	elseif_condition: {
		type: NodeTypeEnum.ElseIfCondition,
		data: {
			condition: {
				type: TypedInputEnum.Nil
			},
			index: 1
		}
	},
	end_condition: {
		type: NodeTypeEnum.EndCondition,
		data: {}
	},
	for_loop: {
		type: NodeTypeEnum.ForLoop,
		data: {
			condition: {
				type: ForLoopTypeEnum.GeneralizedIteration,
				varbinds: [],
				iterable: createEmptyForLoopIterable()
			}
		}
	},
	while_loop: {
		type: NodeTypeEnum.WhileLoop,
		data: {
			condition: {
				type: TypedInputEnum.Nil
			}
		}
	},
	custom_code: {
		type: NodeTypeEnum.CustomCode,
		data: {
			code: ''
		}
	},
	api_node: {
		type: NodeTypeEnum.APINode,
		data: {
			nodeidl: 'test',
			inputValues: {
				type: TypedInputEnum.Nil
			}
		}
	},
	group_x: {
		type: NodeTypeEnum.Group,
		data: {}
	}
};

// TODO: Replace/remove the below once nodeidl is fully integrated
class NodeIDLSet {
	private idls: Map<string, IDLNode>;

	constructor() {
		this.idls = new Map();
	}

	add(a: IDLNode) {
		this.idls.set(a.id, a);
	}

	get(id: string): IDLNode | undefined {
		return this.idls.get(id);
	}
}

export const nodeIdls: NodeIDLSet = new NodeIDLSet();

// ----------------------
// Node value helpers
// ----------------------
export function getNodeValues(nodeType: string): NodeValues {
  const values = nodeTypes[nodeType];
  if (!values) {
    return unknownNodeType;
  }
  return values;
}

/**
 * Retrieve the NodeValues associated with a node type.
 *
 * @param nodeType - The node type key to look up (e.g., "command", "for_loop")
 * @returns The NodeValues for the specified node type; if the type is not recognized, returns the values for the unknown node type
 */
export function useNodeValues(nodeType: string): NodeValues {
  return useMemo(() => getNodeValues(nodeType), [nodeType]);
}

// ----------------------
// Node creation helpers
// ----------------------
// ----------------------
// Node creation helpers
/**
 * Create a new flow node with default data for the specified node type.
 *
 * @param type - The node type key used to select default data when `data` is not provided
 * @param position - The node's XY position in the canvas
 * @param data - Optional explicit node data to use instead of the type defaults
 * @param parent - Optional parent node id; when provided, the returned node will reference the parent and set parent-related layout fields
 * @returns The constructed Node<NodeExtData> populated with id, type, position, data, and parent-related fields when applicable
 */
export function createNode(
  type: string,
  position: XYPosition,
  data?: NodeExtData,
  parent?: string
): Node<NodeExtData> {
  const id = getNodeId();

  let node: Node<NodeExtData> = {
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
 * Generate a pseudo-random integer identifier.
 *
 * @returns An integer between 0 and 999,999 (inclusive) suitable for use as an identifier
 */
export function getUniqueId(): number {
  return Math.floor(Math.random() * 1000000);
}

/**
 * Create a unique identifier for a node.
 *
 * @returns A string identifier in the form `node:<number>`
 */
export function getNodeId(): string {
	return `node:${getUniqueId().toString()}`;
}

/**
 * Create a unique edge identifier string.
 *
 * @returns A string identifier prefixed with `edge:` followed by a numeric unique token.
 */
export function getEdgeId(): string {
	return `edge:${getUniqueId().toString()}`;
}