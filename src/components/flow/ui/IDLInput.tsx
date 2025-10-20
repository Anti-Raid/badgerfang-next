import { GripVertical, Icon, Trash2 } from 'lucide-react';
import { BaseLabelAndDescription, InputField, Toggle } from './Inputs';
import { motion, Reorder } from 'framer-motion';
import { Primary } from '@/components/ui/Buttons';
import logger from '@/lib/logger';
import { Fragment } from 'react';

export interface IDLCommon {
	shortname: string;
	description: string;
}

export enum IDLInputEnum {
	Nil = 'Nil',
	String = 'String',
	Number = 'Number',
	Table = 'Table',
	Array = 'Array',
	Group = 'Group',
	Boolean = 'Boolean',
	Vector = 'Vector',
	Raw = 'Raw'
}

export interface IDLInputNil {
	type: IDLInputEnum.Nil;
	id: string;
}

export interface IDLInputString {
	type: IDLInputEnum.String;
	value: string;
	interpolated: boolean;
	id: string;
}

export interface IDLInputNumber {
	type: IDLInputEnum.Number;
	value: number;
	id: string;
}

export interface IDLInputTableEntry {
	key: IDLInput;
	value: IDLInput;
}

export interface IDLInputTable {
	type: IDLInputEnum.Table;
	value: IDLInputTableEntry[];
	inline: boolean;
	id: string;
}

export interface IDLInputArray {
	type: IDLInputEnum.Array;
	value: IDLInput[];
	inline: boolean;
	id: string;
}

export interface IDLInputGroup {
	type: IDLInputEnum.Group;
	values: IDLInput[];
	id: string;
}

export interface IDLInputBoolean {
	type: IDLInputEnum.Boolean;
	value: boolean;
	id: string;
}

export interface IDLInputVector {
	type: IDLInputEnum.Vector;
	x: number;
	y: number;
	z: number;
	id: string;
}

export interface IDLInputRaw {
	type: IDLInputEnum.Raw;
	value: string; // Raw code or expression
	id: string;
}

export type IDLInput = { common: IDLCommon } & (
	| IDLInputNil
	| IDLInputString
	| IDLInputNumber
	| IDLInputTable
	| IDLInputArray
	| IDLInputGroup
	| IDLInputBoolean
	| IDLInputVector
	| IDLInputRaw
);

export const generateIDLInputId = () => {
	return Math.random().toString(36).substring(2, 15);
};

interface IDLInputProps {
	label?: string;
	description?: string;
	placeholder?: string;
	value: IDLInput;
	onChange: (data: IDLInput) => void;
	className?: string;
	id?: string;
	icon?: typeof Icon;
	error?: string;
	marginClass?: string;
	disabled?: boolean;
	isArray?: boolean;
}

const valueToString = (value: IDLInput): string => {
	switch (value.type) {
		case IDLInputEnum.Nil:
			return 'nil';
		case IDLInputEnum.String:
			return `"${value.value.replaceAll('\n', '\\n')}"`;
		case IDLInputEnum.Number:
			return value.value.toString();
		case IDLInputEnum.Boolean:
			return value.value ? 'true' : 'false';
		case IDLInputEnum.Vector:
			return `Vector(${value.x}, ${value.y}, ${value.z})`;
		case IDLInputEnum.Raw:
			return value.value;
		case IDLInputEnum.Table:
			return '{ ... }';
		case IDLInputEnum.Array:
			return '[ ... ]';
		default:
			return 'unknown';
	}
};

