// Originated from Kite
// SPDX: GPL-3.0
import { FlowData, NodeType } from "@/lib/flow/data";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import Flow from "./Flow";
import { FlowContext } from "@/lib/flow/context";

interface Props {
  flowData: FlowData;
  flowContext: FlowContext;
  onChange: (data: FlowData) => void;
}

function InnerFlowPage({
  flowData,
  flowContext,
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
      <FlowContext.Provider value={flowContext}>
        <Flow flowData={flowData} flowContext={flowContext} onChange={save} />
      </FlowContext.Provider>
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