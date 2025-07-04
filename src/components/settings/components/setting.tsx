import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { Ghost, Primary, Secondary } from '../../ui/Buttons';
import { GroupedRadioOption, InputField, RadioOption, Toggle } from './form-elements';
import { executeSettings, getUserGuildBaseInfo } from '@/lib/api';
import { toast } from 'react-toastify'; // Import toast
import {
	Setting,
	Column,
	ColumnType,
	InnerColumnTypeUnion,
	InnerColumnType,
	InnerWidget
} from '@/types/settings'; // Adjust the import path as needed
import { Settings } from 'http2';

interface Role {
	role_id: string;
	display_name: string;
	index: number;
	perms?: string[];
}

interface RoleManagerProps {
	guildId: string;
	setting: Setting;
}

export const RoleManager: React.FC<RoleManagerProps> = ({ guildId, setting }) => {
	const [roles, setRoles] = useState<Role[]>([]);
	const [fields, setFields] = useState<any[]>([]); // Fields fetched from settings API on View operation
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

	const fetchSetting = async () => {
		/*
        const payload = {
            operation: 'View',
            setting: setting.id,
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
        }*/

		// TODO: Use dummy data
		setFields([
			{
				foo: 'This is a dummy field for testing purposes',
				bar: 'This is another dummy field'
			}
		]);
	};

	useEffect(() => {
		fetchSetting();
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
				fetchSetting(); // Fetch roles again after adding a new role
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
		/*if (editingRole) {
            const payload = {
                operation: 'Update',
                setting: 'roles',
                fields: {
                    role_id: editingRole.role_id,
                    perms: editingRole.perms,
                    index: editingRole.index,
                    display_name: editingRole.display_name
                }
            };

            try {
                await executeSettings(guildId, payload);
                setRoles(roles.map((role) => (role.role_id === editingRole.role_id ? editingRole : role)));
                setEditingRole(null);
            } catch (error) {
                toast.error('Failed to edit role'); // Display error toast
            }
        }*/
	};

	const handleSaveReorder = async () => {
		const updatedRoles = roles.map((role, index) => ({ ...role, index: index + 1 }));
		const payload = {
			operation: 'Update',
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
					<span>New {setting.name}</span>
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
								<span className="font-medium text-foreground">
									{role?.display_name || 'Role Name'}
								</span>
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

const assertInnerColumnTypeUnion = (v: any): InnerColumnTypeUnion => v;

interface SettingsColumnProps {
	column: Column;
	value: any;
	onChange: (value: any) => void;
}

export const SettingsColumn: React.FC<SettingsColumnProps> = ({ column, value, onChange }) => {
	return (
		<>
			{column.column_type.type === ColumnType.Scalar ? (
				<>
					<div className="items-center mt-2 bg-muted/30 p-3 rounded-lg">
						<SettingsInnerColumn
							parentColumn={column}
							column={column.column_type.inner}
							id={column.id}
							value={value}
							onChange={onChange}
							marginClass="mb-4"
						/>
					</div>
				</>
			) : column.column_type.type === ColumnType.Array ? (
				<>
					<div className="items-center mt-2 bg-muted/30 p-3 rounded-lg">
						{Array.isArray(value) ? (
							value.map((item, index) => (
								<React.Fragment key={index}>
									<SettingsInnerColumn
										key={`${column.id}-${index}`}
										parentColumn={column}
										column={assertInnerColumnTypeUnion(column.column_type.inner)} // Workaround for TypeScript bug
										columnLabel={`${column.name} (${index + 1})`}
										id={`${column.id}-${index}`}
										value={item}
										onChange={(newValue) => {
											const newArray = [...value];
											newArray[index] = newValue;
											onChange(newArray);
										}}
										marginClass="mb-2"
									/>

									<span className="mr-2">
										<Secondary
											Title="Add Above"
											onClick={() => {
												let ict = assertInnerColumnTypeUnion(column.column_type.inner);

												let newElement: any = '';
												if (
													ict.type === InnerColumnType.Integer ||
													ict.type === InnerColumnType.Float
												) {
													newElement = 0;
												} else if (ict.type === InnerColumnType.Boolean) {
													newElement = false;
												}

												const newArray = value.toSpliced(index, 0, newElement);
												onChange(newArray);
											}}
										/>
									</span>
									<span className="mr-2">
										<Secondary
											Title="Add Below"
											onClick={() => {
												let ict = assertInnerColumnTypeUnion(column.column_type.inner);

												let newElement: any = '';
												if (
													ict.type === InnerColumnType.Integer ||
													ict.type === InnerColumnType.Float
												) {
													newElement = 0;
												} else if (ict.type === InnerColumnType.Boolean) {
													newElement = false;
												}

												const newArray = value.toSpliced(index + 1, 0, newElement);
												onChange(newArray);
											}}
										/>
									</span>
									<span className="mr-2">
										<Secondary
											Title="Delete"
											onClick={() => {
												let ict = assertInnerColumnTypeUnion(column.column_type.inner);

												let newElement: any = '';
												if (
													ict.type === InnerColumnType.Integer ||
													ict.type === InnerColumnType.Float
												) {
													newElement = 0;
												} else if (ict.type === InnerColumnType.Boolean) {
													newElement = false;
												}

												const newArray = value.filter((_, idx) => idx !== index);
												onChange(newArray);
											}}
										/>
									</span>
									{index != value.length - 1 && <div className="mt-5"></div>}
								</React.Fragment>
							))
						) : (
							<motion.div
								className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-3 mb-2"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								role="alert"
								aria-live="polite"
							>
								<AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />
								<p className="text-yellow-800 font-medium">
									<span className="font-bold">
										Schema Error: Array column type passed but input is not an array
									</span>
								</p>
							</motion.div>
						)}
					</div>
				</>
			) : column.column_type.type === ColumnType.Widget ? (
				<>
					{column.column_type.inner.type === InnerWidget.Info ? (
						<motion.div
							className="bg-blue-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-3 mb-2"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							role="alert"
							aria-live="polite"
						>
							<AlertCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
							<p className="text-yellow-800 font-medium">
								<span className="font-bold">{column.column_type.inner.message}</span>
							</p>
						</motion.div>
					) : column.column_type.inner.type === InnerWidget.Warning ? (
						<motion.div
							className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-3 mb-2"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							role="alert"
							aria-live="polite"
						>
							<AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />
							<p className="text-yellow-800 font-medium">
								<span className="font-bold">{column.column_type.inner.message}</span>
							</p>
						</motion.div>
					) : column.column_type.inner.type === InnerWidget.Button ? (
						<motion.div
							className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-3 mb-2"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							role="alert"
							aria-live="polite"
						>
							<AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />
							<p className="text-yellow-800 font-medium">
								<span className="font-bold">Use of unsupported feature: Custom Action Buttons</span>
							</p>
						</motion.div>
					) : (
						<motion.div
							className="bg-red-100 border border-red-300 rounded-lg p-4 flex items-center gap-3 mb-2"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							role="alert"
							aria-live="polite"
						>
							<AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
							<p className="text-red-800 font-medium">
								<span className="font-bold">Unknown widget type: {column.column_type.inner}</span>
							</p>
						</motion.div>
					)}
				</>
			) : (
				<>
					{/* Fallback for unsupported column types */}
					<motion.div
						className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-3 mb-2"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						role="alert"
						aria-live="polite"
					>
						<AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />
						<p className="text-yellow-800 font-medium">
							<span className="font-bold">
								Use of unsupported feature ict.{JSON.stringify(column.column_type)}
							</span>
						</p>
					</motion.div>
				</>
			)}
		</>
	);
};

interface SettingsInnerColumnProps {
	parentColumn: Column;
	column: InnerColumnTypeUnion;
	columnLabel?: string;
	id: string;
	value: any;
	onChange: (value: any) => void;
	marginClass?: string;
}

/**
 * Defines the inner column for a setting.
 *
 * Setting columnLabel will allow overriding this inner column label while marginClass allows controlling the bottom
 * margin to the input element
 *
 * Note that the following features are unsupported:
 * - Bitflag inputs
 */
const SettingsInnerColumn: React.FC<SettingsInnerColumnProps> = ({
	parentColumn,
	column,
	columnLabel,
	id,
	value,
	onChange,
	marginClass
}) => {
	let [valueType, setValueType] = useState<string>('string');
	return (
		<>
			{column.type === InnerColumnType.String ? (
				<>
					{column.allowed_values.length > 0 ? (
						<GroupedRadioOption
							id={id}
							label={columnLabel || parentColumn.name}
							description={parentColumn.description}
							value={value}
							allowedValues={column.allowed_values}
							onChange={onChange}
							aria-required="true"
							marginClass={marginClass}
						/>
					) : (
						<InputField
							label={columnLabel || parentColumn.name}
							description={parentColumn.description}
							placeholder={parentColumn.placeholder}
							value={value}
							onChange={(e) => onChange(e.target.value)}
							id={id}
							aria-required="true"
							marginClass={marginClass}
						/>
					)}
				</>
			) : column.type === InnerColumnType.Integer ? (
				<InputField
					label={columnLabel || parentColumn.name}
					description={parentColumn.description}
					placeholder={parentColumn.placeholder}
					value={value}
					onChange={(e) => {
						let number = parseFloat(e.target.value);
						if (isNaN(number)) {
							number = 0; // Default to 0 if not a valid number
						}
						number = Math.floor(number); // Ensure it's an integer
						onChange(number);
					}}
					id={id}
					type=""
					aria-required="true"
					marginClass={marginClass}
				/>
			) : column.type === InnerColumnType.Float ? (
				<InputField
					label={columnLabel || parentColumn.name}
					description={parentColumn.description}
					placeholder={parentColumn.placeholder}
					value={value}
					onChange={(e) => {
						let number = parseFloat(e.target.value);
						if (isNaN(number)) {
							number = 0.0; // Default to 0.0 if not a valid number
						}
						onChange(number);
					}}
					id={id}
					type="number"
					aria-required="true"
					marginClass={marginClass}
				/>
			) : column.type == InnerColumnType.BitFlag ? (
				<motion.div
					className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-3 mb-2"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					role="alert"
					aria-live="polite"
				>
					<AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />
					<p className="text-yellow-800 font-medium">
						<span className="font-bold">Bitflag input is currently not supported</span>
					</p>
				</motion.div>
			) : column.type == InnerColumnType.Boolean ? (
				<Toggle
					label={columnLabel || parentColumn.name}
					description={parentColumn.description}
					checked={value}
					onChange={() => onChange(!value)}
					marginClass={marginClass}
				/>
			) : column.type == InnerColumnType.Json ? (
				<>
					<InputField
						label={columnLabel || parentColumn.name}
						description={parentColumn.description}
						placeholder={parentColumn.placeholder}
						value={value}
						onChange={(e) => {
							if (valueType === 'json') {
								try {
									const jsonValue = JSON.parse(e.target.value);
									onChange(jsonValue);
								} catch (error) {
									toast.error('Invalid JSON format'); // Display error toast
									return;
								}
							} else if (valueType === 'number') {
								const numberValue = parseFloat(e.target.value);
								if (isNaN(numberValue)) {
									toast.error('Invalid number format'); // Display error toast
									return;
								}
								onChange(numberValue);
							} else {
								// For string type, just pass the value as is
								onChange(e.target.value);
							}
						}}
						id={id}
						aria-required="true"
						marginClass={marginClass}
					/>
					<div
						className="flex items-center gap-4 mt-4 mb-4"
						role="radiogroup"
						aria-label="Value Type"
					>
						<label className="text-sm font-medium text-foreground" id="value-type-label">
							Value Type:
						</label>
						<div className="flex bg-muted/30 rounded-lg p-1" aria-labelledby="value-type-label">
							{['string', 'json', 'number'].map((type) => (
								<button
									key={type}
									onClick={() => setValueType(type)}
									className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
										valueType === type
											? 'bg-primary text-primary-foreground outline outline-2 outline-primary'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
									}`}
									role="radio"
									aria-checked={valueType === type}
									tabIndex={0}
									aria-label={type.charAt(0).toUpperCase() + type.slice(1)}
								>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</button>
							))}
						</div>
					</div>
				</>
			) : (
				<>
					{/* Fallback */}
					<InputField
						label={parentColumn.name}
						description={parentColumn.description}
						placeholder={parentColumn.placeholder}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						id={id}
						aria-required="true"
						marginClass={marginClass}
					/>
				</>
			)}
		</>
	);
};