export const IDLInputField: React.FC<IDLInputProps> = ({
	label,
	description,
	placeholder,
	value,
	disabled = false,
	onChange,
	className = '',
	id: idT,
	marginClass = 'mb-1',
	error,
	isArray
}) => {
	const inputId = idT || value.id || label?.toLowerCase().replace(/\s+/g, '-');

	return (
		<>
			<BaseLabelAndDescription
				id={`${inputId}-type`}
				label={label}
				description={description}
				className={isArray ? 'border-4 border-primary' : className}
				marginClass={marginClass}
			>
				<div className="relative">
					{value.type === IDLInputEnum.Table && (
						<>
							<TableInput
								value={value.value}
								onChange={(newArray) => {
									if (disabled) return;
									onChange({
										...value,
										value: newArray
									});
								}}
								disabled={disabled}
								common={value.common}
							/>
						</>
					)}

					{value.type === IDLInputEnum.String && (
						<>
							<InputField
								label="Value"
								value={value.value}
								disabled={disabled}
								type="text"
								onChange={(e) => {
									if (disabled) return;
									onChange({
										...value,
										value: e.target.value
									});
								}}
								id={`${inputId}-value`}
								aria-required="true"
							/>
						</>
					)}

					{value.type === IDLInputEnum.Raw && (
						<>
							<InputField
								label="Code"
								value={value.value}
								disabled={disabled}
								type="text"
								onChange={(e) => {
									if (disabled) return;
									onChange({ ...value, value: e.target.value });
								}}
								id={`${inputId}-value`}
								aria-required="true"
							/>
						</>
					)}

					{value.type === IDLInputEnum.Number && (
						<>
							<InputField
								label="Value"
								value={value.value.toString()}
								disabled={disabled}
								type="number"
								onChange={(e) => {
									if (disabled) return;

									const numberValue = parseFloat(e.target.value);
									if (isNaN(numberValue)) {
										return;
									}

									onChange({ ...value, value: numberValue });
								}}
								id={`${inputId}-value`}
								aria-required="true"
							/>
						</>
					)}

					{value.type === IDLInputEnum.Boolean && (
						<>
							<Toggle
								label="Value"
								checked={value.value}
								disabled={disabled}
								onChange={() => {
									if (disabled) return;
									onChange({ ...value, value: !value.value });
								}}
								aria-required="true"
							/>
						</>
					)}

					{value.type === IDLInputEnum.Vector && (
						<>
							<div className="md:grid md:grid-cols-3 md:gap-2">
								<InputField
									label="X"
									value={value.x.toString()}
									disabled={disabled}
									type="number"
									onChange={(e) => {
										if (disabled) return;

										const numberValue = parseFloat(e.target.value);
										if (isNaN(numberValue)) {
											return;
										}

										onChange({
											...value,
											x: numberValue
										});
									}}
									id={`${inputId}-x`}
									aria-required="true"
									small={true}
								/>

								<InputField
									label="Y"
									value={value.y.toString()}
									disabled={disabled}
									type="number"
									onChange={(e) => {
										if (disabled) return;

										const numberValue = parseFloat(e.target.value);
										if (isNaN(numberValue)) {
											return;
										}

										onChange({
											...value,
											y: numberValue
										});
									}}
									id={`${inputId}-y`}
									aria-required="true"
									small={true}
								/>

								<InputField
									label="Z"
									value={value.z.toString()}
									disabled={disabled}
									type="number"
									onChange={(e) => {
										if (disabled) return;

										const numberValue = parseFloat(e.target.value);
										if (isNaN(numberValue)) {
											return;
										}

										onChange({
											...value,
											z: numberValue
										});
									}}
									id={`${inputId}-z`}
									aria-required="true"
									small={true}
								/>
							</div>
						</>
					)}

					{value.type === IDLInputEnum.Array && (
						<>
							<ArrayTableInput
								value={value.value}
								onChange={(newArray) => {
									onChange({
										...value,
										value: newArray
									});
								}}
								common={value.common}
								disabled={disabled}
							/>

							<Toggle
								label="Inline Table"
								description="Whether or not the table should be formatted inline (e.g. { key = value }) or expanded over multiple lines."
								checked={value.inline}
								disabled={disabled}
								onChange={() => {
									if (disabled) return;
									onChange({
										...value,
										inline: !value.inline
									});
								}}
								aria-required="true"
							/>
						</>
					)}

					{value.type === IDLInputEnum.Group && (
						<>
							<GroupTableInput
								value={value.values}
								onChange={(newArray) => {
									onChange({
										...value,
										values: newArray
									});
								}}
								common={value.common}
								disabled={disabled}
							/>
						</>
					)}

					{error && (
						<p className="mt-1.5 text-sm text-destructive" role="alert">
							{error}
						</p>
					)}
				</div>
			</BaseLabelAndDescription>
		</>
	);
};

interface ArrayTableInputProps {
	value: IDLInput[];
	onChange: (data: IDLInput[]) => void;
	disabled?: boolean;
	common: IDLCommon;
}

const ArrayTableInput: React.FC<ArrayTableInputProps> = ({ value, onChange, disabled, common }) => {
	return (
		<>
			{disabled ? (
				<div className="text-gray-500">
					{value.map((v, i) => {
						return (
							<IDLInputField
								key={i}
								label={`Item ${i + 1} (${valueToString(v)})`}
								value={v}
								onChange={(_newVal) => {}}
								disabled={true}
							/>
						);
					})}
				</div>
			) : (
				<>
					<Reorder.Group
						axis="y"
						values={value}
						onReorder={(newValues) => {
							logger.debug('IDLInput', 'Reordering array table input:', newValues);
							onChange(newValues);
						}}
					>
						{value.map((v, i) => (
							<Reorder.Item key={v.id} value={v}>
								<div className="border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm">
									<div className="flex items-center gap-3">
										<GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
										<span className="font-medium text-foreground">
											Element {i + 1} ({valueToString(v)})
										</span>
										<div className="ml-auto flex items-center gap-2">
											<button
												className="p-1 rounded-md hover:bg-accent/50 transition-colors"
												onClick={() => {
													let newArray = [...value];
													newArray.splice(i, 1);
													onChange(newArray);
												}}
												aria-label="Delete entry"
											>
												<Trash2 className="w-4 h-4 text-muted-foreground" />
											</button>
										</div>
									</div>

									<div className="p-4">
										<IDLInputField
											label={`Item ${i + 1}`}
											value={v}
											onChange={(newVal) => {
												let newArray = [...value];
												newArray[i] = newVal;
												onChange(newArray);
											}}
											disabled={disabled}
										/>
									</div>
								</div>
							</Reorder.Item>
						))}
					</Reorder.Group>
				</>
			)}

			{!disabled && (
				<>
					<Primary
						Title="Add Element"
						onClick={() => {
							let newArray = [...value];
							newArray.push({ type: IDLInputEnum.Nil, id: generateIDLInputId(), common });
							onChange(newArray);
						}}
					/>
					<div className="mt-2 mb-2" />
				</>
			)}
		</>
	);
};

