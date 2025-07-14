import { stringToTypedInputEnum, TypedInput, TypedInputEnum } from "@/lib/flow/data";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Icon } from "lucide-react";
import { useState } from "react";

interface BaseLabelAndDescriptionProps {
	label?: string;
	description?: string;
	className?: string;
	id?: string;
	marginClass?: string;
}

export const BaseLabelAndDescription: React.FC<BaseLabelAndDescriptionProps> = ({
	label,
	description,
	className = '',
	id,
	marginClass = 'mb-1'
}) => {
	return (
		<div className={`${marginClass} group ${className}`}>
			{label && (
				<label className="block text-foreground font-medium mb-1.5 text-sm" id={`${id}-label`}>
					{label}
				</label>
			)}

			{description && (
				<p className="text-sm text-muted-foreground" id={`${id}-desc`}>
					{description}
				</p>
			)}
		</div>
	);
};

interface InputFieldProps {
	label?: string;
	description?: string;
	placeholder?: string;
	type?: string;
	value?: string;
	onChange?: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => void;
	options?: { value: string; label: string }[];
	className?: string;
	id?: string;
	icon?: typeof Icon;
	error?: string;
	marginClass?: string;
	disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
	label,
	description,
	placeholder,
	type = 'text',
	value,
	disabled = false,
	onChange,
	options,
	className = '',
	id,
	icon: IconComponent,
	error,
	marginClass = 'mb-1'
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

