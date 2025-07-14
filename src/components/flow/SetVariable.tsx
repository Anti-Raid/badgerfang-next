import { Node, Connection, Edge, Position } from "@xyflow/react";
import FlowNodeBase from "./BaseNode";
import { NodeData, NodeProps, NodeTypeEnum, registerValidationSource, TypedInput, TypedInputEnum } from "@/lib/flow/data";
import { useContext, useEffect, useMemo, useState } from "react";
import { FlowContext } from "@/lib/flow/context";
import { InputField, TypedInputField } from "./Inputs";
import { FlowExpanded } from "./FlowExpanded";
import logger from "@/lib/logger";
import Handle from "./Handle";

// Static validation for SetVariable: SetVariable nodes can only have one source connection and one target connection.
registerValidationSource("set_variable", (_svi: FlowContext, srcCons: string[], tgtCons: string[], _edge: Edge | Connection, _source: Node<NodeData>, _target: Node<NodeData>) => {
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
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData?.type != NodeTypeEnum.SetVariable) {
    return <div className="text-red-500">Invalid node type: {currentData?.type}</div>;
  }

  const [variableName, setVariableName] = useState<string>(currentData.data.variable_name || "");
  const [variableValue, setVariableValue] = useState<TypedInput>(currentData.data.variable_value || { type: TypedInputEnum.String, value: "" });

  useEffect(() => {
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
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

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