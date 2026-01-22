'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SettingsColumnList } from './settings-column';
import { Primary } from '../../ui/Buttons';
import { Column } from '@/types/api/bindings/Column';
import { BaseGuildUserInfo } from '@/types/api/bindings/BaseGuildUserInfo';

interface SettingsFormProps {
	columns: Column[];
	values: any;
	onChange: (values: any) => void;
	onSave: () => void;
	onCancel: () => void;
	operation: 'Create' | 'Update';
	guildData: BaseGuildUserInfo;
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
	const formRef = React.useRef<HTMLFormElement>(null);

	React.useEffect(() => {
		// Auto-focus the first input or actionable element in the form
		const firstInput = formRef.current?.querySelector(
			'input, textarea, select, button:not([aria-label="Cancel"])'
		) as HTMLElement;
		if (firstInput) {
			firstInput.focus();
		}
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave();
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			className="mb-10"
		>
			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className="bg-card border border-border/50 rounded-3xl p-8 lg:p-10 shadow-2xl"
			>
				<div className="flex items-center justify-between mb-8">
					<div>
						<h3 className="text-xl font-bold tracking-tight text-foreground">
							{operation === 'Create' ? `Add ${settingName}` : `Edit ${settingName}`}
						</h3>
						<p className="text-xs text-muted-foreground mt-1 font-medium">
							Please fill in the details below
						</p>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
						aria-label="Cancel"
					>
						<Plus size={20} className={operation === 'Update' ? 'rotate-45' : ''} />
					</button>
				</div>

				<div>
					<SettingsColumnList
						columns={columns}
						values={values}
						onChange={onChange}
						operation={operation}
						guildData={guildData}
					/>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 mt-10 pt-8 border-t border-border/50">
					<div className="flex-1">
						<Primary
							Title={operation === 'Create' ? `Create ${settingName}` : 'Save Changes'}
							type="submit"
							className="w-full !py-3 !rounded-xl !text-sm !font-bold shadow-lg shadow-primary/10"
						/>
					</div>
					<button
						type="button"
						className="px-8 py-3 rounded-xl bg-accent/50 text-foreground font-bold text-sm hover:bg-accent transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-border/50"
						onClick={onCancel}
					>
						Cancel
					</button>
				</div>
			</form>
		</motion.div>
	);
};
