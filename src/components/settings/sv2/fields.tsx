'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { Choice } from './context';

const inputBase =
	'w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors';
const inputDisabled =
	'w-full px-3 py-2 rounded-md border border-input bg-muted text-sm text-muted-foreground shadow-sm cursor-not-allowed';

const labelCls = 'text-sm font-medium text-foreground';
const descCls = 'text-sm text-muted-foreground';

interface BaseProps {
	id: string;
	label?: string;
	description?: string;
	placeholder?: string;
	disabled?: boolean;
}

export function TextField({
	id,
	label,
	description,
	placeholder,
	value,
	onChange,
	disabled
}: BaseProps & { value: string; onChange: (v: string) => void }) {
	return (
		<div className="flex flex-col gap-2 mb-4">
			{label && (
				<label htmlFor={id} className={labelCls}>
					{label}
				</label>
			)}
			{description && <p className={descCls}>{description}</p>}
			<input
				id={id}
				type="text"
				placeholder={placeholder}
				disabled={disabled}
				aria-disabled={disabled}
				value={value ?? ''}
				onChange={(e) => onChange(e.target.value)}
				className={disabled ? inputDisabled : inputBase}
			/>
		</div>
	);
}

export function NumberField({
	id,
	label,
	description,
	placeholder,
	value,
	onChange,
	disabled
}: BaseProps & { value: number; onChange: (v: number) => void }) {
	return (
		<div className="flex flex-col gap-2 mb-4">
			{label && (
				<label htmlFor={id} className={labelCls}>
					{label}
				</label>
			)}
			{description && <p className={descCls}>{description}</p>}
			<input
				id={id}
				type="number"
				placeholder={placeholder}
				disabled={disabled}
				aria-disabled={disabled}
				value={Number.isFinite(value) ? value : 0}
				onChange={(e) => onChange(e.target.valueAsNumber || 0)}
				className={disabled ? inputDisabled : inputBase}
			/>
		</div>
	);
}

export function ToggleField({
	id,
	label,
	description,
	checked,
	onChange,
	disabled
}: BaseProps & { checked: boolean; onChange: (v: boolean) => void }) {
	return (
		<div className="flex flex-col gap-1 mb-4">
			<div className="flex items-center gap-3">
				<button
					type="button"
					id={id}
					role="switch"
					aria-checked={checked}
					aria-label={label}
					disabled={disabled}
					onClick={() => !disabled && onChange(!checked)}
					className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
						checked ? 'bg-primary' : 'bg-muted'
					}`}
				>
					<span
						aria-hidden="true"
						className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
							checked ? 'translate-x-5' : 'translate-x-0'
						}`}
					/>
				</button>
				{label && (
					<label htmlFor={id} className={`${labelCls} cursor-pointer select-none`}>
						{label}
					</label>
				)}
			</div>
			{description && <p className={descCls}>{description}</p>}
		</div>
	);
}

export function SelectField({
	id,
	label,
	description,
	placeholder = 'Select an option...',
	value,
	onChange,
	options,
	disabled
}: BaseProps & { value: string; onChange: (v: string) => void; options: Choice[] }) {
	return (
		<div className="flex flex-col gap-2 mb-4">
			{label && (
				<label htmlFor={id} className={labelCls}>
					{label}
				</label>
			)}
			{description && <p className={descCls}>{description}</p>}
			<div className="relative">
				<select
					id={id}
					value={value ?? ''}
					disabled={disabled}
					onChange={(e) => onChange(e.target.value)}
					className={`${disabled ? inputDisabled : inputBase} appearance-none pr-9`}
				>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			</div>
		</div>
	);
}

