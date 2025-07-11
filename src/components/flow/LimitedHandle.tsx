import { Connection, Edge, Node, NodeConnection, Position, useNodeConnections, useReactFlow } from "@xyflow/react";
import Handle from "./Handle";
import { useMemo } from "react";
import { NodeData } from "@/lib/flow/data";

interface Props {
  type: "source" | "target";
  position: Position;
  color?: string;
  isConnectable?: boolean;
  size?: "small" | "medium" | "large";
  id?: string;
  validate?: (connections: NodeConnection[]) => boolean;
  validateStart?: (connections: NodeConnection[]) => boolean;
  validateEnd?: (connections: NodeConnection[]) => boolean;
  isValidConnection?: (connections: NodeConnection[], edge: Edge | Connection, target: Node<NodeData>) => boolean;
}

/**
 * A special abstraction around handle that stores node connections and provides better validation for connections.
 */
export default function LimitedHandle({
  type,
  position,
  color,
  size = "medium",
  id,
  validate,
  validateStart,
  validateEnd,
  isValidConnection
}: Props) {
    const connections = useNodeConnections({
        handleType: type,
        handleId: id,
    });
    const { getNodes, getEdges } = useReactFlow<Node<NodeData>>();

    const isConnectable = useMemo(() => {
        return validate ? validate(connections) : true;
    }, [connections]);

    const isConnectableStart = useMemo(() => {
        return validateStart ? validateStart(connections) : true;
    }, [connections, validateStart]);

    const isConnectableEnd = useMemo(() => {
        return validateEnd ? validateEnd(connections) : true;
    }, [connections, validateEnd]);

    return (
        <Handle
            id={id}
            type={type}
            position={position}
            isConnectable={isConnectable}
            isConnectableStart={isConnectableStart}
            isConnectableEnd={isConnectableEnd}
            isValidConnection={isValidConnection ? (connection) => {
              const nodes = getNodes();
              const target = nodes.find((node) => node.id === connection.target);
              if (!target) return false;
              return isValidConnection(connections, connection, target); 
            } : undefined}
            color={color}
            size={size}
        />
  );
}