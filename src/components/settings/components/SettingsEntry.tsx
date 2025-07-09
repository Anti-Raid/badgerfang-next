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
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -10 }}
			className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
		>
			<div className="flex items-center gap-3">
				{isDraggable && (
					<GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
				)}
				<span className="font-medium text-foreground">{entry?.title || `Entry ${index + 1}`}</span>
				<div className="ml-auto flex items-center gap-2">
					<button
						className="p-1 rounded-md hover:bg-accent/50 transition-colors"
						onClick={() => onEdit(structuredClone(entry))}
						aria-label="Edit entry"
					>
						<Edit className="w-4 h-4 text-muted-foreground" />
					</button>
					<button
						className="p-1 rounded-md hover:bg-accent/50 transition-colors"
						onClick={() => onDelete(entry)}
						aria-label="Delete entry"
					>
						<Trash2 className="w-4 h-4 text-muted-foreground" />
					</button>
				</div>
			</div>
		</motion.div>
	);
};
