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
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="group/entry relative bg-secondary/50 border border-border rounded-xl p-4 transition-colors hover:border-primary/20"
		>
			<div className="flex items-center gap-4">
				{isDraggable && (
					<div className="text-muted-foreground group-hover/entry:text-foreground transition-colors cursor-grab active:cursor-grabbing">
						<GripVertical size={18} />
					</div>
				)}

				<div className="flex-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-foreground">
							{entry?.title || `Entry ${index + 1}`}
						</span>
						{entry?.type && (
							<span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
								{entry.type}
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1 opacity-0 group-hover/entry:opacity-100 transition-opacity">
					<button
						type="button"
						className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
						onClick={() => onEdit(structuredClone(entry))}
						aria-label={`Edit ${entry?.title || 'entry'}`}
					>
						<Edit size={16} />
					</button>
					<button
						type="button"
						className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
