'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Column } from '@/types/settings';
import { UserGuildBaseData } from '@/types/gosdk/types';

import { SettingsColumnList } from './settings-column';
import { Primary } from '../../ui/Buttons';

interface SettingsFormProps {
	columns: Column[];
	values: any;
	onChange: (values: any) => void;
	onSave: () => void;
	onCancel: () => void;
	operation: 'Create' | 'Update';
	guildData: UserGuildBaseData;
	settingName: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
	columns,
	values,
	onChange,
	onSave,
	onCancel,
	operation,
	guildData,
	settingName
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
		>
			<SettingsColumnList
				columns={columns}
				values={values}
				onChange={onChange}
				operation={operation}
				guildData={guildData}
			/>

			<div className="flex gap-2 mt-4">
				<Primary Title={operation === 'Create' ? `Add ${settingName}` : 'Save'} onClick={onSave} />
				<button
					className="px-4 py-2 border border-primary border-opacity-20 rounded-md text-foreground hover:bg-accent/50 transition-colors"
					onClick={onCancel}
				>
					Cancel
				</button>
			</div>
		</motion.div>
	);
};
