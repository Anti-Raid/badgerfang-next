// Originated from Kite
// SPDX: GPL-3.0
import { NodeProps } from "@/lib/flow/data";
import { ReactNode } from "react";
import { primaryColor, useNodeValues } from "@/lib/flow/nodes";
//import FlowNodeMarkers from "./FlowNodeMarkers";

interface Props extends NodeProps {
  title?: string;
  description?: string;
  children: ReactNode;
  highlight?: boolean;
  color?: string;
  className?: string;
}

export default function FlowNodeBase(props: Props) {
  const {
    color: defaultColor,
    defaultTitle,
    defaultDescription,
  } = useNodeValues(props.type);

  const color = props.color || defaultColor;

  return (
    <div
      className="pl-1 pr-1 py-1 shadow-md rounded bg-muted border-2 relative max-w-sm min-w-16 cursor-grab"
      style={{
        borderColor: props.selected
          ? primaryColor
          : props.highlight
          ? color
          : undefined,
      }}
    >
      <div className="flex items-start space-x-2">
        <div className="overflow-hidden">
          <div className="text-sm font-medium text-foreground leading-5 mb-1 truncate">
            {props.title || props.data.custom_label as string || defaultTitle}
          </div>
          <div className="text-xs text-muted-foreground">
            {props.description || defaultDescription}
          </div>
        </div>
      </div>

      {props.children}
    </div>
  );
}