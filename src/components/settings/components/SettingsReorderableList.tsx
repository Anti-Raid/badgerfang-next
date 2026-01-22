'use client';

import React from 'react';
import { Reorder, motion } from '@/components/ui/motion';
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
			<div className="bg-accent/30 border border-border/50 rounded-2xl overflow-hidden p-3">
				<Reorder.Group axis="y" values={entries} onReorder={onReorder} className="space-y-2">
					{entries.map((entry, index) => (
						<Reorder.Item
							key={entry[indexBy || ''] || index}
							value={entry}
							className="group/reorder relative bg-card border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all duration-200 shadow-sm"
						>
							<div className="flex items-center gap-4">
								<div className="text-muted-foreground/30 group-hover/reorder:text-primary transition-colors cursor-grab active:cursor-grabbing">
									<GripVertical size={20} />
								</div>

								<div className="flex-1">
									<span className="text-sm font-bold text-foreground transition-colors group-hover/reorder:text-primary">
										{entry?.title || `Entry ${index + 1}`}
									</span>
								</div>

								<div className="flex items-center gap-1 opacity-0 group-hover/reorder:opacity-100 group-focus-within/reorder:opacity-100 transition-opacity">
									<button
										type="button"
										className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
										onClick={() => onEdit(structuredClone(entry))}
										aria-label={`Edit ${entry?.title || 'entry'}`}
									>
										<Edit size={16} />
									</button>
									<button
										type="button"
										className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex justify-end pt-2"
				>
					<Primary
						Title="Save New Order"
						onClick={onSaveOrder}
						className="!px-6 !py-2.5 !rounded-xl !text-sm shadow-lg shadow-primary/10"
					/>
				</motion.div>
			)}
		</div>
	);
};
