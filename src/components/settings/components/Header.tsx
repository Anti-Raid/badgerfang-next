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
			<h3 className="text-lg font-medium">{settingName}</h3>
			<button
				className="flex items-center gap-1 text-foreground bg-accent px-3 py-1.5 rounded-md hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				onClick={onAddNew}
			>
				<Plus className="w-4 h-4" />
				<span>New {settingName}</span>
			</button>
		</div>
	);
};
