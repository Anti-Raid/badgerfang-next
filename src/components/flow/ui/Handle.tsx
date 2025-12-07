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
			className="!rounded-full !h-2.5 !w-2.5 !border !border-background transition-all duration-200 hover:scale-110"
			style={{
				backgroundColor: 'hsl(var(--primary))',
				boxShadow: '0 0 4px hsla(var(--primary), 0.4)'
			}}
		/>
	);
}