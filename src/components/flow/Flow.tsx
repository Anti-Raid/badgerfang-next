// Originated from Kite
// SPDX: GPL-3.0
import { FlowData, NodeData, NodeProps } from "@/lib/flow/data";
import FlowEditor from "./FlowEditor";
//import FlowNodeEditor from "./FlowNodeEditor";
import FlowNodeExplorer from "./NodeToolbar";
import { OnSelectionChangeParams, Node, useReactFlow } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { FlowContext } from "@/lib/flow/context";

interface Props {
    /**
     * Flow data to be displayed and edited. This will ultimately compile down to Luau
     */
    flowData: FlowData;
    /**
     * Flow context data
     */
    flowContext: FlowContext;
    /**
     * On change handler that is called whenever the flow data changes.
     */
    onChange: () => void;
}

export default function Flow({ flowData, flowContext, onChange }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      if (nodes.length === 1) {
        console.log("Selected node:", nodes[0].id);

        setSelectedNodeId(nodes[0].id);
      } else {
        setSelectedNodeId(null);
      }
    },
    []
  );

  return (
    <div className="flex flex-auto overflow-y-hidden relative">
      <div className="flex-none">
        <FlowNodeExplorer />
      </div>
      <div className="flex-auto">
        <FlowEditor
          initialData={flowData}
          flowContext={flowContext}
          onChange={onChange}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}