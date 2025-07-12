import { FlowContext } from "@/lib/flow/context";
import { NodeData, NodeProps, NodeTypeEnum, registerValidationSource } from "@/lib/flow/data";
import logger from "@/lib/logger";
import { Connection, Edge, Node, Position } from "@xyflow/react";
import { useContext, useMemo } from "react";
import FlowNodeBase from "./BaseNode";
import Handle from "./Handle";

// Static validation for StartNode: Only have one target connection.
registerValidationSource("start", (svi: FlowContext, srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => {
    if(srcCons.length >= 1) {
        logger.error("Flow.Start", "Start can only have one target connection.");
        return false;
    }

    return true;
});

// TODO: Support command type
export const StartNode = (props: NodeProps) => {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData?.type != NodeTypeEnum.StartNode) {
    return <div className="text-red-500">Invalid node type: {currentData?.type}</div>;
  }

  return (
    <FlowNodeBase {...props}>
        <Handle type="source" position={Position.Bottom} />
    </FlowNodeBase>
  );
}