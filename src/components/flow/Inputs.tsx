import { stringToTypedInputEnum, TypedInput, TypedInputEnum } from "@/lib/flow/data";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Icon } from "lucide-react";
import { useState } from "react";

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
				marginClass={marginClass}
			/>

			<div
				className="flex items-center mt-1"
				role="radiogroup"
				aria-label="Type"
			>
				<label className="text-sm font-medium text-foreground" id="value-type-label">
					Type:
				</label>
				<div className="flex bg-muted/30 rounded-lg p-1" aria-labelledby="value-type-label">
					{['string', 'number', 'table', 'boolean'].map(typ => stringToTypedInputEnum(typ)).map((typ) => (
						<button
							key={typ}
							disabled={disabled}
							onClick={() => {
								if (disabled) return;
								setType(typ);
								setLValue(defaultLValue(typ));
							}}
							className={`px-1 py-1 rounded-md text-sm transition-colors ${
								typ === type
									? 'bg-primary text-primary-foreground outline outline-2 outline-primary'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
							} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
							role="radio"
							aria-checked={typ === type}
							tabIndex={0}
							aria-label={typ.toString().charAt(0).toUpperCase() + typ.toString().slice(1)}
						>
							{typ.toString().charAt(0).toUpperCase() + typ.toString().slice(1)}
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
	)
}