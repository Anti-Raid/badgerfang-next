import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2, Edit, AlertCircle, Code } from 'lucide-react';
import { Primary, Secondary } from '../../ui/Buttons';
import {
	BaseLabelAndDescription,
	GroupedRadioOption,
	InputField,
	Toggle
} from './form-elements';
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
import { DispatchResult, UserGuildBaseData } from '@/types/gosdk/types';
import dynamic from 'next/dynamic';

const ScriptModal = dynamic(() => import('../old/ScriptModal').then(mod => mod.ScriptModal), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center h-full">
			<p className="text-muted-foreground">Loading Script IDE...</p>
		</div>
	)
});

const defaultNew = (setting: Setting) => {
    let data: any = {}
    for (let column of setting.columns) {
        if (column.column_type.type === ColumnType.Scalar) {
            if (column.column_type.inner.type === InnerColumnType.Integer || column.column_type.inner.type === InnerColumnType.Float) {
                data[column.id] = 0
            } else if (column.column_type.inner.type === InnerColumnType.Boolean) {
                data[column.id] = false;
            } else {
                data[column.id] = '';
            }
        } else if (column.column_type.type === ColumnType.Array) {
            data[column.id] = [];
        } else if (column.column_type.type === ColumnType.Widget) {
            continue
        }
    }

	return data;
}

/*
 * Fills in missing columns in a setting
 */
const fillInSetting = (setting: Setting, fields: {[key: string]: unknown}) => {
    for(let column of setting.columns) {
        let data = fields[column.id]
        if(data === undefined) {
            if (column.column_type.type === ColumnType.Scalar) {
                if (column.column_type.inner.type === InnerColumnType.Integer || column.column_type.inner.type === InnerColumnType.Float) {
                    fields[column.id] = 0
                } else if (column.column_type.inner.type === InnerColumnType.Boolean) {
                    fields[column.id] = false;
                } else {
                    fields[column.id] = '';
                }
            } else if (column.column_type.type === ColumnType.Array) {
                fields[column.id] = [];
            } else if (column.column_type.type === ColumnType.Widget) {
                continue
            }
        } else {
			// Ensure correct type for scalar/array values
			if (column.column_type.type === ColumnType.Scalar) {
				if (column.column_type.inner.type === InnerColumnType.Integer || column.column_type.inner.type === InnerColumnType.Float) {
					if(typeof data !== 'number') {
						let num = parseFloat(data?.toString() || '0');
						if(isNaN(num)) {
							num = 0;
						}
						fields[column.id] = num
					}
				} else if (column.column_type.inner.type === InnerColumnType.Boolean) {
					if(typeof data === "boolean") {
						fields[column.id] = data;
					} else if (typeof data === "string") {
						fields[column.id] = data == "true" || data === "1" || data.toLowerCase() === "yes";
					} else if (typeof data === "number") {
						fields[column.id] = data !== 0; // Treat 0 as false, anything else as true
					} else {
						fields[column.id] = false; // Default to false if not a recognized type
					}
				}
			}
		}
    }
}

/**
 * Fetches settings data. This can be useful in e.g. mocking settings with dummy data and also allows for functionality
 * to be separate from the UI
 */
export interface SettingDataFetcher {
    /**
     * Returns a list of all entries (as returned by the template/script) for a given setting
     */
    listEntries: (setting: Setting) => Promise<any>
}

interface SettingProps {
	guildId: string;
	setting: Setting;
    fetcher: SettingDataFetcher; // Optional dummy data for testing
    guildData?: UserGuildBaseData | null; // Optional guild data for testing
}

