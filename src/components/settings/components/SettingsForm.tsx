'use client';

import React from 'react';
import { X } from 'lucide-react';
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
		<div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 mb-8">
			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className="bg-card border border-border rounded-xl p-6"
				role="form"
				aria-label={operation === 'Create' ? `Add ${settingName}` : `Edit ${settingName}`}
			>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-lg font-medium text-foreground">
							{operation === 'Create' ? `Add ${settingName}` : `Edit ${settingName}`}
						</h3>
						<p className="text-sm text-muted-foreground mt-1">Fill in the details below</p>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
						aria-label="Cancel"
					>
						<X size={18} />
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

				<div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border">
					<div className="flex-1">
						<Primary
							Title={operation === 'Create' ? `Create ${settingName}` : 'Save Changes'}
							type="submit"
							className="w-full !py-2.5 !rounded-xl !text-sm !font-medium"
						/>
					</div>
					<button
						type="button"
						className="px-6 py-2.5 rounded-xl bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
						onClick={onCancel}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};
