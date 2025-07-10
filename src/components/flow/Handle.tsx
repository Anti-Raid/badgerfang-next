// Originated from Kite
// SPDX: GPL-3.0
import { Handle, OnConnect, Position } from "@xyflow/react";
import { primaryColor } from "@/lib/flow/nodes";

interface Props {
  type: "source" | "target";
  position: Position;
  color?: string;
  isConnectable?: boolean;
  onConnect?: OnConnect;
  size?: "small" | "medium" | "large";
  id?: string;
}

export default function FlowNodeHandle({
  type,
  position,
  color,
  isConnectable,
  onConnect,
  size = "medium",
  id,
}: Props) {
  const sizeMap = {
    small: "10px",
    medium: "12px",
    large: "14px",
  };

  return (
    <Handle
      id={id}
      type={type}
      position={position}
      onConnect={onConnect}
      isConnectable={isConnectable}
      className="rounded-full"
      style={{
        backgroundColor: color ?? primaryColor,
        translate:
          position === Position.Top
            ? "0 -3px"
            : position === Position.Bottom
            ? "0 3px"
            : position === Position.Left
            ? "-2px 0"
            : "2px 0",
        height: sizeMap[size],
        width: sizeMap[size],
      }}
    />
  );
}