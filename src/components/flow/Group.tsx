import { NodeProps } from "@/lib/flow/data";
import { NodeResizer } from "@xyflow/react";

export default function Group(props: NodeProps) {
  return (
    <div
      className="pl-1 pr-1 py-1 shadow-md rounded bg-muted/60 border-2 relative min-w-40 min-h-40 h-full cursor-grab"
      style={{
        borderColor: props.selected
          ? "#3B82F6"
          : undefined,
      }}
    >
        <NodeResizer isVisible={props.selected} minWidth={0} minHeight={0} />
    </div>
  );
}