	return (
		<div className={`${marginClass} group ${className}`}>
			{label && (
				<label
					htmlFor={inputId}
					className="block text-foreground font-medium mb-1.5 text-sm"
					id={`${inputId}-label`}
				>
					{label}
				</label>
			)}

			{description && (
				<p className="text-sm text-muted-foreground mb-2.5" id={`${inputId}-desc`}>
					{description}
				</p>
			)}

			<div className="relative">
				{IconComponent && (
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
						<IconComponent
							className="w-4 h-4 text-muted-foreground"
							iconNode={[]}
							aria-hidden="true"
						/>
					</div>
				)}

				{type === 'select' ? (
					<select
						id={inputId}
						value={value}
						aria-placeholder={placeholder}
						onChange={(e) => {
							if (disabled) return;
							if (onChange) onChange(e);
						}}
						disabled={disabled}
						className={`w-56 bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-1 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none ${
							IconComponent ? 'pl-10' : ''
						} ${error ? 'border-destructive' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
						aria-labelledby={`${inputId}-label`}
						aria-describedby={description ? `${inputId}-desc` : undefined}
					>
						<option value="">Select an option</option>
						{options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				) : type === 'password' ? (
					<div className="relative">
						<input
							id={inputId}
							type={showPassword ? 'text' : 'password'}
							placeholder={placeholder}
							value={value}
							disabled={disabled}
							onChange={(e) => {
								if (disabled) return;
								if (onChange) onChange(e);
							}}
							className={`w-56 bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
								IconComponent ? 'pl-10' : ''
							} ${error ? 'border-destructive' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
							aria-labelledby={`${inputId}-label`}
							aria-describedby={description ? `${inputId}-desc` : undefined}
							aria-required="true"
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors focus:outline focus:outline-2 focus:outline-primary"
							onClick={() => setShowPassword(!showPassword)}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{showPassword ? (
								<EyeOff className="w-4 h-4" aria-hidden="true" />
							) : (
								<Eye className="w-4 h-4" aria-hidden="true" />
							)}
						</button>
					</div>
				) : type === 'textarea' ? (
					<textarea
						id={inputId}
						placeholder={placeholder}
						value={value}
						disabled={disabled}
						onChange={(e) => {
							if (disabled) return;
							if (onChange) onChange(e);
						}}
						className={`w-56 bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-1 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
							IconComponent ? 'pl-10' : ''
						} ${error ? 'border-destructive' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
						aria-labelledby={`${inputId}-label`}
						aria-describedby={description ? `${inputId}-desc` : undefined}
					/>
				) : (
					<input
						id={inputId}
						type={type}
						placeholder={placeholder}
						value={value}
						disabled={disabled}
						onChange={(e) => {
							if (disabled) return;
							if (onChange) onChange(e);
						}}
						className={`w-56 bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-1 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
							IconComponent ? 'pl-10' : ''
						} ${error ? 'border-destructive' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
						aria-labelledby={`${inputId}-label`}
						aria-describedby={description ? `${inputId}-desc` : undefined}
						aria-required="true"
					/>
				)}
			</div>

			{error && (
				<p className="mt-1.5 text-sm text-destructive" role="alert">
					{error}
				</p>
			)}
		</div>
	);
};

interface TypedInputProps {
	label?: string;
	description?: string;
	placeholder?: string;
	value: TypedInput;
	onChange: (data: TypedInput) => void;
	className?: string;
	id?: string;
	icon?: typeof Icon;
	error?: string;
	marginClass?: string;
	disabled?: boolean;
}

const defaultLValue = (type: TypedInputEnum): unknown => {
	switch (type) {
		case TypedInputEnum.String:
			return '';
		case TypedInputEnum.Table:
			return "{}";
		case TypedInputEnum.Number:
			return 0;
		case TypedInputEnum.Boolean:
			return false;
		default:
			return '';
	}
}

export const TypedInputField: React.FC<TypedInputProps> = (
	{
		label,
		description,
		placeholder,
		value,
		disabled = false,
		onChange,
		className = '',
		id,
		marginClass = 'mb-1'
	}
) => {
	const [type, setType] = useState<TypedInputEnum>(value.type || TypedInputEnum.String);
	const [lvalue, setLValue] = useState<unknown>(value.value ? JSON.stringify(value.value) : '');
	const [jsonOk, setJsonOk] = useState<boolean>(true);
	return (
		<>
			<InputField
				label={label}
				description={description}
				placeholder={placeholder}
				value={lvalue as string}
				disabled={disabled}
				className={className}
				onChange={(e) => {
					if (disabled) return;
					setLValue(e.target.value);

					// Dispatch onChange if the value is parseable for specified type
					if (type === TypedInputEnum.Table) {
						try {
							const jsonValue = JSON.parse(e.target.value);
							setJsonOk(true);
							onChange({ type, value: jsonValue });
						} catch (error) {
							setJsonOk(false);
							return;
						}
					} else if (type === TypedInputEnum.Number) {
						const numberValue = parseFloat(e.target.value);
						if (isNaN(numberValue)) {
							setJsonOk(false);
							return;
						}
						setJsonOk(true);
						onChange({ type, value: numberValue });
					} else if (type === TypedInputEnum.Boolean) {
						if (e.target.value !== 'true' && e.target.value !== 'false') {
							setJsonOk(false);
							return;
						}
						const boolValue = e.target.value.toLowerCase() === 'true';
						setJsonOk(true);
						onChange({ type, value: boolValue });
					} else {
						// For string type, just pass the value as is
						setJsonOk(true);
						onChange({ type, value: e.target.value });
					}
				}}
				id={id}
				aria-required="true"
			/>

			<InputField 
				type="select"
				label={`${label ? label + ' Type' : 'Type'}`}
				value={type}
				disabled={disabled}
				className={className}
				marginClass={marginClass}
				onChange={(e) => {
					if (disabled) return;
					const newType = stringToTypedInputEnum(e.target.value);
					setType(newType);
					setLValue(defaultLValue(newType));
					// Dispatch onChange with default value for new type
					onChange({ type: newType, value: defaultLValue(newType) as any });
				}}
				options={[
					{ value: TypedInputEnum.String, label: 'String' },
					{ value: TypedInputEnum.Number, label: 'Number' },
					{ value: TypedInputEnum.Table, label: 'Table' },
					{ value: TypedInputEnum.Boolean, label: 'Boolean' },
				]}
				id={`${id}-type`}
				aria-label={`${label ? label + ' Type' : 'Type'}`}
				aria-describedby={description ? `${id}-desc` : undefined}
				aria-labelledby={`${id}-label`}
			/>

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
	)
}

interface ToggleProps {
	label: string;
	description?: string;
	checked: boolean;
	disabled?: boolean;
	onChange: () => void;
	marginClass?: string;
}


export const Toggle: React.FC<ToggleProps> = ({
	label,
	description,
	onChange,
	checked,
	disabled = false,
	marginClass = 'mb-1'
}) => {
	return (
		<div className={marginClass}>
			<div className="flex items-center">
				<button
					type="button"
					role="switch"
					aria-checked={checked}
					disabled={disabled}
					className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
						checked ? 'bg-primary' : 'bg-muted'
					}`}
					onClick={() => {
						if (disabled) return;
						if (onChange) onChange();
					}}
					aria-label={label}
					tabIndex={0}
				>
					<motion.span
						className="inline-block h-4 w-4 transform rounded-full bg-white"
						animate={{
							translateX: checked ? '1.5rem' : '0.25rem'
						}}
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30
						}}
					/>
				</button>
				<span className="ml-3 font-medium text-foreground">{label}</span>
			</div>
			{description && <p className="text-sm text-muted-foreground mt-1 ml-14">{description}</p>}
		</div>
	);
};
