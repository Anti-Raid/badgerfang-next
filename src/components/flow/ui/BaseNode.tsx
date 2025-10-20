// SPDX: GPL-3.0
import { NodeProps } from '@/lib/flow/data';
import { ReactNode } from 'react';
import { FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNodeValues } from '@/lib/flow/nodes';

interface Props extends NodeProps {
	title?: string;
	description?: string;
	children?: ReactNode;
	highlight?: boolean;
	color?: string;
	className?: string;
}

export default function FlowNodeBase(props: Props) {
	const { title, description, children, highlight, selected, data, type } = props;
	const { defaultTitle, defaultDescription } = useNodeValues(type);

	const Icon = FiZap;

	return (
		<motion.div
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className={`
				relative px-4 py-3 rounded-xl shadow-lg border-2 min-w-[200px] cursor-grab
				backdrop-blur-sm transition-all duration-300
				${selected ? 'border-primary shadow-primary/30 shadow-xl' : 'border-border hover:border-primary/50'}
				bg-gradient-to-br from-card/90 to-card/70
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
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none"
				/>
			)}

			{children}
		</motion.div>
	);
}
