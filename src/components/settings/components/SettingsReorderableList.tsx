'use client';

import React from 'react';
import { Reorder, motion } from 'framer-motion';
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
	return (
		<div className="space-y-4">
			<div className="bg-secondary/30 border border-border rounded-xl overflow-hidden p-2">
				<Reorder.Group axis="y" values={entries} onReorder={onReorder} className="space-y-2">
					{entries.map((entry, index) => (
						<Reorder.Item
							key={entry[indexBy || ''] || index}
							value={entry}
							className="group/reorder relative bg-card border border-border hover:border-primary/20 rounded-xl p-4 transition-colors"
						>
							<div className="flex items-center gap-4">
								<div className="text-muted-foreground group-hover/reorder:text-foreground transition-colors cursor-grab active:cursor-grabbing">
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
						</Reorder.Item>
					))}
				</Reorder.Group>
			</div>

			{isReordered && (
				<motion.div
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex justify-end pt-2"
				>
					<Primary
						Title="Save Order"
						onClick={onSaveOrder}
						className="!px-5 !py-2 !rounded-xl !text-sm"
					/>
				</motion.div>
			)}
		</div>
	);
};
