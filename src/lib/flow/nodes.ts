// Originated from Kite
// SPDX: GPL-3.0
import { Edge, Node, XYPosition } from "@xyflow/react";
import {
  CircleHelpIcon,
} from "lucide-react";
import { ExoticComponent, useContext, useMemo } from "react";
import { ZodType } from "zod";
import {
  ForLoopTypeEnum,
  NodeData,
  NodeExtData,
  NodeTypeEnum,
  TypedInputEnum,
} from "./data";
import { FlowContext } from "./context";

export const primaryColor = "#3B82F6";

export const actionColor = "#3b82f6";
export const entryColor = "#eab308";
export const errorColor = "#ef4444";
export const controlColor = "#22c55e";
export const optionColor = "#8b5cf6";
export const suspendColor = "#d946ef";

export interface NodeValues {
  color: string;
  defaultTitle: string;
  defaultDescription: string;
  helpUrl?: string;
}

/*
Add node types here
*/
const unknownNodeType: NodeValues = {
  color: "#ff0000",
  defaultTitle: "Unknown",
  defaultDescription: "Unknown node type.",
};

export const nodeTypes: Record<string, NodeValues> = {
  unknown: unknownNodeType,
  set_variable: {
    color: primaryColor,
    defaultTitle: "Set Variable",
    defaultDescription: "Sets a variable to a value.",
  },
  if_condition: {
    color: primaryColor,
    defaultTitle: "If Condition",
    defaultDescription: "Executes code based on condition.",
  },
  elseif_condition: {
    color: primaryColor,
    defaultTitle: "Else If Condition",
    defaultDescription: "Executes code based on condition .",
  },
  end_condition: {
    color: primaryColor,
    defaultTitle: "End Condition",
    defaultDescription: "Ends the conditional chain.",
  },
  for_loop: {
    color: primaryColor,
    defaultTitle: "For Loop",
    defaultDescription: "Executes code in a loop based on condition.",
  },
  custom_code: {
    color: primaryColor,
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