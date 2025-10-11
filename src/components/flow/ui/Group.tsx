import { NodeProps } from '@/lib/flow/data';
import { NodeResizer } from '@xyflow/react';

export default function Group(props: NodeProps) {
	return (
    <div
      className="relative rounded-xl bg-muted/30 border-2 border-dashed border-border min-w-40 min-h-40 h-full"
      style={{
        borderColor: props.selected ? 'hsl(var(--primary))' : undefined
      }}
    >
      <NodeResizer isVisible={props.selected} minWidth={160} minHeight={160} />
      <div className="absolute top-2 left-2 text-xs font-medium text-muted-foreground">
        Group
      </div>
    </div>
	);
}
