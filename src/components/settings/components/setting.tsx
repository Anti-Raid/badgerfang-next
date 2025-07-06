/**
 * # Settings

 * **Introduction/Flow**

 * Settings is based on a schema driven approach. There are two stages to this: Get Settings and Execute Setting.
 * Whenever the user opens the dashboard, the bot will trigger a Get Settings event to all templates bound to that event, 
 * this will return a list of schema objects that will then be rendered by the website. 
 * 
 * The website will then take this schema and loop over all columns/aspects of the setting to render the setting to the user.
 * 
 * In order to list entries, a View operation will be dispatched via the Execute Setting event,
 * similarly to create/update/delete, a Create, Update or Delete operation will be dispatched.
 * 
 * When reordering a setting which implements an index_by, the bot will dispatch a Reorder operation with the primary keys 
 * and the index_by value of each entry.
 * 
 * 
 * The title_template is a Luau script executed using WASM. When running, the title_template will recieve
 * a table with the following:
 * - fields: The fields of the setting, which are the values of the columns
 * - guildData: The guild data of the guild the setting is being executed in, which is the data returned by the Get User Guild Base Data event
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2, Edit, AlertCircle, Code } from 'lucide-react';
import { Primary, Secondary } from '../../ui/Buttons';
import { toast } from 'react-toastify'; // Import toast
import { Setting, ColumnType, InnerColumnType } from '@/types/settings'; // Adjust the import path as needed
import { DispatchResult, UserGuildBaseData } from '@/types/gosdk/types';
import logger from '@/lib/logger';
import { luauTemplate } from '@/lib/wasm';
import { SettingsColumnList } from './settings-column';

const defaultNew = (setting: Setting) => {
	let data: any = {};
	for (let column of setting.columns) {
		if (column.column_type.type === ColumnType.Scalar) {
			if (
				column.column_type.inner.type === InnerColumnType.Integer ||
				column.column_type.inner.type === InnerColumnType.Float
			) {
				data[column.id] = 0;
			} else if (column.column_type.inner.type === InnerColumnType.Boolean) {
				data[column.id] = false;
			} else {
				data[column.id] = '';
			}
		} else if (column.column_type.type === ColumnType.Array) {
			data[column.id] = [];
		} else if (column.column_type.type === ColumnType.Widget) {
			continue;
		}
	}

	return data;
};

/*
 * Fills in missing columns in a setting
 */
const fillInSetting = async (
	setting: Setting,
	guildData: UserGuildBaseData,
	fields: { [key: string]: unknown },
	onError: (e: string) => void
) => {
	for (let column of setting.columns) {
		let data = fields[column.id];
		if (data === undefined) {
			if (column.column_type.type === ColumnType.Scalar) {
				if (
					column.column_type.inner.type === InnerColumnType.Integer ||
					column.column_type.inner.type === InnerColumnType.Float
				) {
					fields[column.id] = 0;
				} else if (column.column_type.inner.type === InnerColumnType.Boolean) {
					fields[column.id] = false;
				} else {
					fields[column.id] = '';
				}
			} else if (column.column_type.type === ColumnType.Array) {
				fields[column.id] = [];
			} else if (column.column_type.type === ColumnType.Widget) {
				continue;
			}
		} else {
			// Ensure correct type for scalar/array values
			if (column.column_type.type === ColumnType.Scalar) {
				if (
					column.column_type.inner.type === InnerColumnType.Integer ||
					column.column_type.inner.type === InnerColumnType.Float
				) {
					if (typeof data !== 'number') {
						let num = parseFloat(data?.toString() || '0');
						if (isNaN(num)) {
							num = 0;
						}
						fields[column.id] = num;
					}
				} else if (column.column_type.inner.type === InnerColumnType.Boolean) {
					if (typeof data === 'boolean') {
						fields[column.id] = data;
					} else if (typeof data === 'string') {
						fields[column.id] = data == 'true' || data === '1' || data.toLowerCase() === 'yes';
					} else if (typeof data === 'number') {
						fields[column.id] = data !== 0; // Treat 0 as false, anything else as true
					} else {
						fields[column.id] = false; // Default to false if not a recognized type
					}
				}
			}
		}
	}

	// Insert title template
	if (setting.title_template) {
		try {
			let titleFields: { [key: string]: unknown } = {};
			for (let field of setting.columns) {
				if (field.column_type.type === ColumnType.Widget) {
					continue;
				}

				if (
					field.column_type.inner.type === InnerColumnType.Json &&
					field.column_type.inner.style == 'template'
				) {
					continue;
				}

				titleFields[field.id] = fields[field.id];
			}

			let title = await luauTemplate(setting.title_template, {
				fields: titleFields,
				guildData
			});

			logger.info('SettingComponent', 'Filled in title for setting: ', title);
			if (typeof title === 'string') {
				fields['title'] = title;
			}
		} catch (error) {
			onError(error?.toString() || 'Unknown error');
		}
	}

	return fields;
};

