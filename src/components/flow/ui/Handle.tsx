import { Handle, HandleProps } from '@xyflow/react';

export default function FlowNodeHandle(props: HandleProps) {
  return (
    <Handle
      {...props}
      className="!rounded-full !h-3 !w-3 !border-2 !border-background transition-all duration-200 hover:scale-125"
      style={{
        backgroundColor: 'hsl(var(--primary))',
        boxShadow: '0 0 8px hsla(var(--primary), 0.5)'
      }}
    />
  );
}