export const SettingComponent: React.FC<SettingProps> = ({ guildId, setting, fetcher }) => {
	const [fields, setFields] = useState<any[]>([]); // Fields fetched from settings API on View operation
	const [newEntry, setNewEntry] = useState<any>(null);
	const [editingEntry, setEditingEntry] = useState<any>(null);
    const [loadErrors, setLoadErrors] = useState<{[templateName: string]: string}>({}); // Errors encountered during loading
	const [isReordered, setIsReordered] = useState(false);

	const fetchSetting = async () => {
        try {
            const result: {[templateName: string]: DispatchResult} = await fetcher.listEntries(setting);

            let mergedFields: any[] = [];
            let errors: {[templateName: string]: string} = {};

            for(const templateName in result) {
                let templateResult = result[templateName];
                if (!templateResult) {
                    errors[templateName] = `No data found for template ${templateName}`;
                }

                if(templateResult.type != "Ok") {
                    errors[templateName] = templateResult.data?.toString() || "Unknown error";
                    continue;
                }

                if(!templateResult.data) {
                    errors[templateName] = `No data returned by template ${templateName}`;
                    continue;
                }

                if (Array.isArray(templateResult.data)) {
                    mergedFields.push(...templateResult.data.map(f => fillInSetting(setting, f)));
                } else if (typeof templateResult.data === 'object') {
                    mergedFields.push(fillInSetting(setting, templateResult.data));
                } else {
                    errors[templateName] = `Unexpected data type returned by template ${templateName} [${typeof templateResult.data}]`;
                }
            }
            
            if(Object.keys(errors).length > 0) {
                setLoadErrors(errors);
            }

            setFields(mergedFields);
        } catch (error) {
            toast.error('Failed to fetch roles'); // Display error toast
        }
	};

    useEffect(() => {
		fetchSetting();
	}, [guildId, fetcher]);

    return (
        <>
            {loadErrors && Object.keys(loadErrors).length > 0 && (
                <motion.div
                    className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    role="alert"
                    aria-live="assertive"
                >
                    <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
                    <p className="text-destructive">
                        {Object.entries(loadErrors).map(([templateName, error]) => (
                            <div key={templateName}>
                                Error loading {templateName}: <br/><code>{error}</code>
                            </div>
                        ))}
                    </p>
                    <button
                        onClick={fetchSetting}
                        className="ml-auto bg-destructive/20 hover:bg-destructive/30 text-destructive px-3 py-1 rounded-md text-sm transition-colors focus:outline focus:outline-2 focus:outline-destructive"
                        aria-label="Retry loading key-value pairs"
                    >
                        Retry
                    </button>
                </motion.div>
            )}

			<div className="space-y-4">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium">Server Roles</h3>
					<button
						className="flex items-center gap-1 text-foreground bg-accent px-3 py-1.5 rounded-md hover:bg-accent/80 transition-colors"
						onClick={() => setNewEntry(defaultNew(setting))}
					>
						<Plus className="w-4 h-4" />
						<span>New {setting.name}</span>
					</button>
				</div>
			</div>
        </>
    )

	/*
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
		if (editingRole) {
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
        }
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
	);*/
};

interface SettingsColumnListProps {
	columns: Column[];
	values: { [key: string]: any };
	operation: string;
	guildData: UserGuildBaseData | null;
	onChange: (data: { [key: string]: any }) => void;
}

/**
 * Defines a column list primitive for settings that renders a list of columns
 * while also correctly hiding hidden values and propagating input changes and
 * operation values
 */
export const SettingsColumnList: React.FC<SettingsColumnListProps> = ({
	columns,
	values,
	operation,
	guildData,
	onChange
}) => {
	return (
		<div className="space-y-4">
			{columns
				.filter((c) => !c.hidden || !c.hidden.includes(operation))
				.map((column) => (
					<SettingsColumn
						key={column.id}
						column={column}
						value={values[column.id]}
						disabled={column.readonly.includes(operation)}
						guildData={guildData}
						onChange={(newValue) => onChange({ ...values, [column.id]: newValue })}
					/>
				))}
		</div>
	);
};

const assertInnerColumnTypeUnion = (v: any): InnerColumnTypeUnion => v;

interface SettingsColumnProps {
	column: Column;
	disabled: boolean;
	value: any;
	guildData: UserGuildBaseData | null;
	onChange: (value: any) => void;
}

export const SettingsColumn: React.FC<SettingsColumnProps> = ({
	column,
	value,
	disabled,
	guildData,
	onChange
}) => {
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
							onChange={(v) => {
								if (disabled) return;
								onChange(v);
							}}
							disabled={disabled}
							guildData={guildData}
							marginClass="mb-4"
						/>
					</div>
				</>
			) : column.column_type.type === ColumnType.Array ? (
				<>
					<div className="items-center mt-2 bg-muted/30 p-3 rounded-lg">
						{/* Edge case: no inputs in array, so we just show a label and then have the 3 buttons below it */}
						{!value ||
							(Array.isArray(value) && value.length === 0 && (
								<>
									<BaseLabelAndDescription
										label={column.name}
										description={column.description}
										marginClass="mb-2"
									/>

									<span className="mr-2">
										<Secondary
											Title="Add Element"
											disabled={disabled}
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

												const newArray = value.toSpliced(1, 0, newElement);
												onChange(newArray);
											}}
										/>
									</span>
								</>
							))}

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
										disabled={disabled}
										onChange={(newValue) => {
											if (disabled) return;
											const newArray = [...value];
											newArray[index] = newValue;
											onChange(newArray);
										}}
										guildData={guildData}
										marginClass="mb-2"
									/>

									{!disabled && (
										<>
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
										</>
									)}
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
	disabled: boolean;
	id: string;
	value: any;
	onChange: (value: any) => void;
	guildData: UserGuildBaseData | null;
	marginClass?: string;
}