export function MultiSelectField({
	id,
	label,
	description,
	placeholder = 'Select options...',
	value,
	onChange,
	options,
	disabled
}: BaseProps & { value: string[]; onChange: (v: string[]) => void; options: Choice[] }) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const selected = useMemo(() => new Set(value ?? []), [value]);
	const filtered = useMemo(
		() => options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase())),
		[options, searchTerm]
	);
	const hasFilteredSelections = filtered.some((o) => selected.has(o.value));

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
	}, [isOpen]);

	const toggleValue = (val: string) => {
		if (disabled) return;
		onChange(selected.has(val) ? (value ?? []).filter((v) => v !== val) : [...(value ?? []), val]);
	};
	const removeValue = (val: string) => {
		if (disabled) return;
		onChange((value ?? []).filter((v) => v !== val));
	};
	const clearAll = () => {
		if (disabled) return;
		const toRemove = new Set(filtered.map((o) => o.value));
		onChange((value ?? []).filter((v) => !toRemove.has(v)));
	};
	const selectAll = () => {
		if (disabled) return;
		onChange(Array.from(new Set([...(value ?? []), ...filtered.map((o) => o.value)])));
	};

	return (
		<div className="flex flex-col gap-2 mb-4 relative w-full" ref={containerRef}>
			{label && (
				<label htmlFor={id} className={labelCls}>
					{label}
				</label>
			)}
			{description && <p className={descCls}>{description}</p>}

			<div
				id={id}
				role="combobox"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				onClick={() => !disabled && setIsOpen((o) => !o)}
				onKeyDown={(e) => {
					if (disabled) return;
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						setIsOpen((o) => !o);
					} else if (e.key === 'Escape') {
						setIsOpen(false);
					}
				}}
				className={`flex items-center justify-between w-full px-3 py-1.5 rounded-md border shadow-sm text-left text-sm min-h-10 transition-all cursor-pointer select-none focus:outline-none focus-within:ring-2 focus-within:ring-ring ${
					disabled ? 'bg-muted cursor-not-allowed' : 'bg-background'
				} ${isOpen ? 'border-ring' : 'border-input'}`}
			>
				<div className="grow flex flex-wrap gap-1.5 items-center min-w-0 pr-2">
					{(value ?? []).length === 0 ? (
						<span className="text-muted-foreground text-sm select-none">{placeholder}</span>
					) : (
						(value ?? []).map((val) => {
							const option = options.find((o) => o.value === val);
							return (
								<span
									key={val}
									className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2 py-0.5 rounded"
								>
									{option ? option.label : val}
									{!disabled && (
										<button
											type="button"
											aria-label={`Remove ${option ? option.label : val}`}
											onClick={(e) => {
												e.stopPropagation();
												removeValue(val);
											}}
											className="hover:bg-primary/20 rounded-full p-0.5 inline-flex items-center justify-center"
										>
											<X className="w-3 h-3" />
										</button>
									)}
								</span>
							);
						})
					)}
				</div>
				<ChevronDown
					className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
				/>
			</div>

			{isOpen && (
				<div className="absolute left-0 right-0 z-50 mt-1 top-full bg-popover border border-border rounded-md shadow-lg flex flex-col overflow-hidden w-full">
					<div className="relative border-b border-border flex items-center">
						<Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search..."
							className="w-full pl-9 pr-8 py-2 text-sm focus:outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
						/>
						{searchTerm && (
							<button
								type="button"
								aria-label="Clear search"
								onClick={() => setSearchTerm('')}
								className="absolute right-3 text-muted-foreground hover:text-foreground"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>

					{options.length > 0 && (
						<div className="flex justify-between items-center px-3 py-1.5 bg-secondary/50 border-b border-border text-xs text-primary font-medium select-none">
							<button type="button" className="hover:underline" onClick={selectAll}>
								Select All
							</button>
							<button
								type="button"
								className="hover:underline disabled:opacity-50"
								disabled={!hasFilteredSelections}
								onClick={clearAll}
							>
								Clear All
							</button>
						</div>
					)}

					<div className="max-h-60 overflow-y-auto divide-y divide-border" role="listbox">
						{filtered.length === 0 ? (
							<div className="px-3 py-3 text-sm text-muted-foreground text-center select-none">
								No options found
							</div>
						) : (
							filtered.map((option) => {
								const isSelected = selected.has(option.value);
								return (
									<button
										key={option.value}
										type="button"
										role="option"
										aria-selected={isSelected}
										onClick={() => toggleValue(option.value)}
										className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 flex items-center justify-between transition-colors focus:outline-none"
									>
										<span className={isSelected ? 'font-semibold text-primary' : 'text-foreground'}>
											{option.label}
										</span>
										{isSelected && <Check className="w-4 h-4 text-primary" />}
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export function MultiTextField({
	id,
	label,
	description,
	placeholder = 'Type and press Enter...',
	value,
	onChange,
	disabled
}: BaseProps & { value: string[]; onChange: (v: string[]) => void }) {
	const [inputValue, setInputValue] = useState('');
	const currentPlaceholder = (value ?? []).length === 0 ? placeholder : 'Add more...';

	const addTag = () => {
		if (disabled) return;
		const trimmed = inputValue.trim();
		if (trimmed && !(value ?? []).includes(trimmed)) {
			onChange([...(value ?? []), trimmed]);
			setInputValue('');
		}
	};
	const removeTag = (index: number) => {
		if (disabled) return;
		onChange((value ?? []).filter((_, i) => i !== index));
	};

	return (
		<div className="flex flex-col gap-2 mb-4 relative w-full">
			{label && (
				<label htmlFor={id} className={labelCls}>
					{label}
				</label>
			)}
			{description && <p className={descCls}>{description}</p>}
			<div
				className={`flex flex-wrap gap-1.5 items-center px-3 py-1.5 rounded-md border border-input shadow-sm focus-within:ring-2 focus-within:ring-ring min-h-10 transition-all cursor-text ${
					disabled ? 'bg-muted cursor-not-allowed' : 'bg-background'
				}`}
			>
				{(value ?? []).map((tag, index) => (
					<span
						key={`${tag}-${index}`}
						className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground border border-border text-xs font-semibold px-2 py-0.5 rounded"
					>
						{tag}
						{!disabled && (
							<button
								type="button"
								aria-label={`Remove ${tag}`}
								onClick={() => removeTag(index)}
								className="hover:bg-border rounded-full p-0.5 inline-flex items-center justify-center"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</span>
				))}
				<input
					type="text"
					id={id}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={(e) => {
						if (disabled) return;
						if (e.key === 'Enter') {
							e.preventDefault();
							addTag();
						} else if (e.key === 'Backspace' && inputValue === '' && (value ?? []).length > 0) {
							removeTag((value ?? []).length - 1);
						}
					}}
					onBlur={addTag}
					placeholder={currentPlaceholder}
					disabled={disabled}
					className="grow min-w-[7.5rem] focus:outline-none p-0 text-sm bg-transparent text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
				/>
			</div>
		</div>
	);
}
