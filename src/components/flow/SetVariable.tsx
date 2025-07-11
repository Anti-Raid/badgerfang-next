import { Position } from "@xyflow/react";
import FlowNodeBase from "./BaseNode";
import Handle from "./Handle";
import { NodeProps, NodeTypeEnum, TypedInput, TypedInputEnum } from "@/lib/flow/data";
import { useContext, useEffect, useMemo, useState } from "react";
import { FlowContext } from "@/lib/flow/context";
import { InputField, TypedInputField } from "./Inputs";
import LimitedHandle from "./LimitedHandle";
import { FlowExpanded } from "./FlowExpanded";

export default function SetVariable(props: NodeProps) {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData.type != NodeTypeEnum.SetVariable) {
    return <div className="text-red-500">Invalid node type: {currentData.type}</div>;
  }

  const [variableName, setVariableName] = useState<string>(currentData.data.variable_name || "");
  const [variableValue, setVariableValue] = useState<TypedInput>(currentData.data.variable_value || { type: TypedInputEnum.String, value: "" });

  useEffect(() => {
    console.log("Setting variable name to:", variableName);
    svi.setData(props.id, {
        ...currentData,
        data: {
            ...currentData.data,
            variable_name: variableName,
            variable_value: variableValue
        }
    });
  }, [variableName, variableValue, props.id]);

  return (
    <FlowNodeBase {...props}>
      <LimitedHandle type="target" position={Position.Top} validate={(cons) => cons.length < 1} />
      <LimitedHandle type="source" position={Position.Bottom} validate={(cons) => cons.length < 1} />

      <FlowExpanded
        nodeProps={props}
      >
        <InputField 
            id={`${props.id}-variable-name`}
            label="Variable Name"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            placeholder="Enter variable name"
            className="w-full"
            error={!variableName ? "Variable name is required." : ""}
        /> 

        <TypedInputField 
            id={`${props.id}-variable-value`}
            label="Variable Value"
            value={variableValue}
            onChange={(value) => {
              console.log("Setting variable value to:", value);
              setVariableValue(value)
            }}
            placeholder="Enter variable value"
            className="w-full"
            error={!variableValue.value ? "Variable value is required." : ""}
            disabled={!variableName}
            aria-label="Variable Value"
        />
      </FlowExpanded>
    </FlowNodeBase>
  );
}