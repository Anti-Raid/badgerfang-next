import { Position } from "@xyflow/react";
import FlowNodeBase from "./BaseNode";
import Handle from "./Handle";
import { NodeExtData, NodeProps, NodeTypeEnum } from "@/lib/flow/data";
import { useContext, useEffect, useMemo, useState } from "react";
import { FlowContext } from "@/lib/flow/context";
import { InputField } from "./Inputs";

export default function SetVariable(props: NodeProps) {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData.type != NodeTypeEnum.SetVariable) {
    return <div className="text-red-500">Invalid node type: {currentData.type}</div>;
  }

  const [variableName, setVariableName] = useState<string>(currentData.data.variable_name || "");

  useEffect(() => {
    console.log("Setting variable name to:", variableName);
    svi.setData(props.id, {
        ...currentData,
        data: {
            ...currentData.data,
            variable_name: variableName,
        }
    });
  }, [variableName, props.id]);

  return (
    <FlowNodeBase {...props}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {props.selected && (
        <>
            <InputField 
                id={`${props.id}-variable-name`}
                label="Variable Name"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                placeholder="Enter variable name"
                className="w-full"
                error={!variableName ? "Variable name is required." : ""}
            /> 
        </>
      )}
    </FlowNodeBase>
  );
}