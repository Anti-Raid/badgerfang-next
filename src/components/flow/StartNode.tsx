import { FlowContext } from "@/lib/flow/context";
import { NodeData, NodeProps, NodeTypeEnum, registerValidationSource, StartNodeData, StartNodeTypeEnum, stringToStartNodeTypeEnum } from "@/lib/flow/data";
import logger from "@/lib/logger";
import { Connection, Edge, Node, Position } from "@xyflow/react";
import { useContext, useMemo, useState } from "react";
import FlowNodeBase from "./BaseNode";
import Handle from "./Handle";
import { FlowExpanded } from "./FlowExpanded";
import { InputField } from "./Inputs";

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

        <FlowExpanded nodeProps={props}>
            <InputField 
              type="select"
              label="Start Type"
              value={currentData.data.nodeType?.toString()}
              
            />
        </FlowExpanded>
    </FlowNodeBase>
  );
}

interface StartNodeModProps {
    data: StartNodeData;
    onChange: (data: StartNodeData) => void;
}

const StartNodeMod: React.FC<StartNodeModProps> = ({ data, onChange }) => {
  const [type, setType] = useState(data.type || StartNodeTypeEnum.Library);
  const [currentData, setCurrentData] = useState<StartNodeData>(structuredClone(data));

  return (
    <>
        <InputField 
          type="select"
          label="Start Type"
          value={type?.toString()}
          options={[
            { value: "library", label: "Library" },
            { value: "command", label: "Command" }
          ]}
          onChange={(e) => {
            let newType = stringToStartNodeTypeEnum(e.target.value);
            setType(newType);
            if (newType == data.type) {
              setCurrentData(data); // Reset to original data if type is unchanged
            } else {
              if (newType == StartNodeTypeEnum.Command) {
                setCurrentData({
                  type: newType,
                  data: {
                    name: "",
                    description: "",
                    arguments: []
                  }
                });
              } else if (newType == StartNodeTypeEnum.Library) {
                setCurrentData({
                  type: newType
                });
              }
            }
          }}
        />
    </>
  )
}