// Originated from Kite
// SPDX: GPL-3.0
import { FlowData, NodeType } from "@/lib/flow/data";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import Flow from "./Flow";

interface Props {
  flowData: FlowData;
  onChange: (data: FlowData) => void;
}

function InnerFlowPage({
  flowData,
  onChange
}: Props) {
  const { getNodes, getEdges } = useReactFlow<NodeType>();

  const save = () => {
    onChange({
      nodes: getNodes(),
      edges: getEdges(),
    });
  };

  return (
    <div className="h-[75dvh] w-[85dvw] flex flex-col">
      <Flow flowData={flowData} onChange={save} />
    </div>
  );
}

export default function FlowPage(props: Props) {
  return (
    <>
      <ReactFlowProvider>
        <InnerFlowPage {...props} />
      </ReactFlowProvider>
    </>
  );
}