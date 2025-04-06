'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface InputFieldProps {
	label: string;
	description?: string;
	placeholder?: string;
	type?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	options?: { value: string; label: string }[];
	className?: string;
	id?: string;
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
	id
}) => {
	return (
		<div className={`mb-6 group ${className}`}>
			<label
				htmlFor={id || label.toLowerCase().replace(/\s+/g, '-')}
				className="block text-foreground font-medium mb-1.5 text-sm"
			>
				{label}
			</label>
			{description && <p className="text-sm text-muted-foreground mb-2.5">{description}</p>}
			{type === 'select' ? (
				<div className="relative">
					<select
						id={id || label.toLowerCase().replace(/\s+/g, '-')}
						value={value}
						onChange={onChange}
						className="w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none"
					>
						{options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
						<svg
							width="12"
							height="8"
							viewBox="0 0 12 8"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M1 1.5L6 6.5L11 1.5"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>
			) : type === 'password' ? (
				<div className="relative">
					<input
						id={id || label.toLowerCase().replace(/\s+/g, '-')}
						type={type}
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						className="w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
					/>
					<button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors">
						<Eye className="w-4 h-4" />
					</button>
				</div>
			) : (
				<input
					id={id || label.toLowerCase().replace(/\s+/g, '-')}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className="w-full bg-background border-2 border-border hover:border-primary/50 transition-colors duration-200 rounded-md p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
				/>
			)}
		</div>
	);
};

interface RadioOptionProps {
	label: string;
	name: string;
	checked?: boolean;
	onChange?: () => void;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
	label,
	name,
	checked = false,
	onChange
}) => {
	return (
		<label className="inline-flex items-center mr-6 mb-3 cursor-pointer group">
			<div className="relative flex items-center">
				<input type="radio" name={name} className="sr-only" checked={checked} onChange={onChange} />
				<div
					className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
						checked
							? 'border-primary bg-primary/10'
							: 'border-muted-foreground group-hover:border-primary/50'
					} flex items-center justify-center`}
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

interface ToggleProps {
	label: string;
	description?: string;
	checked: boolean;
	onChange: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, description, onChange, checked }) => {
	return (
		<div className="mb-5">
			<div className="flex items-center">
				<button
					type="button"
					role="switch"
					aria-checked={checked}
					className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
						checked ? 'bg-primary' : 'bg-muted'
					}`}
					onClick={onChange}
				>
					<span
						className={`${
							checked ? 'translate-x-6' : 'translate-x-1'
						} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out`}
					/>
				</button>
				<span className="ml-3 font-medium text-foreground">{label}</span>
			</div>
			{description && <p className="text-sm text-muted-foreground mt-1 ml-14">{description}</p>}
		</div>
	);
};