/**
 * Fetches settings data. This can be useful in e.g. mocking settings with dummy data and also allows for functionality
 * to be separate from the UI
 */
export interface SettingDataFetcher {
	/**
	 * Returns a list of all entries (as returned by the template/script) for a given setting
	 */
	listEntries: (setting: Setting) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Creates a new entry for a given setting
	 * @param setting The setting to create an entry for
	 * @param fields The fields to create the entry with
	 */
	createEntry: (
		setting: Setting,
		fields: unknown
	) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Updates an existing entry for a given setting
	 * @param setting The setting to update an entry for
	 * @param fields The fields to update the entry with
	 */
	updateEntry: (
		setting: Setting,
		fields: unknown
	) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Deletes an entry for a given setting
	 * @param setting The setting to delete an entry for
	 * @param fields The fields to delete the entry with
	 */
	deleteEntry: (
		setting: Setting,
		fields: unknown
	) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Reorders entries for a given setting
	 */
	reorderEntries: (
		setting: Setting,
		fields: unknown[]
	) => Promise<{ [templateName: string]: DispatchResult }>;
}

export const noOpFetcher: SettingDataFetcher = {
	listEntries: async (setting: Setting) => {
		return {};
	},
	createEntry: async (setting: Setting, fields: unknown) => {
		logger.info('noOpFetcher', 'createEntry called with setting:', setting, 'and fields:', fields);
		return {};
	},
	updateEntry: async (setting: Setting, fields: unknown) => {
		logger.info('noOpFetcher', 'updateEntry called with setting:', setting, 'and fields:', fields);
		return {};
	},
	deleteEntry: async (setting: Setting, fields: unknown) => {
		logger.info('noOpFetcher', 'deleteEntry called with setting:', setting, 'and fields:', fields);
		return {};
	},
	reorderEntries: async (setting: Setting, fields: unknown[]) => {
		logger.info(
			'noOpFetcher',
			'reorderEntries called with setting:',
			setting,
			'and fields:',
			fields
		);
		return {};
	}
};

interface SettingProps {
	guildId: string;
	setting: Setting;
	fetcher: SettingDataFetcher; // Optional dummy data for testing
	guildData: UserGuildBaseData; // Optional guild data for testing
}

