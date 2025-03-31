'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Primary } from '../../ui/Buttons';
import { RadioOption, Toggle, InputField } from './form-elements';
import { executeSettings } from '@/lib/api';
import { FaTrash } from 'react-icons/fa';

interface LockdownSettingsProps {
	guildId: string;
}

interface LockdownSetting {
	id: string;
	require_correct_layout: boolean;
	member_roles: string[];
}

export const LockdownSettings: React.FC<LockdownSettingsProps> = ({ guildId }) => {
	const [radioOption, setRadioOption] = useState('addOther');
	const [requireCorrectLayout, setRequireCorrectLayout] = useState(true);
	const [memberRoles, setMemberRoles] = useState(['']);
	const [existingSettings, setExistingSettings] = useState<LockdownSetting[]>([]);

	useEffect(() => {
		const fetchSettings = async () => {
			const payload = {
				operation: 'View',
				setting: 'lockdown_guilds',
				fields: {}
			};

			try {
				const result = await executeSettings(guildId, payload);
				const settingsData = result.fields.map((setting: any, index: number) => ({
					id: index.toString(),
					require_correct_layout: setting.require_correct_layout,
					member_roles: setting.member_roles
				}));
				setExistingSettings(settingsData);
			} catch (error) {
				console.error('Failed to fetch lockdown settings:', error);
			}
		};

		fetchSettings();
	}, [guildId]);

	const handleAddRole = () => {
		setMemberRoles([...memberRoles, '']);
	};

	const handleRoleChange = (index: number, value: string) => {
		const updatedRoles = [...memberRoles];
		updatedRoles[index] = value;
		setMemberRoles(updatedRoles);
	};

	const handleAddLockdownSettings = async () => {
		const payload = {
			operation: 'Create',
			setting: 'lockdown_guilds',
			fields: {
				require_correct_layout: requireCorrectLayout,
				member_roles: memberRoles.filter((role) => role.trim() !== '')
			}
		};

		try {
			const result = await executeSettings(guildId, payload);
			console.log('Lockdown settings added:', result);
		} catch (error) {
			console.error('Failed to add lockdown settings:', error);
		}
	};

	const handleDeleteSetting = async (id: string) => {
		const payload = {
			operation: 'Delete',
			setting: 'lockdown_guilds',
			fields: {
				guild_id: guildId
			}
		};

		try {
			await executeSettings(guildId, payload);
			setExistingSettings(existingSettings.filter((setting) => setting.id !== id));
		} catch (error) {
			console.error('Failed to delete lockdown setting:', error);
		}
	};

	return (
		<>
			<div className="mb-4">
				<label className="block text-foreground mb-1">Member Roles</label>
				<div className="flex items-center mt-2">
					<RadioOption
						label="Add Other"
						name="memberRoles"
						checked={radioOption === 'addOther'}
						onChange={() => setRadioOption('addOther')}
					/>
					<RadioOption
						label="Add At Position"
						name="memberRoles"
						checked={radioOption === 'addAtPosition'}
						onChange={() => setRadioOption('addAtPosition')}
					/>
				</div>
			</div>

			{memberRoles.map((role, index) => (
				<InputField
					key={index}
					label={`Role ${index + 1}`}
					placeholder="Enter the role"
					value={role}
					onChange={(e) => handleRoleChange(index, e.target.value)}
				/>
			))}

			<Primary Title="Add Another Role" onClick={handleAddRole} />

			<Toggle
				label="Require Correct Layout"
				description="Whether or not a lockdown can proceed even without correct critical role permissions. May lead to partial lockdowns if disabled"
				checked={requireCorrectLayout}
				onChange={() => setRequireCorrectLayout(!requireCorrectLayout)}
			/>

			<Primary Title="Add Lockdown Settings" onClick={handleAddLockdownSettings} />

			<div className="mt-6">
				<h3 className="text-lg font-medium mb-4">Existing Lockdown Settings</h3>
				{existingSettings.map((setting) => (
					<div
						key={setting.id}
						className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
					>
						<div className="flex justify-between items-center">
							<div>
								<p className="font-medium text-foreground">
									Require Correct Layout: {setting.require_correct_layout ? 'Yes' : 'No'}
								</p>
								<p className="text-muted-foreground">
									Member Roles: {setting.member_roles.join(', ')}
								</p>
							</div>
							<Primary
								Title="Delete"
								onClick={() => handleDeleteSetting(setting.id)}
								icon={FaTrash}
							/>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