/**
 * Returns true if the value is a valid template content [a valid map of strings to strings]
 */
const isValidTemplateContent = (value: any): boolean => {
    if (typeof value !== 'object' || value == null || value == undefined) return false;

    for (const key in value) {
        if (typeof key !== 'string' || typeof value[key] !== 'string') {
            return false; // All keys and values must be strings
        }
    }

    return true; // All checks passed, it's a valid template content
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
	disabled,
	columnLabel,
	id,
	value,
	onChange,
	guildData,
	marginClass
}) => {
	let [valueType, setValueType] = useState<string>('string');
    let [templateContent, setTemplateContent] = useState<any>(value);
	let [jsonValue, setJsonValue] = useState(JSON.stringify(value));
    let [isEditingNewScriptContent, setIsEditingNewScriptContent] = useState(false);
	let [jsonOk, setJsonOk] = useState(true);

	let roles = useMemo(() => {
		if (!guildData || column.type !== InnerColumnType.String || column.kind !== 'role') return [];
		return guildData.roles
			.toSorted((a, b) => {
				if (a.position === b.position) {
					return b.id.localeCompare(a.id); // Newer roles are less than older roles
				} else {
					return b.position - a.position; // Sort by position
				}
			})
			.map((s) => {
				return { value: s.id, label: s.name };
			});
	}, [guildData]);

	let channels = useMemo(() => {
		if (!guildData || column.type !== InnerColumnType.String || column.kind !== 'channel')
			return [];
		return guildData.channels
			.filter((s) => s.channel)
			.toSorted((a, b) => {
				if (!a.channel || !b.channel) return 0; // Handle cases where channel data might be missing
				if (a.channel.position === b.channel.position) {
					return b.channel.id.localeCompare(a.channel.id); // Newer roles are less than older roles
				} else {
					return b.channel.position - a.channel.position; // Sort by position
				}
			})
			.map((s) => {
				if (!s.channel) return { value: '', label: 'Unknown Channel' }; // Fallback for missing channel data
				return { value: s.channel.id, label: s.channel.name };
			});
	}, [guildData]);

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
							disabled={disabled}
							allowedValues={column.allowed_values}
							onChange={onChange}
							aria-required="true"
							marginClass={marginClass}
						/>
					) : column.kind === 'role' && guildData ? (
						<InputField
							label={columnLabel || parentColumn.name}
							description={parentColumn.description}
							placeholder={parentColumn.placeholder}
							value={value}
							disabled={disabled}
							onChange={(e) => onChange(e.target.value)}
							id={id}
							aria-required="false"
							type={'select'}
							options={roles}
							marginClass={marginClass}
						/>
					) : column.kind === 'channel' && guildData ? (
						<InputField
							label={columnLabel || parentColumn.name}
							description={parentColumn.description}
							placeholder={parentColumn.placeholder}
							value={value}
							disabled={disabled}
							onChange={(e) => onChange(e.target.value)}
							id={id}
							aria-required="false"
							type={'select'}
							options={channels}
							marginClass={marginClass}
						/>
					) : (
						<InputField
							label={columnLabel || parentColumn.name}
							description={parentColumn.description}
							placeholder={parentColumn.placeholder}
							value={value}
							disabled={disabled}
							onChange={(e) => onChange(e.target.value)}
							id={id}
							aria-required="true"
							type={
								column.kind === 'password'
									? 'password'
									: column.kind === 'textarea'
										? 'textarea'
										: 'text'
							}
							marginClass={!disabled && column.suggestions ? '' : marginClass}
						/>
					)}

					{!disabled &&
						column.suggestions &&
						Array.isArray(column.suggestions) &&
						column.suggestions.length > 0 && (
							<>
								<InputField
									label={'Suggestions'}
									description={'Here are some potential suggestions for this field.'}
									placeholder={parentColumn.placeholder}
									value={value}
									disabled={disabled}
									onChange={(e) => onChange(e.target.value)}
									id={id}
									aria-required="false"
									type={'select'}
									options={column.suggestions.map((s: string) => {
										return { value: s, label: s };
									})}
									marginClass={marginClass}
								/>
							</>
						)}
				</>
			) : column.type === InnerColumnType.Integer ? (
				<InputField
					label={columnLabel || parentColumn.name}
					description={parentColumn.description}
					placeholder={parentColumn.placeholder}
					value={value}
					disabled={disabled}
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
					disabled={disabled}
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
					disabled={disabled}
					onChange={() => {
						onChange(!value);
					}}
					marginClass={marginClass}
				/>
			) : column.type == InnerColumnType.Json ? (
				<>
                    {column.style == "template-content" && isValidTemplateContent(templateContent) ? (
                        <>
                        	<div className="mb-5 mt-4">
                                <label className="block text-foreground font-medium mb-2">{columnLabel || parentColumn.name}</label>
                                {parentColumn.description && (
                                    <p className="text-sm text-muted-foreground mb-2.5" id={`${id}-desc`}>
                                        {parentColumn.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center">
                                    <span className="text-sm text-muted-foreground mr-2">
                                        {Object.keys(value).length === 0
                                            ? 'No files added yet'
                                            : `${Object.keys(value).length} file(s) added`}
                                    </span>
                                    <Primary
                                        Title="Edit Content"
                                        icon={Code}
                                        onClick={() => setIsEditingNewScriptContent(true)}
                                    />
                                </div>
                                {Object.keys(value).length > 0 && (
                                    <div className="mt-2 p-3 bg-muted/20 rounded-md">
                                        <p className="font-medium text-sm">Files:</p>
                                        <ul className="list-disc list-inside mt-1">
                                            {Object.keys(value).map((filename) => (
                                                <li key={filename} className="text-sm text-muted-foreground">
                                                    {filename}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {isEditingNewScriptContent && (
                                <ScriptModal
                                    isOpen={isEditingNewScriptContent}
                                    onClose={() => setIsEditingNewScriptContent(false)}
                                    content={value}
                                    scriptName="New Script"
                                    isEditMode={!disabled}
                                    onContentChange={setTemplateContent}

                                    onSave={() => {
                                        // Save the template content to value onSave
                                        onChange(templateContent);
                                        setIsEditingNewScriptContent(false)
                                    }}
                                />
                            )}                            
                        </>
                    ) : (
                        <>
                        	<InputField
                                label={columnLabel || parentColumn.name}
                                description={parentColumn.description}
                                placeholder={parentColumn.placeholder}
                                value={jsonValue}
                                disabled={disabled}
                                onChange={(e) => {
                                    setJsonValue(e.target.value);

                                    // Dispatch onChange if the json is parseable for specified type
                                    if (valueType === 'json') {
                                        try {
                                            const jsonValue = JSON.parse(e.target.value);
                                            setJsonOk(true);
                                            onChange(jsonValue);
                                        } catch (error) {
                                            setJsonOk(false);
                                            return;
                                        }
                                    } else if (valueType === 'number') {
                                        const numberValue = parseFloat(e.target.value);
                                        if (isNaN(numberValue)) {
                                            setJsonOk(false);
                                            return;
                                        }
                                        setJsonOk(true);
                                        onChange(numberValue);
                                    } else {
                                        // For string type, just pass the value as is
                                        setJsonOk(true);
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
                                            disabled={disabled}
                                            onClick={() => setValueType(type)}
                                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                                valueType === type
                                                    ? 'bg-primary text-primary-foreground outline outline-2 outline-primary'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
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

                            {!jsonOk && (
                                <>
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
                                                Invalid JSON input. The previously stored value of{' '}
                                                <code>{JSON.stringify(value)}</code> has been kept
                                            </span>
                                        </p>
                                    </motion.div>
                                </>
                            )}
                        </>
                    )}
				</>
			) : (
				<>
					{/* Fallback */}
					<InputField
						label={parentColumn.name}
						description={parentColumn.description}
						placeholder={parentColumn.placeholder}
						value={value}
						disabled={disabled}
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
