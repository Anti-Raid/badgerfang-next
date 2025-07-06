import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Code } from 'lucide-react';
import { Primary, Secondary } from '../../ui/Buttons';
import {
	BaseLabelAndDescription,
	GroupedRadioOption,
	InputField,
	Toggle
} from './form-elements';
import {
	Column,
	ColumnType,
	InnerColumnTypeUnion,
	InnerColumnType,
	InnerWidget
} from '@/types/settings'; // Adjust the import path as needed
import { UserGuildBaseData } from '@/types/gosdk/types';
import dynamic from 'next/dynamic';

const ScriptModal = dynamic(() => import('./ScriptModal').then(mod => mod.ScriptModal), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading Script IDE...</p>
        </div>
    )
});

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
					<div className="items-center mt-2">
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
					<div className="items-center mt-2">
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

