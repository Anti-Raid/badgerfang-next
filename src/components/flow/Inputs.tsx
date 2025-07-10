import { Eye, EyeOff, Icon } from "lucide-react";
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
	marginClass = 'mb-6'
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
						className={`w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none ${
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
							className={`w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
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
						className={`w-32 bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-1 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
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
						className={`w-48 bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-1 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
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
