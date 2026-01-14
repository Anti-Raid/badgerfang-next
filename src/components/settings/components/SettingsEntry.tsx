'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Edit, Trash2 } from 'lucide-react';

interface SettingsEntryProps {
	entry: any;
	index: number;
	onEdit: (entry: any) => void;
	onDelete: (entry: any) => void;
	isDraggable?: boolean;
}

export const SettingsEntry: React.FC<SettingsEntryProps> = ({
	entry,
	index,
	onEdit,
	onDelete,
	isDraggable = false
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			className="group/entry relative bg-background border border-border/50 rounded-xl p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
		>
			<div className="flex items-center gap-4">
				{isDraggable && (
					<div className="text-muted-foreground/30 group-hover/entry:text-primary transition-colors cursor-grab active:cursor-grabbing">
						<GripVertical size={20} />
					</div>
				)}
				
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<span className="text-sm font-bold text-foreground">
							{entry?.title || `Entry ${index + 1}`}
						</span>
						{entry?.type && (
							<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
								{entry.type}
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
						onClick={() => onEdit(structuredClone(entry))}
						aria-label={`Edit ${entry?.title || 'entry'}`}
					>
						<Edit size={16} />
					</button>
					<button
						className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all focus:outline-none focus:ring-2 focus:ring-destructive/20"
						onClick={() => onDelete(entry)}
						aria-label={`Delete ${entry?.title || 'entry'}`}
					>
						<Trash2 size={16} />
					</button>
				</div>
			</div>
		</motion.div>
	);
};
