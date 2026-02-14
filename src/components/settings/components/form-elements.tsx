'use client';

import React, { Fragment, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import type { Icon } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface BaseLabelAndDescriptionProps {
	label?: string;
	description?: string;
	className?: string;
	id?: string;
	marginClass?: string;
	required?: boolean;
	focused?: boolean;
}

export const BaseLabelAndDescription: React.FC<BaseLabelAndDescriptionProps> = ({
	label,
	description,
	className = '',
	id,
	marginClass = 'mb-4',
	required,
	focused
}) => {
	return (
		<div className={`${marginClass} ${className}`}>
			{label && (
				<div className="flex items-center gap-2 mb-1.5">
					<label
						htmlFor={id}
						className={`text-sm font-medium transition-colors ${focused ? 'text-foreground' : 'text-foreground'}`}
						id={id ? `${id}-label` : undefined}
					>
						{label}
						{required && <span className="text-destructive ml-1">*</span>}
					</label>
				</div>
			)}
			{description && (
				<p className="text-xs text-muted-foreground" id={id ? `${id}-desc` : undefined}>
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
	onChange?: (value: string) => void;
	options?: { value: string; label: string }[];
	className?: string;
	id?: string;
	icon?: any;
	error?: string;
	marginClass?: string;
	disabled?: boolean;
	required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
	id,
	label,
	description,
	placeholder,
	value,
	type = 'text',
	disabled = false,
	required = false,
	error,
	onChange,
	options,
	icon: IconComponent,
	marginClass = 'mb-6'
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const isPassword = type === 'password';
	const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

	return (
		<div className={`${marginClass} group/input`}>
			<BaseLabelAndDescription
				id={inputId}
				label={label}
				description={description}
				required={required}
				focused={isFocused}
			/>
			<div className="relative">
				{IconComponent && (
					<div
						className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors ${isFocused ? 'text-foreground' : 'text-muted-foreground'}`}
					>
						<IconComponent size={18} />
					</div>
				)}
				{type === 'select' ? (
					<CustomSelect
						id={inputId}
						label={label}
						value={value || ''}
						options={options || []}
						placeholder={placeholder}
						disabled={disabled}
						onChange={(val) => {
							if (disabled) return;
							if (onChange) onChange(val);
						}}
					/>
				) : type === 'textarea' ? (
					<textarea
						id={inputId}
						className={`
							w-full px-4 py-3 rounded-xl text-sm transition-colors
							bg-background border border-border placeholder:text-muted-foreground
							focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
							disabled:opacity-50 disabled:cursor-not-allowed min-h-[120px] resize-y
							${error ? 'border-destructive' : ''}
							${IconComponent ? 'pl-11' : ''}
						`}
						placeholder={placeholder}
						value={value}
						disabled={disabled}
						onChange={(e) => onChange && onChange(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						required={required}
					/>
				) : (
					<div className="relative">
						<input
							id={inputId}
							type={inputType}
							className={`
								w-full px-4 py-3 rounded-xl text-sm transition-colors
								bg-background border border-border placeholder:text-muted-foreground
								focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
								disabled:opacity-50 disabled:cursor-not-allowed
								${error ? 'border-destructive' : ''}
								${isPassword ? 'pr-12' : ''}
								${IconComponent ? 'pl-11' : ''}
							`}
							placeholder={placeholder}
							value={value}
							disabled={disabled}
							onChange={(e) => onChange && onChange(e.target.value)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							required={required}
						/>
						{isPassword && (
							<button
								type="button"
								className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
								onClick={togglePasswordVisibility}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						)}
					</div>
				)}
			</div>
			<AnimatePresence>
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex items-center gap-2 mt-2 text-xs text-destructive"
					>
						<span className="w-1 h-1 rounded-full bg-destructive" />
						{error}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

interface RadioOptionProps {
	label: string;
	name: string;
	checked?: boolean;
	onChange?: () => void;
	disabled?: boolean;
	marginClass?: string;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
	label,
	name,
	disabled = false,
	checked = false,
	marginClass = 'mr-6 mb-2',
	onChange
}) => {
	return (
		<label className={`inline-flex items-center ${marginClass} cursor-pointer group/radio`}>
			<div className="relative flex items-center">
				<input
					type="radio"
					name={name}
					className="sr-only"
					disabled={disabled}
					checked={checked}
					onChange={() => {
						if (disabled) return;
						if (onChange) onChange();
					}}
					aria-checked={checked}
					aria-label={label}
				/>
				<div
					className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center
					${
						checked
							? 'border-primary bg-primary/5'
							: 'border-border bg-background group-hover/radio:border-primary/30'
					}`}
				>
					<AnimatePresence>
						{checked && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								exit={{ scale: 0 }}
								className="w-2.5 h-2.5 rounded-full bg-primary"
							/>
						)}
					</AnimatePresence>
				</div>
				<span
					className={`ml-3 text-sm transition-colors ${checked ? 'text-foreground' : 'text-muted-foreground'}`}
				>
					{label}
				</span>
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
	disabled?: boolean;
	onChange: (v: string) => void;
	marginClass?: string;
	className?: string;
}

export const GroupedRadioOption: React.FC<GroupedRadioOptionProps> = ({
	id,
	label,
	value,
	disabled = false,
	allowedValues,
	description,
	onChange,
	marginClass = 'mb-8',
	className = ''
}) => {
	const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

	return (
		<div className={`${marginClass} ${className}`}>
			<BaseLabelAndDescription id={inputId} label={label} description={description} />

			<div className="flex flex-wrap gap-2">
				{allowedValues.map((v: string, idx: number) => (
					<RadioOption
						key={idx}
						name={id}
						label={v}
						checked={v == value}
						disabled={disabled}
						onChange={() => onChange(v)}
						marginClass="mb-2"
					/>
				))}
			</div>
		</div>
	);
};

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
	marginClass = 'mb-6'
}) => {
	const descriptionId = React.useId();

	return (
		<div className={`${marginClass} group/toggle`}>
			<div className="flex items-center justify-between gap-4 p-1">
				<div className="flex-1">
					<span
						className={`block text-sm font-medium transition-colors ${checked ? 'text-foreground' : 'text-muted-foreground'}`}
					>
						{label}
					</span>
					{description && (
						<p id={descriptionId} className="text-xs text-muted-foreground mt-0.5">
							{description}
						</p>
					)}
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={checked}
					disabled={disabled}
					className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
						checked ? 'bg-primary' : 'bg-secondary'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
					onClick={() => {
						if (disabled) return;
						if (onChange) onChange();
					}}
					aria-label={label}
					aria-describedby={description ? descriptionId : undefined}
					tabIndex={0}
				>
					<motion.span
						className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
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
			</div>
		</div>
	);
};
