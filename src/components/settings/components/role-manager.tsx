import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2, Edit } from 'lucide-react';
import { Primary } from '../../ui/Buttons';
import { InputField } from './form-elements';
import { executeSettings, getUserGuildBaseInfo } from '@/lib/api';
import { toast } from 'react-toastify'; // Import toast

interface Role {
	role_id: string;
	display_name: string;
	index: number;
	perms?: string[];
}

interface RoleManagerProps {
	guildId: string;
}

export const RoleManager: React.FC<RoleManagerProps> = ({ guildId }) => {
	const [roles, setRoles] = useState<Role[]>([]);
	const [newRole, setNewRole] = useState<Role>({
		role_id: '',
		display_name: '',
		index: roles.length + 1,
		perms: []
	});
	const [showNewRoleForm, setShowNewRoleForm] = useState(false);
	const [editingRole, setEditingRole] = useState<Role | null>(null);
	const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
	const [isReordered, setIsReordered] = useState(false);

	const fetchRoles = async () => {
		const payload = {
			operation: 'View',
			setting: 'roles',
			fields: {}
		};

		try {
			const result = await executeSettings(guildId, payload);
			const rolesWithDisplayName = result.fields.map((role: Role) => {
				const roleOption = roleOptions.find((option) => option.value === role.role_id);
				return {
					...role,
					display_name: role.display_name || roleOption?.label || ''
				};
			});
			setRoles(rolesWithDisplayName || []);
		} catch (error) {
			toast.error('Failed to fetch roles'); // Display error toast
		}
	};

	useEffect(() => {
		fetchRoles();
	}, [guildId]);

	useEffect(() => {
		const fetchRoleOptions = async () => {
			try {
				const data = await getUserGuildBaseInfo(guildId);
				const options = data.roles.map((role: { id: string; name: string }) => ({
					value: role.id,
					label: role.name
				}));
				setRoleOptions(options);
			} catch (error) {
				toast.error('Failed to fetch role options'); // Display error toast
			}
		};

		fetchRoleOptions();
	}, [guildId]);

	const handleAddRole = async () => {
		if (newRole.display_name.trim() && newRole.role_id.trim()) {
			const newRoleObj: Role = {
				role_id: newRole.role_id,
				display_name: newRole.display_name,
				index: roles.length + 1,
				perms: newRole.perms
			};

			const payload = {
				operation: 'Create',
				setting: 'roles',
				fields: newRoleObj
			};

			try {
				await executeSettings(guildId, payload);
				setNewRole({ role_id: '', display_name: '', index: roles.length + 2, perms: [] });
				setShowNewRoleForm(false);
				fetchRoles(); // Fetch roles again after adding a new role
			} catch (error) {
				toast.error('Failed to add role'); // Display error toast
			}
		}
	};

	const handleDeleteRole = async (roleId: string) => {
		const payload = {
			operation: 'Delete',
			setting: 'roles',
			fields: { role_id: roleId }
		};

		try {
			await executeSettings(guildId, payload);
			setRoles(roles.filter((role) => role.role_id !== roleId));
		} catch (error) {
			toast.error('Failed to delete role'); // Display error toast
		}
	};

	const handleEditRole = (role: Role) => {
		setEditingRole(role);
	};

	const handleSaveEdit = async () => {
		if (editingRole) {
			const payload = {
				operation: 'Edit',
				setting: 'roles',
				fields: [editingRole]
			};

			try {
				await executeSettings(guildId, payload);
				setRoles(roles.map((role) => (role.role_id === editingRole.role_id ? editingRole : role)));
				setEditingRole(null);
			} catch (error) {
				toast.error('Failed to edit role'); // Display error toast
			}
		}
	};

	const handleSaveReorder = async () => {
		const updatedRoles = roles.map((role, index) => ({ ...role, index: index + 1 }));
		const payload = {
			operation: 'Edit',
			setting: 'roles',
			fields: updatedRoles
		};

		try {
			await executeSettings(guildId, payload);
			setRoles(updatedRoles);
			setIsReordered(false);
		} catch (error) {
			toast.error('Failed to save reordered roles'); // Display error toast
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">Server Roles</h3>
				<button
					className="flex items-center gap-1 text-foreground bg-accent px-3 py-1.5 rounded-md hover:bg-accent/80 transition-colors"
					onClick={() => setShowNewRoleForm(!showNewRoleForm)}
				>
					<Plus className="w-4 h-4" />
					<span>New Role</span>
				</button>
			</div>

			{showNewRoleForm && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
				>
					<InputField
						label="Role ID"
						placeholder="Select role ID"
						type="select"
						value={newRole.role_id}
						onChange={(e) => {
							const selectedRole = roleOptions.find((option) => option.value === e.target.value);
							setNewRole({
								...newRole,
								role_id: e.target.value,
								display_name: selectedRole?.label || ''
							});
						}}
						options={roleOptions}
					/>

					<InputField
						label="Permissions"
						placeholder="Enter permissions (comma-separated)"
						value={newRole.perms?.join(',')}
						onChange={(e) =>
							setNewRole({
								...newRole,
								perms: e.target.value.split(',').map((perm) => perm.trim())
							})
						}
					/>

					<div className="flex gap-2">
						<Primary Title="Add Role" onClick={handleAddRole} />
						<button
							className="px-4 py-2 border border-primary border-opacity-20 rounded-md text-foreground hover:bg-accent/50"
							onClick={() => setShowNewRoleForm(false)}
						>
							Cancel
						</button>
					</div>
				</motion.div>
			)}

			{editingRole && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
				>
					<InputField
						label="Role ID"
						placeholder="Select role ID"
						type="select"
						value={editingRole.role_id}
						onChange={(e) => {
							const selectedRole = roleOptions.find((option) => option.value === e.target.value);
							setEditingRole({
								...editingRole,
								role_id: e.target.value,
								display_name: selectedRole?.label || ''
							});
						}}
						options={roleOptions}
					/>

					<InputField
						label="Permissions"
						placeholder="Enter permissions (comma-separated)"
						value={editingRole.perms?.join(',')}
						onChange={(e) =>
							setEditingRole({
								...editingRole,
								perms: e.target.value.split(',').map((perm) => perm.trim())
							})
						}
					/>

					<InputField
						label="Index"
						placeholder="Enter index"
						value={String(editingRole.index)}
						onChange={(e) => setEditingRole({ ...editingRole, index: Number(e.target.value) })}
					/>

					<div className="flex gap-2">
						<Primary Title="Save" onClick={handleSaveEdit} />
						<button
							className="px-4 py-2 border border-primary border-opacity-20 rounded-md text-foreground hover:bg-accent/50"
							onClick={() => setEditingRole(null)}
						>
							Cancel
						</button>
					</div>
				</motion.div>
			)}

			<div className="bg-background border border-primary border-opacity-20 rounded-md overflow-hidden">
				<Reorder.Group
					axis="y"
					values={roles}
					onReorder={(newRoles) => {
						setRoles(newRoles);
						setIsReordered(true);
					}}
					className="divide-y divide-primary divide-opacity-10"
				>
					{roles.map((role) => (
						<Reorder.Item key={role.role_id} value={role} className="p-3">
							<div className="flex items-center gap-3">
								<GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
								<span className="font-medium text-foreground">{role.display_name}</span>
								<div className="ml-auto flex items-center gap-2">
									<button
										className="p-1 rounded-md hover:bg-accent/50"
										onClick={() => handleEditRole(role)}
									>
										<Edit className="w-4 h-4 text-muted-foreground" />
									</button>
									<button
										className="p-1 rounded-md hover:bg-accent/50"
										onClick={() => handleDeleteRole(role.role_id)}
									>
										<Trash2 className="w-4 h-4 text-muted-foreground" />
									</button>
								</div>
							</div>
						</Reorder.Item>
					))}
				</Reorder.Group>
			</div>

			{isReordered && (
				<div className="flex justify-end">
					<Primary Title="Save Order" onClick={handleSaveReorder} />
				</div>
			)}

			<p className="text-sm text-muted-foreground">
				Drag to reorder roles. Higher roles have more permissions.
			</p>
		</div>
	);
};
