// Originated from Kite
// SPDX: GPL-3.0
import { Node, XYPosition } from '@xyflow/react';
import { useMemo } from 'react';
import {
  CommandArgumentType,
  ConditionalTypeEnum,
  ForLoopTypeEnum,
  NodeExtData,
  NodeTypeEnum,
  TypedInputEnum,
  TypedInputString
} from './data';
import { v4 as uuidv4 } from 'uuid';

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
  interpolated: false,
  id: uuidv4()
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
  group_x: {
    defaultTitle: 'Group',
    defaultDescription: 'Groups nodes together for organization.'
  }
};

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
        type: ConditionalTypeEnum.Unselected
      }
    }
  },
  elseif_condition: {
    type: NodeTypeEnum.ElseIfCondition,
    data: {
      condition: {
        type: ConditionalTypeEnum.Unselected
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
        type: ConditionalTypeEnum.Unselected
      }
    }
  },
  custom_code: {
    type: NodeTypeEnum.CustomCode,
    data: {
      code: ''
    }
  },
  group_x: {
    type: NodeTypeEnum.Group,
    data: {}
  }
};

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

export function useNodeValues(nodeType: string): NodeValues {
  return useMemo(() => getNodeValues(nodeType), [nodeType]);
}

// ----------------------
// Node creation helpers
// ----------------------
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

export function getUniqueId(): number {
  return Math.floor(Math.random() * 1000000);
}

export function getNodeId(): string {
  return `node:${getUniqueId().toString()}`;
}

export function getEdgeId(): string {
  return `edge:${getUniqueId().toString()}`;
}
