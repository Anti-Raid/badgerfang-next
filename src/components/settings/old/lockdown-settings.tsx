'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Primary } from '@/components/ui/Buttons';
import { RadioOption, Toggle, InputField } from '../components/form-elements';
import { executeSettings } from '@/lib/api';
import { Trash2, Plus, Lock, AlertCircle, Shield, Save } from 'lucide-react';
import { toast } from 'react-toastify';

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
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		fetchSettings();
	}, [guildId]);

	const fetchSettings = async () => {
		setIsLoading(true);
		setError(null);

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
			setError('Failed to load lockdown settings. Please try again.');
			toast.error('Failed to load lockdown settings');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddRole = () => {
		setMemberRoles([...memberRoles, '']);
	};

	const handleRoleChange = (index: number, value: string) => {
		const updatedRoles = [...memberRoles];
		updatedRoles[index] = value;
		setMemberRoles(updatedRoles);
	};

	const handleRemoveRole = (index: number) => {
		if (memberRoles.length > 1) {
			const updatedRoles = [...memberRoles];
			updatedRoles.splice(index, 1);
			setMemberRoles(updatedRoles);
		}
	};

	const handleAddLockdownSettings = async () => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		const filteredRoles = memberRoles.filter((role) => role.trim() !== '');

		if (filteredRoles.length === 0) {
			setError('Please add at least one member role');
			toast.error('Please add at least one member role');
			setIsLoading(false);
			return;
		}

		const payload = {
			operation: 'Create',
			setting: 'lockdown_guilds',
			fields: {
				require_correct_layout: requireCorrectLayout,
				member_roles: filteredRoles
			}
		};

		try {
			await executeSettings(guildId, payload);
			setSuccess('Lockdown settings added successfully');
			toast.success('Lockdown settings added successfully');
			fetchSettings();
			setMemberRoles(['']);
		} catch (error) {
			console.error('Failed to add lockdown settings:', error);
			setError('Failed to add lockdown settings. Please try again.');
			toast.error('Failed to add lockdown settings');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSetting = async (id: string) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

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
			setSuccess('Lockdown setting deleted successfully');
			toast.success('Lockdown setting deleted successfully');
		} catch (error) {
			console.error('Failed to delete lockdown setting:', error);
			setError('Failed to delete lockdown setting. Please try again.');
			toast.error('Failed to delete lockdown setting');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				className="bg-card border border-border rounded-lg p-5 shadow-sm"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
					<Lock className="w-5 h-5 text-primary" />
					Configure Lockdown Settings
				</h3>

				{/* Member Roles Configuration */}
				<div className="mb-4">
					<label className="block text-foreground font-medium mb-2">
						Member Roles Configuration
					</label>
					<div className="flex items-center mt-2 bg-muted/30 p-3 rounded-lg">
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

				{/* Member Roles Fields */}
				<div className="space-y-3 mb-6">
					<label className="block text-foreground font-medium mb-2">Member Roles</label>
					<AnimatePresence>
						{memberRoles.map((role, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, height: 0 }}
								className="flex items-center gap-2"
							>
								<div className="flex-1">
									<InputField
										label={`Role ${index + 1}`}
										placeholder="Enter the role ID"
										value={role}
										onChange={(e) => handleRoleChange(index, e.target.value)}
									/>
								</div>
								<motion.button
									whileHover={{ scale: 1.1, color: 'rgb(var(--destructive))' }}
									whileTap={{ scale: 0.9 }}
									onClick={() => handleRemoveRole(index)}
									className="self-end mb-6 p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
								>
									<Trash2 className="w-5 h-5" />
								</motion.button>
							</motion.div>
						))}
					</AnimatePresence>

					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleAddRole}
						className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-2"
					>
						<Plus className="w-4 h-4" />
						<span>Add Another Role</span>
					</motion.button>
				</div>

				{/* Require Correct Layout Toggle */}
				<Toggle
					label="Require Correct Layout"
					description="Whether or not a lockdown can proceed even without correct critical role permissions. May lead to partial lockdowns if disabled"
					checked={requireCorrectLayout}
					onChange={() => setRequireCorrectLayout(!requireCorrectLayout)}
				/>

				{/* Errors */}
				{error && (
					<div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-center gap-2 text-sm mt-4">
						<AlertCircle className="w-4 h-4 text-destructive" />
						<p className="text-destructive">{error}</p>
					</div>
				)}

				{/* Success */}
				{success && (
					<div className="bg-primary/10 border border-primary/30 rounded-md p-3 flex items-center gap-2 text-sm mt-4">
						<Shield className="w-4 h-4 text-primary" />
						<p className="text-primary">{success}</p>
					</div>
				)}

				{/* Save Button */}
				<div className="mt-6">
					<Primary Title="Save Lockdown Settings" onClick={handleAddLockdownSettings} icon={Save} />
				</div>
			</motion.div>

			<div className="mt-8">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium flex items-center gap-2">
						<Lock className="w-5 h-5 text-primary" />
						Existing Lockdown Settings
					</h3>
				</div>

				{isLoading && existingSettings.length === 0 ? (
					<div className="flex justify-center items-center py-12">
						<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : existingSettings.length === 0 ? (
					<motion.div
						className="bg-muted/30 rounded-lg p-8 text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex justify-center mb-3">
							<div className="p-3 bg-muted rounded-full">
								<Lock className="w-6 h-6 text-muted-foreground" />
							</div>
						</div>
						<h4 className="text-foreground font-medium mb-1">No lockdown settings configured</h4>
						<p className="text-muted-foreground text-sm">
							Add your first lockdown setting to secure your server
						</p>
					</motion.div>
				) : (
					<div className="grid gap-4">
						<AnimatePresence>
							{existingSettings.map((setting, index) => (
								<motion.div
									key={setting.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
									whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
								>
									<div className="flex flex-col md:flex-row md:items-center gap-3">
										<div className="flex-1">
											<div className="mb-2">
												<h4 className="font-medium text-foreground">Require Correct Layout:</h4>
												<div className="flex items-center mt-1">
													<span
														className={`px-2 py-1 rounded-md text-xs font-medium ${
															setting.require_correct_layout
																? 'bg-primary/10 text-primary'
																: 'bg-muted text-muted-foreground'
														}`}
													>
														{setting.require_correct_layout ? 'Enabled' : 'Disabled'}
													</span>
												</div>
											</div>
											<div>
												<h4 className="font-medium text-foreground mb-1">Member Roles:</h4>
												<ul className="list-disc list-inside text-sm text-muted-foreground">
													{setting.member_roles.map((role, idx) => (
														<li key={idx}>{role}</li>
													))}
												</ul>
											</div>
										</div>

										<motion.button
											whileHover={{ scale: 1.1, color: 'rgb(var(--destructive))' }}
											whileTap={{ scale: 0.9 }}
											onClick={() => handleDeleteSetting(setting.id)}
											className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
										>
											<Trash2 className="w-5 h-5" />
										</motion.button>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	);
};
