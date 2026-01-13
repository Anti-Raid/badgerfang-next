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
					bg-secondary/20 backdrop-blur-xl
					border-2 border-white/5 hover:border-primary/40
					transition-all duration-500
					rounded-2xl p-4 text-sm font-bold tracking-tight
					focus:outline-none focus:ring-2 focus:ring-primary/40
					${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
					${isOpen ? 'border-primary/60 ring-4 ring-primary/10 shadow-[0_0_40px_rgba(var(--primary),0.1)] scale-[1.01]' : 'hover:scale-[1.005] shadow-sm'}
				`}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-labelledby={label ? `${id}-label` : undefined}
			>
				<span className={`transition-colors duration-300 ${selectedOption ? 'text-foreground' : 'text-foreground/40 font-medium'}`}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.2 : 1 }}
					transition={{ duration: 0.4, type: 'spring', damping: 15 }}
					className={`flex items-center justify-center w-6 h-6 rounded-lg ${isOpen ? 'bg-primary/20 text-primary' : 'text-foreground/20'}`}
				>
					<ChevronDown className="w-4 h-4" />
				</motion.div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
						animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
						exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
						transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 350 }}
						className="absolute z-[100] w-full mt-3 py-2.5
							bg-background/80 backdrop-blur-3xl
							border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]
							max-h-[300px] overflow-y-auto no-scrollbar
							ring-1 ring-white/10 origin-top"
						role="listbox"
					>
						<div className="px-2 space-y-1">
							{options.length === 0 ? (
								<div className="px-4 py-6 text-sm text-foreground/30 italic text-center font-medium">
									No options available
								</div>
							) : (
								options.map((option) => {
									const isSelected = option.value === value;
									return (
										<button
											key={option.value}
											type="button"
											onClick={() => {
												onChange(option.value);
												setIsOpen(false);
											}}
											role="option"
											aria-selected={isSelected}
											className={`
												w-full flex items-center justify-between px-5 py-3.5 rounded-xl
												transition-all duration-300 group/item
												${isSelected 
													? 'bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20' 
													: 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}
											`}
										>
											<span className="tracking-tight uppercase text-xs italic font-black">{option.label}</span>
											{isSelected ? (
												<motion.div
													initial={{ scale: 0, rotate: -45 }}
													animate={{ scale: 1, rotate: 0 }}
													transition={{ type: 'spring', stiffness: 500 }}
												>
													<Check className="w-4 h-4 stroke-[3px]" />
												</motion.div>
											) : (
												<motion.div
													className="opacity-0 group-hover/item:opacity-100 transition-opacity"
													initial={{ x: -5 }}
													whileHover={{ x: 0 }}
												>
													<ChevronDown className="w-3 h-3 -rotate-90 text-primary" />
												</motion.div>
											)}
										</button>
									);
								})
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
