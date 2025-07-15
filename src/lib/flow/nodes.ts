// Originated from Kite
// SPDX: GPL-3.0
import { Node, XYPosition } from "@xyflow/react";
import { useMemo } from "react";
import {
  CommandArgumentType,
  ForLoopTypeEnum,
  NodeExtData,
  NodeTypeEnum,
  TypedInputEnum,
} from "./data";

export interface NodeValues {
  defaultTitle: string;
  defaultDescription: string;
  helpUrl?: string;
}

/*
Add node types here
*/
const unknownNodeType: NodeValues = {
  defaultTitle: "Unknown",
  defaultDescription: "Unknown node type.",
};

export const nodeTypes: Record<string, NodeValues> = {
  unknown: unknownNodeType,
  library: {
    defaultTitle: "Library",
    defaultDescription: "The starting point of a library.",
  },
  command: {
    defaultTitle: "Command",
    defaultDescription: "The starting point of a Discord command.",
  },
  command_argument: {
    defaultTitle: "Command Argument",
    defaultDescription: "An argument for a command.",
  },
  set_variable: {
    defaultTitle: "Set Variable",
    defaultDescription: "Sets a variable to a value.",
  },
  if_condition: {
    defaultTitle: "If Condition",
    defaultDescription: "Executes code based on condition.",
  },
  elseif_condition: {
    defaultTitle: "Else If Condition",
    defaultDescription: "Executes code based on condition .",
  },
  end_condition: {
    defaultTitle: "End Condition",
    defaultDescription: "Ends the conditional chain.",
  },
  for_loop: {
    defaultTitle: "For Loop",
    defaultDescription: "Executes code in a loop based on condition.",
  },
  custom_code: {
    defaultTitle: "Custom Code",
    defaultDescription: "Executes custom code.",
  },
  group_x: {
    defaultTitle: "Group",
    defaultDescription: "Groups nodes together for organization.",
  },
};
export const defaultNodeDataForType: Record<string, NodeExtData> = {
  unknown: {
    type: NodeTypeEnum.UnknownNode,
    data: {}
  },
  library: {
    type: NodeTypeEnum.LibraryNode,
    data: {} // No specific data for start node
  },
  command: {
    type: NodeTypeEnum.CommandNode,
    data: {
      name: "",
      description: "",
    } 
  },
  command_argument: {
    type: NodeTypeEnum.CommandArgumentNode,
    data: {
      name: "",
      description: "",
      type: CommandArgumentType.String, // Default type
      required: false, // Default to not required
    }
  },
  set_variable: {
    type: NodeTypeEnum.SetVariable,
    data: {
      name: "",
      value: {
        type: TypedInputEnum.String,
        value: "",
      },
    }
  },
  if_condition: {
    type: NodeTypeEnum.IfCondition,
    data: {
      condition: "",
    }
  },
  elseif_condition: {
    type: NodeTypeEnum.ElseIfCondition,
    data: {
      condition: "",
      index: 1, // Default index for the first elseif
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
        iterable: {
          type: TypedInputEnum.String,
          value: "",
        }
      },
    }
  },
  custom_code: {
    type: NodeTypeEnum.CustomCode,
    data: {
      code: "",
    }
  },
  group_x: {
    type: NodeTypeEnum.Group,
    data: {}
  }
}

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

export function createNode(
  type: string,
  position: XYPosition,
  data?: NodeExtData,
  parent?: string,
): Node<NodeExtData> {
  const id = getNodeId();

  let node: Node<NodeExtData> = {
    id,
    type,
    position,
    data: data ? data : defaultNodeDataForType[type] || defaultNodeDataForType["unknown"],
  };

  if (parent) {
    node.parentId = parent; // Set parent ID if provided
    node.expandParent = true;
    node.extent = "parent"
  }

  return node;
}

export function getUniqueId(): number {
    return Math.floor(Math.random() * 1000000);
}

export function getNodeId(): string {
    // Return a unique ID for the node
    return `node:${getUniqueId().toString()}`;
}

export function getEdgeId(): string {
    // Return a unique ID for the node
    return `edge:${getUniqueId().toString()}`;
}