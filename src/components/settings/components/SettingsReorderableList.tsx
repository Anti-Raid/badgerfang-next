'use client';

import React, { useEffect, useState } from 'react';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { Primary } from '../../ui/Buttons';

interface SettingsReorderableListProps {
	entries: any[];
	onReorder: (entries: any[]) => void;
	onEdit: (entry: any) => void;
	onDelete: (entry: any) => void;
	indexBy?: string;
}

export const SettingsReorderableList: React.FC<SettingsReorderableListProps> = ({
	entries,
	onReorder: _onReorder,
	onEdit,
	onDelete,
	indexBy = 'id'
}) => {
	// Keep local state to prevent re-renders from parent
	const [localEntries, setLocalEntries] = useState(entries);

	// Only update local state when entries actually change (not during drag)
	useEffect(() => {
		setLocalEntries(entries);
	}, [entries]);

	return (
		<div className="space-y-4">
			<div className="bg-accent/30 border border-border/50 rounded-2xl overflow-hidden p-3">
				<div className="space-y-2">
					{localEntries.map((entry) => (
						<div
							key={entry[indexBy]}
							className="group/reorder relative bg-card border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all duration-200 shadow-sm"
						>
							<div className="flex items-center gap-4">
								<div className="text-muted-foreground/30 group-hover/reorder:text-primary transition-colors cursor-grab active:cursor-grabbing">
									<GripVertical size={20} />
								</div>

								<div className="flex-1">
									<span className="text-sm font-bold text-foreground transition-colors group-hover/reorder:text-primary">
										{entry?.label || entry?.title || `Entry`}
									</span>
								</div>

								<div className="flex items-center gap-1 opacity-0 group-hover/reorder:opacity-100 group-focus-within/reorder:opacity-100 transition-opacity">
									<button
										type="button"
										className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
										onPointerDown={(e) => e.stopPropagation()}
										onClick={() => onEdit(structuredClone(entry))}
										aria-label={`Edit ${entry?.label || entry?.title || 'entry'}`}
									>
										<Edit size={16} />
									</button>
									<button
										type="button"
										className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
										onPointerDown={(e) => e.stopPropagation()}
										onClick={() => onDelete(entry)}
										aria-label={`Delete ${entry?.label || entry?.title || 'entry'}`}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};