interface GroupTableInputProps {
	value: IDLInput[];
	onChange: (values: IDLInput[]) => void;
	disabled?: boolean;
	common: IDLCommon;
}

const GroupTableInput: React.FC<GroupTableInputProps> = ({ value, onChange, disabled, common }) => {
	return (
		<>
			{disabled ? (
				<div className="text-gray-500">
					{value.map((v, i) => {
						return (
							<IDLInputField
								key={i}
								label={v.common.shortname}
								description={v.common.description}
								value={v}
								onChange={(_newVal) => {}}
								disabled={true}
							/>
						);
					})}
				</div>
			) : (
				<>
					{value.map((v, i) => (
						<div
							key={i}
							className="border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
						>
							<div className="p-4">
								<IDLInputField
									label={v.common.shortname}
									description={v.common.description}
									value={v}
									onChange={(newVal) => {
										let newArray = [...value];
										newArray[i] = newVal;
										onChange(newArray);
									}}
									disabled={disabled}
								/>
							</div>
						</div>
					))}
				</>
			)}
		</>
	);
};

interface TableInputProps {
	value: IDLInputTableEntry[];
	onChange: (data: IDLInputTableEntry[]) => void;
	disabled?: boolean;
	common: IDLCommon;
}

const TableInput: React.FC<TableInputProps> = ({ value, onChange, disabled, common }) => {
	return (
		<>
			{disabled ? (
				<div className="text-gray-500">
					{value.map((v, i) => {
						return (
							<Fragment key={i}>
								<IDLInputField
									label={`Item ${i + 1} (${valueToString(v.key)}) Key`}
									value={v.key}
									onChange={(_newVal) => {}}
									disabled={true}
								/>

								<IDLInputField
									key={i}
									label={`Item ${i + 1} (${valueToString(v.value)}) Value`}
									value={v.value}
									onChange={(_newVal) => {}}
									disabled={true}
								/>
							</Fragment>
						);
					})}
				</div>
			) : (
				<>
					<Reorder.Group
						axis="y"
						values={value}
						onReorder={(newValues) => {
							logger.debug('IDLInput', 'Reordering array table input:', newValues);
							onChange(newValues);
						}}
					>
						{value.map((v, i) => (
							<Reorder.Item key={v.key.id} value={v}>
								<div className="border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm">
									<div className="flex items-center gap-3">
										<GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
										<span className="font-medium text-foreground">
											Element {i + 1} ({valueToString(v.key)} = {valueToString(v.value)})
										</span>
										<div className="ml-auto flex items-center gap-2">
											<button
												className="p-1 rounded-md hover:bg-accent/50 transition-colors"
												onClick={() => {
													let newArray = [...value];
													newArray.splice(i, 1);
													onChange(newArray);
												}}
												aria-label="Delete entry"
											>
												<Trash2 className="w-4 h-4 text-muted-foreground" />
											</button>
										</div>
									</div>

									<div className="p-4">
										<div>
											<IDLInputField
												label={`Item ${i + 1} Key`}
												value={v.key}
												onChange={(newVal) => {
													let newArray = [...value];
													newArray[i].key = newVal;
													onChange(newArray);
												}}
												disabled={disabled}
											/>
										</div>
										<div>
											<IDLInputField
												label={`Item ${i + 1} Value`}
												value={v.value}
												onChange={(newVal) => {
													let newArray = [...value];
													newArray[i].value = newVal;
													onChange(newArray);
												}}
												disabled={disabled}
											/>
										</div>
									</div>
								</div>
							</Reorder.Item>
						))}
					</Reorder.Group>
				</>
			)}

			{!disabled && (
				<>
					<Primary
						Title="Add Element"
						onClick={() => {
							let newArray = [...value];
							let key = { type: IDLInputEnum.Nil, id: generateIDLInputId(), common };
							let valueL = { type: IDLInputEnum.Nil, id: generateIDLInputId(), common };
							newArray.push({ key: key as IDLInput, value: valueL as IDLInput });
							onChange(newArray);
						}}
					/>
					<div className="mt-2 mb-2" />
				</>
			)}
		</>
	);
};
