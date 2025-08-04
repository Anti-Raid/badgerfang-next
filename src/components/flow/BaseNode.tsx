// Originated from Kite
// SPDX: GPL-3.0
import { NodeProps } from '@/lib/flow/data';
import { ReactNode } from 'react';
import { useNodeValues } from '@/lib/flow/nodes';

interface Props extends NodeProps {
	title?: string;
	description?: string;
	children: ReactNode;
	highlight?: boolean;
	color?: string;
	className?: string;
}

export default function FlowNodeBase(props: Props) {
	const { defaultTitle, defaultDescription } = useNodeValues(props.type);

	return (
		<div
			className="pl-1 pr-1 py-1 shadow-md rounded bg-muted border-2 relative max-w-sm min-w-16 h-full cursor-grab"
			style={{
				borderColor: props.selected ? '#3B82F6' : props.highlight ? '#3B82F6' : undefined
			}}
		>
			<div className="flex items-start space-x-2">
				<div className="overflow-hidden">
					<div className="text-sm font-medium text-foreground leading-5 mb-1 truncate">
						{props.title || (props.data.custom_label as string) || defaultTitle}
					</div>
					<div className="text-xs text-muted-foreground">
						{props.description || defaultDescription}
					</div>
				</div>
			</div>

			{props.children}
		</div>
	);
}
