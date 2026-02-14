'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
	value: string;
	label: string;
}

interface CustomSelectProps {
	options: Option[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
	label?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
	options,
	value,
	onChange,
	placeholder = 'Select an option',
	disabled = false,
	id,
	label
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeIdx, setActiveIdx] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!isOpen) {
					// Toggle to next option without opening
					const currentIdx = options.findIndex((o) => o.value === value);
					const nextIdx = currentIdx < options.length - 1 ? currentIdx + 1 : currentIdx;
					if (nextIdx !== currentIdx) onChange(options[nextIdx].value);
				} else {
					setActiveIdx((prev) => (prev < options.length - 1 ? prev + 1 : prev));
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (!isOpen) {
					// Toggle to prev option without opening
					const currentIdx = options.findIndex((o) => o.value === value);
					const prevIdx = currentIdx > 0 ? currentIdx - 1 : currentIdx;
					if (prevIdx !== currentIdx) onChange(options[prevIdx].value);
				} else {
					setActiveIdx((prev) => (prev > 0 ? prev - 1 : prev));
				}
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
					const currentIdx = options.findIndex((o) => o.value === value);
					setActiveIdx(currentIdx !== -1 ? currentIdx : 0);
				} else if (activeIdx >= 0) {
					onChange(options[activeIdx].value);
					setIsOpen(false);
				}
				break;
			case 'Escape':
				if (isOpen) {
					e.preventDefault();
					setIsOpen(false);
				}
				break;
			case 'Tab':
				if (isOpen) {
					setIsOpen(false);
				}
				break;
		}
	};

	useEffect(() => {
		if (isOpen) {
			const currentIdx = options.findIndex((o) => o.value === value);
			setActiveIdx(currentIdx !== -1 ? currentIdx : 0);
		} else {
			setActiveIdx(-1);
		}
	}, [isOpen, options, value]);

	return (
		<div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
			<button
				type="button"
				id={id}
				disabled={disabled}
				onClick={() => setIsOpen(!isOpen)}
				className={`
					w-full flex items-center justify-between
					bg-background border border-border rounded-xl px-4 py-3 text-sm
					transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
					${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
					${isOpen ? 'border-primary' : 'hover:border-primary/30'}
				`}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-labelledby={label ? `${id}-label` : undefined}
			>
				<span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.2 }}
					className="text-muted-foreground"
				>
					<ChevronDown className="w-4 h-4" />
				</motion.div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 4 }}
						transition={{ duration: 0.15 }}
						className="absolute z-[100] w-full mt-2 py-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto"
						role="listbox"
						aria-label={label}
					>
						{options.map((option, idx) => {
							const isSelected = option.value === value;
							const isActive = idx === activeIdx;
							return (
								<div
									key={option.value}
									className={`
										flex items-center justify-between px-4 py-2.5 mx-1 rounded-lg text-sm cursor-pointer transition-colors
										${
											isSelected
												? 'bg-primary/10 text-primary'
												: 'text-foreground hover:bg-secondary'
										}
										${isActive ? 'bg-secondary' : ''}
									`}
									role="option"
									aria-selected={isSelected}
									onClick={() => {
										onChange(option.value);
										setIsOpen(false);
									}}
									onMouseEnter={() => setActiveIdx(idx)}
								>
									<span>{option.label}</span>
									{isSelected && (
										<Check className="w-4 h-4" strokeWidth={2} />
									)}
								</div>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
