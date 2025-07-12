import { Node, Connection, Edge, Position } from "@xyflow/react";
import FlowNodeBase from "./BaseNode";
import { NodeData, NodeProps, NodeTypeEnum, registerValidationSource } from "@/lib/flow/data";
import { useContext, useEffect, useMemo, useState } from "react";
import { FlowContext } from "@/lib/flow/context";
import { InputField } from "./Inputs";
import { FlowExpanded } from "./FlowExpanded";
import logger from "@/lib/logger";
import Handle from "./Handle";

// Static validation for CustomCode: CustomCode nodes can only have one source connection and one target connection.
registerValidationSource("custom_code", (_svi: FlowContext, srcCons: string[], tgtCons: string[], _edge: Edge | Connection, _source: Node<NodeData>, _target: Node<NodeData>) => {
    if(tgtCons.length > 1) {
        logger.error("Flow.CustomCode", "CustomCode can only have one target connection.");
        return false;
    }

    if(srcCons.length > 1) {
        logger.error("Flow.CustomCode", "CustomCode can only have one source connection.");
        return false;
    }
    return true;
})

export default function CustomCode(props: NodeProps) {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData?.type != NodeTypeEnum.CustomCode) {
    return <div className="text-red-500">Invalid node type: {currentData?.type}</div>;
  }

  const [code, setCode] = useState<string>(currentData.data.code || "");

  useEffect(() => {
    svi.setData(props.id, {
        ...currentData,
        data: {
            ...currentData.data,
            code: code,
        }
    });
  }, [code, props.id]);

  return (
    <FlowNodeBase {...props}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <FlowExpanded
        nodeProps={props}
      >
        <InputField 
            id={`${props.id}-code`}
            label="Code"
            type="textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter variable name"
            className="w-full"
        /> 
      </FlowExpanded>
    </FlowNodeBase>
  );
}