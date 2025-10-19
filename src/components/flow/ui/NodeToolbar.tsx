import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayers, FiChevronLeft, FiChevronRight, FiZap } from 'react-icons/fi';
import clsx from 'clsx';
import { NodeValues, nodeTypes } from '@/lib/flow/nodes';

const nodeCategories = {
	action: [
		{ title: 'Start Here', nodeTypes: ['library', 'command', 'command_argument'] },
		{ title: 'Discord', nodeTypes: [] },
		{ title: 'Key-Value', nodeTypes: [] },
		{ title: 'API Nodes', nodeTypes: ['api_node'] },
		{ title: 'Other Actions', nodeTypes: ['custom_code'] }
	],
	control_flow: [
		{
			title: 'Conditions',
			nodeTypes: ['set_variable', 'if_condition', 'elseif_condition', 'end_condition']
		},
		{ title: 'Loops', nodeTypes: ['for_loop', 'while_loop'] },
		{ title: 'Others', nodeTypes: ['group_x'] }
	]
};

type NodeCategory = keyof typeof nodeCategories;

/**
 * FlowNodeExplorer
 *
 * Collapsible panel displaying node sections and draggable node items.
 */
export default function FlowNodeExplorer() {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [category, setCategory] = useState<NodeCategory>('action');

	const sections = useMemo(() => nodeCategories[category] || [], [category]);

	return (
		<motion.div
			initial={false}
			animate={{ width: isCollapsed ? 60 : 320 }}
			className="h-full bg-gradient-to-b from-background to-muted/30 border-r border-border flex flex-col relative shadow-xl"
		>
			{/* Collapse Button */}
			<button
				onClick={() => setIsCollapsed(!isCollapsed)}
				className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center shadow-lg transition-colors duration-200"
			>
				{isCollapsed ? (
					<FiChevronRight className="text-primary-foreground w-4 h-4" />
				) : (
					<FiChevronLeft className="text-primary-foreground w-4 h-4" />
				)}
			</button>

			<AnimatePresence mode="wait">
				{!isCollapsed ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col h-full"
					>
						{/* Header */}
						<div className="p-6 border-b border-border">
							<div className="flex items-center gap-3 mb-2">
								<div className="p-2 rounded-lg bg-primary/10">
									<FiLayers className="w-5 h-5 text-primary" />
								</div>
								<h2 className="text-xl font-bold text-foreground">Nodes</h2>
							</div>
							<p className="text-sm text-muted-foreground">Drag nodes to canvas</p>
						</div>

						{/* Category Tabs */}
						<div className="flex gap-2 p-4 border-b border-border">
							{(['action', 'control_flow'] as NodeCategory[]).map((cat) => (
								<button
									key={cat}
									onClick={() => setCategory(cat)}
									className={clsx(
										'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
										category === cat
											? 'bg-primary text-primary-foreground shadow-md'
											: 'bg-muted/50 text-muted-foreground hover:bg-muted'
									)}
								>
									{cat === 'action' ? 'Actions' : 'Control Flow'}
								</button>
							))}
						</div>

						{/* Nodes List */}
						<div className="flex-1 overflow-y-auto p-4 space-y-6">
							{sections.map((section, i) => (
								<div key={i}>
									<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
										{section.title}
									</h3>
									<div className="space-y-2">
										{section.nodeTypes.map((type) => (
											<AvailableNode key={type} type={type} values={nodeTypes[type]} />
										))}
									</div>
								</div>
							))}
						</div>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col items-center py-6 gap-4"
					>
						<div className="p-3 rounded-lg bg-primary/10">
							<FiLayers className="w-6 h-6 text-primary" />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

/**
 * Draggable node card
 */
function AvailableNode({ type, values }: { type: string; values: NodeValues }) {
  const Icon = FiZap;

	function onStartDrag(e: React.DragEvent<HTMLDivElement>) {
		e.dataTransfer.setData('application/reactflow', type);
		e.dataTransfer.effectAllowed = 'move';
	}

	return (
		<div
			draggable
			onDragStart={onStartDrag}
			className="p-3 rounded-lg bg-card/50 hover:bg-card border border-border hover:border-primary/50 cursor-grab transition-all duration-200 backdrop-blur-sm"
		>
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-primary/10">
					<Icon className="w-4 h-4 text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="font-medium text-foreground text-sm truncate">{values.defaultTitle}</div>
					<div className="text-xs text-muted-foreground truncate">{values.defaultDescription}</div>
				</div>
			</div>
		</div>
	);
}
