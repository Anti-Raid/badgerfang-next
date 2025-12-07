import { Handle, HandleProps } from '@xyflow/react';

/**
 * Renders a styled Handle for flow nodes.
 *
 * @param props - HandleProps forwarded to the underlying Handle element.
 * @returns The Handle element with predefined size, border, color, and glow styling.
 */
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