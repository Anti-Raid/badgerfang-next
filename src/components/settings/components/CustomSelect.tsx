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

	return (
		<div className="relative w-full" ref={containerRef}>
			<button
				type="button"
				id={id}
				disabled={disabled}
				onClick={() => setIsOpen(!isOpen)}
				className={`
					w-full flex items-center justify-between
					bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-medium
					transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40
					${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
					${isOpen ? 'border-primary/50 ring-4 ring-primary/5 shadow-sm' : 'hover:border-primary/30'}
				`}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-labelledby={label ? `${id}-label` : undefined}
			>
				<span className={selectedOption ? 'text-foreground' : 'text-muted-foreground/40'}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<motion.div 
					animate={{ rotate: isOpen ? 180 : 0 }} 
					transition={{ duration: 0.2 }}
					className="text-muted-foreground/30"
				>
					<ChevronDown className="w-4 h-4" />
				</motion.div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						className="absolute z-[100] w-full mt-2 py-1.5 bg-card border border-border/50 rounded-xl shadow-2xl max-h-60 overflow-y-auto soft-scrollbar"
						role="listbox"
					>
						{options.map((option) => {
							const isSelected = option.value === value;
							return (
								<div
									key={option.value}
									className={`
										group relative flex items-center justify-between px-4 py-2.5 mx-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150
										${isSelected 
											? 'bg-primary/10 text-primary' 
											: 'text-foreground/70 hover:bg-accent hover:text-foreground'}
									`}
									role="option"
									aria-selected={isSelected}
									onClick={() => {
										onChange(option.value);
										setIsOpen(false);
									}}
								>
									<span>{option.label}</span>
									{isSelected && (
										<motion.div
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
										>
											<Check className="w-4 h-4" strokeWidth={3} />
										</motion.div>
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
