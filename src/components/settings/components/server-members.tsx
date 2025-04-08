'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Primary, Ghost } from '../../ui/Buttons';
import { InputField, RadioOption, Toggle } from './form-elements';
import { executeSettings } from '@/lib/api';
import { Trash2, User, AlertCircle, Check, X, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ServerMembersProps {
	guildId: string;
}

interface ServerMember {
	id: string;
	user_id: string;
	public: boolean;
	perm_overrides: string[];
}

export const ServerMembers: React.FC<ServerMembersProps> = ({ guildId }) => {
	const [userId, setUserId] = useState('');
	const [radioOption, setRadioOption] = useState('addOther');
	const [permissionValues, setPermissionValues] = useState<string[]>([]);
	const [newPermissionValue, setNewPermissionValue] = useState('');
	const [positionValue, setPositionValue] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [members, setMembers] = useState<ServerMember[]>([]);

	useEffect(() => {
		fetchMembers();
	}, [guildId]);

	const fetchMembers = async () => {
		setIsLoading(true);

		const payload = {
			operation: 'View',
			setting: 'guild_members',
			fields: {}
		};

		try {
			const result = await executeSettings(guildId, payload);
			const membersData = result.fields
				? result.fields.map((member: any, index: number) => ({
						id: index.toString(),
						user_id: member.user_id,
						public: member.public,
						perm_overrides: member.perm_overrides || []
					}))
				: [];
			setMembers(membersData);
		} catch (error) {
			console.error('Failed to fetch server members:', error);
			toast.error('Failed to load server members. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddPermission = () => {
		if (newPermissionValue.trim()) {
			setPermissionValues([...permissionValues, newPermissionValue.trim()]);
			setNewPermissionValue('');
		}
	};

	const handleRemovePermission = (index: number) => {
		const updatedPermissions = [...permissionValues];
		updatedPermissions.splice(index, 1);
		setPermissionValues(updatedPermissions);
	};

	const handleAddServerMember = async () => {
		if (!userId.trim()) {
			toast.error('User ID is required');
			return;
		}

		setIsLoading(true);
		setSuccess(null);

		const permOverrides =
			radioOption === 'addOther' ? permissionValues : [positionValue].filter(Boolean);

		const payload = {
			operation: 'Create',
			setting: 'guild_members',
			fields: {
				user_id: userId,
				public: isPublic,
				perm_overrides: permOverrides
			}
		};

		try {
			await executeSettings(guildId, payload);
			toast.success('Server member added successfully');
			fetchMembers();
			// Reset form
			setUserId('');
			setPermissionValues([]);
			setNewPermissionValue('');
			setPositionValue('');
		} catch (error) {
			console.error('Failed to add server member:', error);
			toast.error('Failed to add server member. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteMember = async (memberId: string) => {
		setIsLoading(true);
		setSuccess(null);

		const memberToDelete = members.find((m) => m.id === memberId);
		if (!memberToDelete) return;

		const payload = {
			operation: 'Delete',
			setting: 'guild_members',
			fields: {
				user_id: memberToDelete.user_id
			}
		};

		try {
			await executeSettings(guildId, payload);
			setMembers(members.filter((m) => m.id !== memberId));
			toast.success('Server member deleted successfully');
		} catch (error) {
			console.error('Failed to delete server member:', error);
			toast.error('Failed to delete server member. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-lg p-5 shadow-sm">
				<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
					<UserPlus className="w-5 h-5 text-primary" />
					Add Server Member
				</h3>

				<InputField
					label="User ID"
					description="The user ID. Cannot be updated once set"
					placeholder="Enter the user ID"
					value={userId}
					onChange={(e) => setUserId(e.target.value)}
				/>

				<div className="mb-6">
					<label className="block text-foreground font-medium mb-2">Permission Overrides</label>
					<div className="flex items-center mt-2 bg-muted/30 p-3 rounded-lg mb-4">
						<RadioOption
							label="Add Other"
							name="permissionOverrides"
							checked={radioOption === 'addOther'}
							onChange={() => setRadioOption('addOther')}
						/>
						<RadioOption
							label="Add At Position"
							name="permissionOverrides"
							checked={radioOption === 'addAtPosition'}
							onChange={() => setRadioOption('addAtPosition')}
						/>
					</div>

					<AnimatePresence mode="wait">
						{radioOption === 'addOther' ? (
							<motion.div
								key="addOther"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2 }}
								className="space-y-3"
							>
								{/* Display existing permissions */}
								<AnimatePresence>
									{permissionValues.length > 0 && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="space-y-2 mb-3"
										>
											{permissionValues.map((value, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: 10 }}
													className="flex items-center"
												>
													<div className="flex-1 bg-muted/30 px-3 py-2 rounded-l-md text-foreground">
														{value}
													</div>
													<Ghost
														icon={X}
														onClick={() => handleRemovePermission(index)}
														Title="Remove permission"
													/>
												</motion.div>
											))}
										</motion.div>
									)}
								</AnimatePresence>

								{/* Add new permission field */}
								<div className="flex">
									<input
										type="text"
										placeholder="Enter permission value"
										value={newPermissionValue}
										onChange={(e) => setNewPermissionValue(e.target.value)}
										className="flex-grow bg-background border border-border rounded-l-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
									/>
									<button
										type="button"
										onClick={handleAddPermission}
										disabled={!newPermissionValue.trim()}
										className="px-4 py-2 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Add
									</button>
								</div>

								{permissionValues.length === 0 && !newPermissionValue && (
									<p className="text-sm text-muted-foreground mt-1">No values added</p>
								)}
							</motion.div>
						) : (
							<motion.div
								key="addAtPosition"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2 }}
								className="flex flex-col"
							>
								<InputField
									label="Position Value"
									placeholder="Enter position value"
									value={positionValue}
									onChange={(e) => setPositionValue(e.target.value)}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<Toggle
					label="Public"
					description="Whether the member is public or not"
					checked={isPublic}
					onChange={() => setIsPublic(!isPublic)}
				/>

				{success && (
					<div className="bg-primary/10 border border-primary/30 rounded-md p-3 flex items-center gap-2 text-sm mt-4">
						<Check className="w-4 h-4 text-primary" />
						<p className="text-primary">{success}</p>
					</div>
				)}

				<div className="mt-6">
					<Primary Title="Add Server Member" onClick={handleAddServerMember} icon={UserPlus} />
				</div>
			</div>

			<div className="mt-8">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium">Server Members</h3>
				</div>

				{isLoading && members.length === 0 ? (
					<div className="flex justify-center items-center py-12">
						<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : members.length === 0 ? (
					<div className="bg-muted/30 rounded-lg p-8 text-center">
						<div className="flex justify-center mb-3">
							<div className="p-3 bg-muted rounded-full">
								<User className="w-6 h-6 text-muted-foreground" />
							</div>
						</div>
						<h4 className="text-foreground font-medium mb-1">No server members configured</h4>
						<p className="text-muted-foreground text-sm">
							Add your first server member to get started
						</p>
					</div>
				) : (
					<div className="grid gap-4">
						<AnimatePresence>
							{members.map((member) => (
								<motion.div
									key={member.id}
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
								>
									<div className="flex flex-col md:flex-row md:items-center gap-3">
										<div className="flex-1">
											<div className="mb-2">
												<h4 className="font-medium text-foreground">User ID:</h4>
												<code className="px-2 py-1 bg-muted/50 rounded-md text-sm">
													{member.user_id}
												</code>
											</div>
											<div className="flex items-center gap-3 mb-2">
												<h4 className="font-medium text-foreground">Public:</h4>
												<span
													className={`px-2 py-1 rounded-md text-xs font-medium ${
														member.public
															? 'bg-primary/10 text-primary'
															: 'bg-muted text-muted-foreground'
													}`}
												>
													{member.public ? 'Yes' : 'No'}
												</span>
											</div>
											<div>
												<h4 className="font-medium text-foreground">Permission Overrides:</h4>
												<div className="flex flex-wrap gap-2 mt-1">
													{member.perm_overrides && member.perm_overrides.length > 0 ? (
														member.perm_overrides.map((perm, idx) => (
															<span
																key={idx}
																className="px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground"
															>
																{perm}
															</span>
														))
													) : (
														<span className="text-sm text-muted-foreground">
															No permission overrides
														</span>
													)}
												</div>
											</div>
										</div>
										<Ghost
											icon={Trash2}
											onClick={() => handleDeleteMember(member.id)}
											Title="Delete member"
										/>
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
