import { Position, useReactFlow } from "@xyflow/react";
import FlowNodeBase from "./BaseNode";
import { NodeProps, NodeTypeEnum, registerValidationSource, TypedInput, TypedInputEnum } from "@/lib/flow/data";
import { useEffect, useState } from "react";
import { InputField, TypedInputField } from "./Inputs";
import { FlowExpanded } from "./FlowExpanded";
import logger from "@/lib/logger";
import Handle from "./Handle";

// Static validation for SetVariable: SetVariable nodes can only have one source connection and one target connection.
registerValidationSource("set_variable", (srcCons: string[], tgtCons: string[]) => {
    if(tgtCons.length > 1) {
        logger.error("Flow.SetVariable", "SetVariable can only have one target connection.");
        return false;
    }

    if(srcCons.length > 1) {
        logger.error("Flow.SetVariable", "SetVariable can only have one source connection.");
        return false;
    }
    return true;
})

export default function SetVariable(props: NodeProps) {
  if(props?.data?.type != NodeTypeEnum.SetVariable) {
    return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
  }

  const flow = useReactFlow();
  const [variableName, setVariableName] = useState<string>(props.data.data.name || "");
  const [variableValue, setVariableValue] = useState<TypedInput>(props.data.data.value || { type: TypedInputEnum.String, value: "" });

  useEffect(() => {
    flow.updateNodeData(props.id, {
        data: {
          name: variableName,
          value: variableValue
        }
      });
  }, [variableName, variableValue, props.id, flow]);

  return (
    <FlowNodeBase {...props} title={props.data.data.name ? `Set Variable ${props.data.data.name}` : "Set Variable"} className="bg-blue-100 hover:bg-blue-200">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <FlowExpanded
        nodeProps={props}
      >
        <InputField 
            id={`${props.id}-variable-name`}
            label="Variable Name"
            value={variableName}
            onChange={(e) => {
              console.log("Setting variable name to:", e.target.value);
              setVariableName(e.target.value)
            }}
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
            aria-label="Variable Value"
        />
      </FlowExpanded>
    </FlowNodeBase>
  );
}