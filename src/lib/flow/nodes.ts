// Originated from Kite
// SPDX: GPL-3.0
import { Node, XYPosition } from "@xyflow/react";
import { useMemo } from "react";
import {
  ForLoopTypeEnum,
  NodeData,
  NodeExtData,
  NodeTypeEnum,
  TypedInputEnum,
} from "./data";
import { FlowContext } from "./context";

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
};
export const defaultNodeDataForType: Record<string, NodeExtData> = {
  unknown: {
    type: NodeTypeEnum.UnknownNode,
    data: {}
  },
  set_variable: {
    type: NodeTypeEnum.SetVariable,
    data: {
      variable_name: "",
      variable_value: {
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
  context: FlowContext,
  data?: NodeExtData
): Node<NodeData> {
  const id = getNodeId();

  const nodes: Node<NodeData> = {
    id,
    type,
    position,
    data: {},
  };

  // Store default data
  const nodeData = data ? data : defaultNodeDataForType[type] || defaultNodeDataForType["unknown"]
  context.setData(id, nodeData);

  return nodes;
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