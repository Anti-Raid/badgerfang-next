import {
	stringToTypedInputEnum,
	TypedInput,
	TypedInputEnum,
	TypedInputTableEntry
} from '@/lib/flow/data';
import { GripVertical, Icon, Trash2 } from 'lucide-react';
import { BaseLabelAndDescription, InputField, Toggle } from './Inputs';
import { motion, Reorder } from 'framer-motion';
import { Primary } from '@/components/ui/Buttons';
import logger from '@/lib/logger';
import { Fragment, useEffect, useState } from 'react';

export const generateTypedInputId = () => {
	return Math.random().toString(36).substring(2, 15);
};

interface DepthAndID {
	depth: number;
	id: string;
}

interface TypedInputProps {
	label?: string;
	description?: string;
	placeholder?: string;
	value: TypedInput;
	onChange: (data: TypedInput) => void;
	className?: string;
	id?: string;
	depth?: number;
	icon?: typeof Icon;
	error?: string;
	marginClass?: string;
	disabled?: boolean;
	isArray?: boolean;
}

const createValueWithType = (type: TypedInputEnum): TypedInput => {
	switch (type) {
		case TypedInputEnum.Nil:
			return { type: TypedInputEnum.Nil };
		case TypedInputEnum.String:
			return {
				type: TypedInputEnum.String,
				value: '',
				interpolated: false,
			};
		case TypedInputEnum.Raw:
			return { type: TypedInputEnum.Raw, value: '' };
		case TypedInputEnum.Table:
			return { type: TypedInputEnum.Table, value: [], inline: true };
		case TypedInputEnum.TableArray:
			return {
				type: TypedInputEnum.TableArray,
				value: [],
				inline: true,
			};
		case TypedInputEnum.Number:
			return { type: TypedInputEnum.Number, value: 0 };
		case TypedInputEnum.Boolean:
			return { type: TypedInputEnum.Boolean, value: false };
		case TypedInputEnum.Vector:
			return { type: TypedInputEnum.Vector, x: 0, y: 0, z: 0 };
		default:
			return { type: TypedInputEnum.Nil };
	}
};

const valueToString = (value: TypedInput): string => {
	switch (value.type) {
		case TypedInputEnum.Nil:
			return 'nil';
		case TypedInputEnum.String:
			return `"${value.value.replaceAll('\n', '\\n')}"`;
		case TypedInputEnum.Number:
			return value.value.toString();
		case TypedInputEnum.Boolean:
			return value.value ? 'true' : 'false';
		case TypedInputEnum.Vector:
			return `Vector(${value.x}, ${value.y}, ${value.z})`;
		case TypedInputEnum.Raw:
			return value.value;
		case TypedInputEnum.Table:
			return '{ ... }';
		case TypedInputEnum.TableArray:
			return '[ ... ]';
		default:
			return 'unknown';
	}
};

