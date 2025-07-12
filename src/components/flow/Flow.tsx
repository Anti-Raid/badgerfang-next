import { FlowData } from "@/lib/flow/data";
import FlowEditor from "./FlowEditor";
import FlowNodeExplorer from "./NodeToolbar";
import { OnSelectionChangeParams } from "@xyflow/react";
import { useCallback, useState } from "react";
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
        />
      </div>
    </div>
  );
}