export const SettingComponent: React.FC<SettingProps> = ({
	guildId,
	setting,
	fetcher,
	guildData
}) => {
	const [entries, setEntries] = useState<any[]>([]); // Fields fetched from settings API on View operation
	const [newEntry, setNewEntry] = useState<any>(null);
	const [showNewEntryForm, setShowNewEntryForm] = useState(false);
	const [editingEntry, setEditingEntry] = useState<any>(null);
	const [loadErrors, setLoadErrors] = useState<{ [templateName: string]: string }>({}); // Errors encountered during loading
	const [isReordered, setIsReordered] = useState(false);

	const processRes = (res: { [templateName: string]: DispatchResult }) => {
		let errors: { [templateName: string]: string } = {};
		for (let templateName in res) {
			if (res[templateName].type !== 'Ok') {
				let errorMessage = res[templateName].data?.toString() || 'Unknown error';
				errors[templateName] = errorMessage;
			}
		}

		setLoadErrors(errors);
	};

	const fetchSetting = async () => {
		try {
			const result = await fetcher.listEntries(setting);

			let mergedFields: any[] = [];
			let errors: { [templateName: string]: string } = {};

			for (const templateName in result) {
				let templateResult = result[templateName];
				if (!templateResult) {
					errors[templateName] = `No data found for template ${templateName}`;
				}

				if (templateResult.type != 'Ok') {
					errors[templateName] = templateResult.data?.toString() || 'Unknown error';
					continue;
				}

				if (!templateResult.data) {
					errors[templateName] = `No data returned by template ${templateName}`;
					continue;
				}

				if (Array.isArray(templateResult.data)) {
					for (let f of templateResult.data) {
						mergedFields.push(
							await fillInSetting(setting, guildData, f, (e) => {
								errors[templateName] = e;
								logger.error(
									'SettingComponent',
									'Failed to fill in setting for template:',
									templateName,
									'with error:',
									e
								);
							})
						);
					}
				} else if (typeof templateResult.data === 'object') {
					mergedFields.push(
						await fillInSetting(setting, guildData, templateResult.data, (e) => {
							errors[templateName] = e;
							logger.error(
								'SettingComponent',
								'Failed to fill in setting for template:',
								templateName,
								'with error:',
								e
							);
						})
					);
				} else {
					errors[templateName] =
						`Unexpected data type returned by template ${templateName} [${typeof templateResult.data}]`;
				}
			}

			// If index_by is set, sort the array with the right order
			if (setting.index_by) {
				let indexBy = setting.index_by;
				mergedFields = mergedFields.toSorted((a, b) => {
					let aIndex = a[indexBy] || Number.MAX_SAFE_INTEGER; // Default to max safe integer if not set
					let bIndex = b[indexBy] || Number.MAX_SAFE_INTEGER;
					return aIndex - bIndex; // Sort by index
				});
			}

			if (setting.index_by) {
				for (let i = 0; i < mergedFields.length; i++) {
					if (mergedFields[i][setting.index_by] === undefined) {
						mergedFields[i][setting.index_by] = i + 1; // Set index to i + 1
					}
				}
			}

			if (Object.keys(errors).length > 0) {
				setLoadErrors(errors);
			}

			logger.info(
				'SettingComponent',
				'Fetched entries for setting:',
				setting.id,
				'with result:',
				mergedFields
			);
			setEntries(mergedFields);
		} catch (error) {
			toast.error(`Failed to fetch entries: ${error}`); // Display error toast
		}
	};

	const handleAddEntry = async () => {
		let sendFields = structuredClone(newEntry); // Create a deep copy of newEntry
		if (setting.validation_template) {
			let params = {
				op: 'Create',
				fields: sendFields,
				entries,
				guildData: guildData
			};

			try {
				let potSendFields = await luauTemplate(setting.validation_template, params);
				if (potSendFields !== null) {
					sendFields = potSendFields as { [key: string]: unknown }; // SAFETY: We do not try to parse/use the sendFields after this
				}
			} catch (error) {
				logger.error('SettingsComponent', 'Failed to validate deletion with template', error);
				toast.error(`Failed to validate deletion of ${setting.name}: ${error}`); // Display error toast
				return;
			}
		}

		try {
			let res = await fetcher.createEntry(setting, sendFields);
			processRes(res);
			setNewEntry(null);
			setShowNewEntryForm(false);
			fetchSetting(); // Fetch roles again after adding a new role
		} catch (error) {
			logger.error('SettingsComponent', 'Failed to add new entry', error);
			toast.error(`Failed to add ${setting.name}`); // Display error toast
		}
	};

	const handleDeleteEntry = async (fields: { [key: string]: unknown }) => {
		try {
			let sendFields: { [key: string]: unknown } = {};
			for (let column of setting.columns) {
				if (column.primary_key) {
					let entry = fields[column.id];
					if (entry === undefined) {
						toast.error(`Missing primary key field ${column.id} for deletion`);
						return;
					}

					sendFields[column.id] = entry;
				}
			}

			if (setting.validation_template) {
				let params = {
					op: 'Delete',
					fields: sendFields,
					entries,
					guildData: guildData
				};

				try {
					let potSendFields = await luauTemplate(setting.validation_template, params);
					if (potSendFields !== null) {
						sendFields = potSendFields as { [key: string]: unknown }; // SAFETY: We do not try to parse/use the sendFields after this
					}
				} catch (error) {
					logger.error('SettingsComponent', 'Failed to validate deletion with template', error);
					toast.error(`Failed to validate deletion of ${setting.name}: ${error}`); // Display error toast
					return;
				}
			}

			let res = await fetcher.deleteEntry(setting, sendFields);
			processRes(res);
			setEntries(entries.filter((entry) => entry != fields));
		} catch (error) {
			logger.error('SettingsComponent', 'Failed to delete entry', error);
			toast.error(`Failed to delete ${setting.name}`); // Display error toast
		}
	};

	const handleEditEntry = (entry: any) => {
		setEditingEntry(entry);
	};

	const handleSaveEdit = async () => {
		let sendFields = structuredClone(editingEntry); // Create a deep copy of editingEntry
		if (setting.validation_template) {
			let params = {
				op: 'Update',
				fields: sendFields,
				entries,
				guildData: guildData
			};

			try {
				let potSendFields = await luauTemplate(setting.validation_template, params);
				if (potSendFields !== null) {
					sendFields = potSendFields as { [key: string]: unknown }; // SAFETY: We do not try to parse/use the sendFields after this
				}
			} catch (error) {
				logger.error('SettingsComponent', 'Failed to validate deletion with template', error);
				toast.error(`Failed to validate deletion of ${setting.name}: ${error}`); // Display error toast
				return;
			}
		}

		try {
			let res = await fetcher.updateEntry(setting, sendFields);
			processRes(res);
			setEditingEntry(null);
			fetchSetting(); // Fetch data again after editing
		} catch (error) {
			logger.error('SettingsComponent', 'Failed to edit entry', error);
			toast.error(`Failed to edit ${setting.name}`); // Display error toast
		}
	};

	const handleReorderEntry = async () => {
		let sendFields: any[] = [];
		for (let fields of entries) {
			let _sendFields: { [key: string]: unknown } = {};
			for (let column of setting.columns) {
				if (column.primary_key) {
					let entry = fields[column.id];
					if (entry === undefined) {
						toast.error(`Missing primary key field ${column.id} for deletion`);
						return;
					}

					_sendFields[column.id] = entry;
				}
			}

			_sendFields[setting.index_by || ''] = fields[setting.index_by || ''] || 0; // Ensure index is included

			sendFields.push(_sendFields);
		}

		if (setting.validation_template) {
			let params = {
				op: 'Reorder',
				fields: sendFields,
				entries,
				guildData: guildData
			};

			try {
				let potSendFields = await luauTemplate(setting.validation_template, params);
				if (potSendFields !== null) {
					sendFields = potSendFields as { [key: string]: unknown }[]; // SAFETY: We do not try to parse/use the sendFields after this
				}
			} catch (error) {
				logger.error('SettingsComponent', 'Failed to validate deletion with template', error);
				toast.error(`Failed to validate deletion of ${setting.name}: ${error}`); // Display error toast
				return;
			}
		}

		try {
			let res = await fetcher.reorderEntries(setting, sendFields);
			processRes(res);
			fetchSetting(); // Fetch data again after editing
			setIsReordered(false);
		} catch (error) {
			logger.error('SettingsComponent', 'Failed to reorder entry', error);
			toast.error(`Failed to delete ${setting.name}`); // Display error toast
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
					<div className="text-destructive">
						{Object.entries(loadErrors).map(([templateName, error]) => (
							<div key={templateName}>
								Error in {templateName}: <br />
								<code className="whitespace-pre-wrap">{error}</code>
							</div>
						))}
					</div>
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
					<h3 className="text-lg font-medium">{setting.name}</h3>
					<button
						className="flex items-center gap-1 text-foreground bg-accent px-3 py-1.5 rounded-md hover:bg-accent/80 transition-colors"
						onClick={() => setNewEntry(defaultNew(setting))}
					>
						<Plus className="w-4 h-4" />
						<span>New {setting.name}</span>
					</button>
				</div>
			</div>

			{showNewEntryForm && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
				>
					<SettingsColumnList
						columns={setting.columns}
						values={newEntry}
						onChange={(newValues) => setNewEntry(newValues)}
						operation="Create"
						guildData={guildData}
					/>

					<div className="flex gap-2">
						<Primary Title={`Add ${setting.name}`} onClick={handleAddEntry} />
						<button
							className="px-4 py-2 border border-primary border-opacity-20 rounded-md text-foreground hover:bg-accent/50"
							onClick={() => setShowNewEntryForm(false)}
						>
							Cancel
						</button>
					</div>
				</motion.div>
			)}

			{editingEntry && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
				>
					<SettingsColumnList
						columns={setting.columns}
						values={editingEntry}
						onChange={(editingEntry) => setEditingEntry(editingEntry)}
						operation="Update"
						guildData={guildData}
					/>

					<div className="flex gap-2">
						<Primary Title="Save" onClick={handleSaveEdit} />
						<button
							className="px-4 py-2 border border-primary border-opacity-20 rounded-md text-foreground hover:bg-accent/50"
							onClick={() => setEditingEntry(null)}
						>
							Cancel
						</button>
					</div>
				</motion.div>
			)}

			{entries && entries?.length > 0 && setting.operations.includes('View') && (
				<>
					{setting.index_by ? (
						<>
							<div className="bg-background border border-primary border-opacity-20 rounded-md overflow-hidden">
								<Reorder.Group
									axis="y"
									values={entries}
									onReorder={(newEntries) => {
										logger.info('SettingComponent', 'Reordered entries:', newEntries);
										// Update the index_by on each new entry with its index
										newEntries.forEach((entry, index) => {
											if (setting.index_by) {
												entry[setting.index_by] = index + 1;
											}
										});

										setEntries(newEntries);
										setIsReordered(true);
									}}
									className="divide-y divide-primary divide-opacity-10"
								>
									{entries.map((entry, index) => (
										<Reorder.Item key={entry[setting.index_by || '']} value={entry} className="p-3">
											<div className="flex items-center gap-3">
												<GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
												<span className="font-medium text-foreground">
													{entry?.title || `Entry ${index + 1}`}
												</span>
												<div className="ml-auto flex items-center gap-2">
													<button
														className="p-1 rounded-md hover:bg-accent/50"
														onClick={() => handleEditEntry(structuredClone(entry))}
													>
														<Edit className="w-4 h-4 text-muted-foreground" />
													</button>
													<button
														className="p-1 rounded-md hover:bg-accent/50"
														onClick={() => handleDeleteEntry(entry)}
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
									<Primary Title="Save Order" onClick={handleReorderEntry} />
								</div>
							)}
						</>
					) : (
						<>
							{entries.map((entry, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
								>
									<div className="flex items-center gap-3">
										<GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
										<span className="font-medium text-foreground">
											{entry?.title || `Entry ${index + 1}`}
										</span>
										<div className="ml-auto flex items-center gap-2">
											<button
												className="p-1 rounded-md hover:bg-accent/50"
												onClick={() => handleEditEntry(structuredClone(entry))}
											>
												<Edit className="w-4 h-4 text-muted-foreground" />
											</button>
											<button
												className="p-1 rounded-md hover:bg-accent/50"
												onClick={() => handleDeleteEntry(entry)}
											>
												<Trash2 className="w-4 h-4 text-muted-foreground" />
											</button>
										</div>
									</div>
								</motion.div>
							))}
						</>
					)}
				</>
			)}

			{setting.footer && <p className="text-sm text-muted-foreground">{setting.footer.end_text}</p>}
		</>
	);
};
