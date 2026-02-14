'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface SettingsHeaderProps {
	settingName: string;
	onAddNew: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ settingName, onAddNew }) => {
	return (
		<div className="flex justify-between items-center mb-4">
			<h3 className="text-base font-medium text-foreground">{settingName}</h3>
			<button
				className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/80 hover:text-foreground transition-colors"
				onClick={onAddNew}
			>
				<Plus className="w-4 h-4" />
				<span>New {settingName}</span>
			</button>
		</div>
	);
};
