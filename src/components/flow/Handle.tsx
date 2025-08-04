import { Handle, HandleProps } from '@xyflow/react';

export default function FlowNodeHandle(props: HandleProps) {
	return (
		<Handle
			{...props}
			className="rounded-full h-[10px] w-[10px]"
			style={{
				backgroundColor: '#3B82F6'
			}}
		/>
	);
}
