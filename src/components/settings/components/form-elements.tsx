'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import type { Icon } from 'lucide-react';
import { Fragment, useState } from 'react';

interface InputFieldProps {
	label?: string;
	description?: string;
	placeholder?: string;
	type?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	options?: { value: string; label: string }[];
	className?: string;
	id?: string;
	icon?: typeof Icon;
	error?: string;
	marginClass?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
	label,
	description,
	placeholder,
	type = 'text',
	value,
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
						onChange={onChange}
						className={`w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none ${
							IconComponent ? 'pl-10' : ''
						} ${error ? 'border-destructive' : ''}`}
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
							onChange={onChange}
							className={`w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
								IconComponent ? 'pl-10' : ''
							} ${error ? 'border-destructive' : ''}`}
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
				) : (
					<input
						id={inputId}
						type={type}
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						className={`w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
							IconComponent ? 'pl-10' : ''
						} ${error ? 'border-destructive' : ''}`}
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

interface RadioOptionProps {
	label: string;
	name: string;
	checked?: boolean;
	onChange?: () => void;
	marginClass?: string;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
	label,
	name,
	checked = false,
	marginClass = 'mr-6 mb-3',
	onChange
}) => {
	return (
		<label className={`inline-flex items-center ${marginClass} cursor-pointer group`}>
			<div className="relative flex items-center">
				<input
					type="radio"
					name={name}
					className="sr-only"
					checked={checked}
					onChange={onChange}
					aria-checked={checked}
					aria-label={label}
					tabIndex={0}
				/>
				<div
					className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
						checked
							? 'border-primary bg-primary/10 outline outline-2 outline-primary'
							: 'border-muted-foreground group-hover:border-primary/50'
					} flex items-center justify-center`}
					role="radio"
					aria-checked={checked}
					tabIndex={0}
					aria-label={label}
				>
					{checked && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className="w-2.5 h-2.5 rounded-full bg-primary"
						/>
					)}
				</div>
				<span className="ml-2.5 text-foreground font-medium">{label}</span>
			</div>
		</label>
	);
};

interface GroupedRadioOptionProps {
	id: string;
	label: string;
	value: string;
	allowedValues: string[];
	description: string;
	icon?: typeof Icon;
	onChange: (v: string) => void;
	marginClass?: string;
	className?: string;
}

export const GroupedRadioOption: React.FC<GroupedRadioOptionProps> = ({
	id,
	label,
	value,
	allowedValues,
	description,
	icon: IconComponent,
	onChange,
	marginClass = 'mb-6',
	className = ''
}) => {
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

				{allowedValues.map((v, idx) => (
					<Fragment key={idx}>
						<div>
							<RadioOption
								name={id}
								label={v}
								checked={v == value}
								onChange={() => onChange(v)}
								marginClass={idx != allowedValues.length - 1 ? 'mr-6 mb-3' : 'mr-6'}
							/>
						</div>
					</Fragment>
				))}
			</div>
		</div>
	);
};

interface ToggleProps {
	label: string;
	description?: string;
	checked: boolean;
	onChange: () => void;
	marginClass?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
	label,
	description,
	onChange,
	checked,
	marginClass = 'mb-5'
}) => {
	return (
		<div className={marginClass}>
			<div className="flex items-center">
				<button
					type="button"
					role="switch"
					aria-checked={checked}
					className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
						checked ? 'bg-primary' : 'bg-muted'
					}`}
					onClick={onChange}
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
