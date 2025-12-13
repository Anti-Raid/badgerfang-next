import { Handle, HandleProps } from '@xyflow/react';

/**
 * Render a small circular Handle for flow nodes.
 *
 * @param props - HandleProps forwarded to the underlying Handle element.
 * @returns The Handle element with a 10×10px rounded shape and a blue background (`#3B82F6`), with any provided props applied.
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