export const TypedInputField: React.FC<TypedInputProps> = ({
	label,
	description,
	placeholder,
	value,
	disabled = false,
	onChange,
	className = '',
	id: idT,
	depth = 0,
	marginClass = 'mb-1',
	error,
	isArray
}) => {
	const id = `${idT ?? 'tif'}_f${depth}`
	return (
		<>
			<BaseLabelAndDescription
				label={label}
				description={description}
				className={isArray ? 'border-4 border-primary' : className}
				marginClass={marginClass}
			>
				<div className="relative">
					<InputField
						type="select"
						label="Type"
						value={value.type}
						disabled={disabled}
						hideSelectOptionsPlaceholder={true}
						onChange={(e) => {
							if (disabled) return;
							const newType = stringToTypedInputEnum(e.target.value);
							// Dispatch onChange with default value for new type
							onChange(createValueWithType(newType));
						}}
						options={[
							{ value: TypedInputEnum.Nil, label: 'Nil / Null / None' },
							{ value: TypedInputEnum.String, label: 'String' },
							{ value: TypedInputEnum.Number, label: 'Number' },
							{ value: TypedInputEnum.Table, label: 'Table' },
							{ value: TypedInputEnum.TableArray, label: 'Array' },
							{ value: TypedInputEnum.Boolean, label: 'Boolean' },
							{ value: TypedInputEnum.Vector, label: 'Vector' },
							{ value: TypedInputEnum.Raw, label: 'Raw (Lua code snippet)' }
						]}
						id={`${id}-type`}
						aria-label={`${label ? label + ' Type' : 'Type'}`}
						aria-describedby={description ? `${id}-desc` : undefined}
						aria-labelledby={`${id}-label`}
					/>

					{value.type === TypedInputEnum.Table && (
						<>
							<TableInput
								did={{depth, id}}
								value={value.value}
								onChange={(newArray) => {
									if (disabled) return;
									onChange({
										type: value.type,
										value: newArray,
										inline: value.inline,
									});
								}}
								disabled={disabled}
							/>
						</>
					)}

					{value.type === TypedInputEnum.String && (
						<>
							<InputField
								label="Value"
								value={value.value}
								disabled={disabled}
								type="text"
								onChange={(e) => {
									if (disabled) return;
									onChange({
										type: value.type,
										value: e.target.value,
										interpolated: value.interpolated,
									});
								}}
								id={`${id}-value`}
								aria-required="true"
							/>
						</>
					)}

					{value.type === TypedInputEnum.Raw && (
						<>
							<InputField
								label="Code"
								value={value.value}
								disabled={disabled}
								type="text"
								onChange={(e) => {
									if (disabled) return;
									onChange({ type: value.type, value: e.target.value });
								}}
								id={`${id}-value`}
								aria-required="true"
							/>
						</>
					)}

					{value.type === TypedInputEnum.Number && (
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

									onChange({ type: value.type, value: numberValue });
								}}
								id={`${id}-value`}
								aria-required="true"
							/>
						</>
					)}

					{value.type === TypedInputEnum.Boolean && (
						<>
							<Toggle
								label="Value"
								checked={value.value}
								disabled={disabled}
								onChange={() => {
									if (disabled) return;
									onChange({ type: value.type, value: !value.value });
								}}
								aria-required="true"
							/>
						</>
					)}

					{value.type === TypedInputEnum.Vector && (
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
											type: value.type,
											x: numberValue,
											y: value.y,
											z: value.z,
										});
									}}
									id={`${id}-x`}
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
											type: value.type,
											x: value.x,
											y: numberValue,
											z: value.z,
										});
									}}
									id={`${id}-y`}
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
											type: value.type,
											x: value.x,
											y: value.y,
											z: numberValue,
										});
									}}
									id={`${id}-z`}
									aria-required="true"
									small={true}
								/>
							</div>
						</>
					)}

					{value.type === TypedInputEnum.TableArray && (
						<>
							<ArrayTableInput
								value={value.value}
								did={{depth, id}}
								onChange={(newArray) => {
									onChange({
										type: value.type,
										value: newArray,
										inline: value.inline,
									});
								}}
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
										type: value.type,
										value: value.value,
										inline: !value.inline,
									});
								}}
								aria-required="true"
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
	did: DepthAndID;
	value: TypedInput[];
	onChange: (data: TypedInput[]) => void;
	disabled?: boolean;
}

const ArrayTableInput: React.FC<ArrayTableInputProps> = ({ did, value, onChange, disabled }) => {
	return (
		<>
			{disabled ? (
				<div className="text-gray-500">
					{value.map((v, i) => {
						return (
							<TypedInputField
								key={i}
								depth={did.depth + 1}
								id={`${did.id}_${i}e`}
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
					{value.map((v, i) => (
						<div key={i} className="border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm">
							<div className="flex items-center gap-3">
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
								<TypedInputField
									label={`Item ${i + 1}`}
									value={v}
									depth={did.depth + 1}
									id={`${did.id}_${i}e`}
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

			{!disabled && (
				<>
					<Primary
						Title="Add Element"
						onClick={() => {
							let newArray = [...value];
							newArray.push({ type: TypedInputEnum.Nil });
							onChange(newArray);
						}}
					/>
					<div className="mt-2 mb-2" />
				</>
			)}
		</>
	);
};

interface TableInputProps {
	did: DepthAndID;
	value: TypedInputTableEntry[];
	onChange: (data: TypedInputTableEntry[]) => void;
	disabled?: boolean;
}

const TableInput: React.FC<TableInputProps> = ({ did, value, onChange, disabled }) => {
	return (
		<>
			{disabled ? (
				<div className="text-gray-500">
					{value.map((v, i) => {
						return (
							<Fragment key={i}>
								<TypedInputField
									key={i}
									depth={did.depth + 1}
									id={`${did.id}_${i}k`}
									label={`Item ${i + 1} (${valueToString(v.key)}) Key`}
									value={v.key}
									onChange={(_newVal) => {}}
									disabled={true}
								/>

								<TypedInputField
									key={i}
									depth={did.depth + 1}
									id={`${did.id}_${i}v`}
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
					{value.map((v, i) => (
						<div key={i} className="border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm">
							<div className="flex items-center gap-3">
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
									<TypedInputField
										label={`Item ${i + 1} Key`}
										depth={did.depth + 1}
										id={`${did.id}_${i}k`}
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
									<TypedInputField
										label={`Item ${i + 1} Value`}
										depth={did.depth + 1}
										id={`${did.id}_${i}v`}
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
					))}
				</>
			)}

			{!disabled && (
				<>
					<Primary
						Title="Add Element"
						onClick={() => {
							let newArray = [...value];
							let key: TypedInput = { type: TypedInputEnum.Nil };
							let valueL: TypedInput = { type: TypedInputEnum.Nil };
							newArray.push({ key: key, value: valueL });
							onChange(newArray);
						}}
					/>
					<div className="mt-2 mb-2" />
				</>
			)}
		</>
	);
};
