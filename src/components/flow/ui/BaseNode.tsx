// SPDX: GPL-3.0
import { NodeProps } from '@/lib/flow/data';
import { ReactNode } from 'react';
import { FiZap } from 'react-icons/fi';
import { useNodeValues } from '@/lib/flow/nodes';

interface Props extends NodeProps {
	title?: string;
	description?: string;
	children?: ReactNode;
	highlight?: boolean;
	color?: string;
	className?: string;
}

/**
 * Renders a styled flow node card with an icon, title, description, and optional selection glow.
 *
 * The title is chosen in this order: `props.title`, `props.data?.custom_label`, `defaultTitle`, `"Node"`.
 * The description falls back to `props.description`, `defaultDescription`, or `"Description"`.
 * When `props.selected` is true, the node renders a prominent border and a subtle overlay glow.
 *
 * @param props - Component props (notable fields: `title`, `description`, `children`, `selected`, `data`, `type`, `highlight`) used to customize content and visual state.
 * @returns `JSX.Element` representing the rendered flow node card
 */
export default function FlowNodeBase(props: Props) {
	const { title, description, children, highlight, selected, data, type } = props;
	const { defaultTitle, defaultDescription } = useNodeValues(type);

	const Icon = FiZap;

	return (
		<div
			className={`
				relative px-4 py-3 rounded-xl shadow-lg border-2 min-w-[200px] cursor-grab
				backdrop-blur-sm transition-all duration-300
				${selected ? 'border-primary shadow-primary/30 shadow-xl' : 'border-border hover:border-primary/50'}
				bg-gradient-to-br from-card/90 to-card/70
				animate-in fade-in-0 zoom-in-95 duration-200
			`}
		>
			<div className="flex items-start gap-3">
				<div
					className={`
					p-2 rounded-lg
					${selected ? 'bg-primary/20' : 'bg-muted/50'}
					transition-colors duration-300
				`}
				>
					<Icon className={`w-5 h-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
				</div>

				<div className="flex-1 min-w-0">
					<div className="font-semibold text-foreground mb-1 truncate">
						{title || (data?.custom_label as string) || defaultTitle || 'Node'}
					</div>
					<div className="text-xs text-muted-foreground">
						{description || defaultDescription || 'Description'}
					</div>
				</div>
			</div>

			{/* Glow effect when selected */}
			{selected && (
				<div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none animate-in fade-in-0 duration-150" />
			)}

			{children}
		</div>
	);
}
