import { Position, useNodeConnections } from "@xyflow/react";
import Handle from "./Handle";

interface Props {
  type: "source" | "target";
  position: Position;
  color?: string;
  isConnectable?: boolean;
  size?: "small" | "medium" | "large";
  id?: string;
  maxConnections: number;
}

export default function FlowNodeHandle({
  type,
  position,
  color,
  size = "medium",
  id,
  maxConnections
}: Props) {
    const connections = useNodeConnections({
        handleType: type,
        handleId: id,
    });

    return (
        <Handle
            id={id}
            type={type}
            position={position}
            isConnectable={connections.length < maxConnections}
            color={color}
            size={size}
        />
  );
}