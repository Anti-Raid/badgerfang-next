'use client';

import React, { useState } from 'react';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { Primary } from '../../ui/Buttons';

interface SettingsReorderableListProps {
	entries: any[];
	onReorder: (entries: any[]) => void;
	onEdit: (entry: any) => void;
	onDelete: (entry: any) => void;
	onSaveOrder: () => void;
	isReordered: boolean;
	indexBy?: string;
}

export const SettingsReorderableList: React.FC<SettingsReorderableListProps> = ({
	entries,
	onReorder,
	onEdit,
	onDelete,
	onSaveOrder,
	isReordered,
	indexBy
}) => {
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

	const handleDragStart = (index: number) => {
		setDraggingIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggingIndex === null || draggingIndex === index) return;
		const newEntries = [...entries];
		const [item] = newEntries.splice(draggingIndex, 1);
		newEntries.splice(index, 0, item);
		onReorder(newEntries);
		setDraggingIndex(index);
	};

	const handleDragEnd = () => {
		setDraggingIndex(null);
	};

	return (
		<div className="space-y-4">
			<div className="bg-secondary/30 border border-border rounded-xl overflow-hidden p-2">
				<div className="space-y-2">
					{entries.map((entry, index) => (
						<div
							key={entry[indexBy || ''] || index}
							draggable
							onDragStart={() => handleDragStart(index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDragEnd={handleDragEnd}
							className={`group/reorder relative bg-card border rounded-xl p-4 transition-colors cursor-grab active:cursor-grabbing ${
								draggingIndex === index
									? 'border-primary/40 opacity-50'
									: 'border-border hover:border-primary/20'
							}`}
						>
							<div className="flex items-center gap-4">
								<div className="text-muted-foreground group-hover/reorder:text-foreground transition-colors">
									<GripVertical size={18} />
								</div>

								<div className="flex-1">
									<span className="text-sm font-medium text-foreground">
										{entry?.title || `Entry ${index + 1}`}
									</span>
								</div>

								<div className="flex items-center gap-1 opacity-0 group-hover/reorder:opacity-100 transition-opacity">
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
						</div>
					))}
				</div>
			</div>

			{isReordered && (
				<div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 flex justify-end pt-2">
					<Primary
						Title="Save Order"
						onClick={onSaveOrder}
						className="!px-5 !py-2 !rounded-xl !text-sm"
					/>
				</div>
			)}
		</div>
	);
};
