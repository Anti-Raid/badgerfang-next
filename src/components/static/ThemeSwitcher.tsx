'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { PaletteIcon, Check } from 'lucide-react';

interface Theme {
	id: string;
	label: string;
}

const ThemeSelector: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();
	const dropdownRef = useRef<HTMLDivElement>(null);

	const themes: Theme[] = [
		// Original themes
		{ id: 'dark', label: 'Dark' },
		{ id: 'blue-theme', label: 'Ocean Blue' },
		{ id: 'dark-blue-theme', label: 'Midnight Navy' },
		{ id: 'dark-red-theme', label: 'Crimson Night' },
		{ id: 'green-theme', label: 'Emerald' },
		{ id: 'dark-green-theme', label: 'Forest Deep' },
		{ id: 'electric-purple-theme', label: 'Electric Purple' },
		{ id: 'sunset-amber-theme', label: 'Sunset Amber' },
	
		// New themes
		{ id: 'stargaze-theme', label: 'Stargaze' },
		{ id: 'sunbeam-theme', label: 'Sunbeam' },
		{ id: 'velvet-sky-theme', label: 'Velvet Sky' },
		{ id: 'crisp-theme', label: 'Crisp' },
		{ id: 'float-theme', label: 'Float' },
		{ id: 'puzzlebloom-theme', label: 'PuzzleBloom' },
	];
	
	const getThemeColors = (themeId: string) => {
		switch (themeId) {
			// Original themes
			case 'dark':
				return 'from-[hsl(268,95%,55%)] to-[hsl(244,80%,65%)]';
			case 'blue-theme':
				return 'from-[hsl(210,100%,60%)] to-[hsl(195,85%,65%)]';
			case 'dark-blue-theme':
				return 'from-[hsl(220,95%,50%)] to-[hsl(200,90%,60%)]';
			case 'dark-red-theme':
				return 'from-[hsl(355,95%,55%)] to-[hsl(330,90%,65%)]';
			case 'green-theme':
				return 'from-[hsl(155,85%,45%)] to-[hsl(170,85%,55%)]';
			case 'dark-green-theme':
				return 'from-[hsl(155,95%,40%)] to-[hsl(170,90%,50%)]';
			case 'electric-purple-theme':
				return 'from-[hsl(275,100%,60%)] to-[hsl(290,90%,70%)]';
			case 'sunset-amber-theme':
				return 'from-[hsl(35,100%,55%)] to-[hsl(20,90%,65%)]';
	
			// New themes
			case 'stargaze-theme':
				return 'from-[#BBA9AB] to-[#B4A9B8]';
			case 'sunbeam-theme':
				return 'from-[#F0F1ED] to-[#A5CCDC]';
			case 'velvet-sky-theme':
				return 'from-[#A792B1] to-[#A8C0D9]';
			case 'crisp-theme':
				return 'from-[#F0F1ED] to-[#A5CCDC]';
			case 'float-theme':
				return 'from-[#A6D1D9] to-[#7FB8BE]';
			case 'puzzlebloom-theme':
				return 'from-[#F0E3CB] to-[#D9AA90]';
	
			default:
				return 'from-primary to-extra';
		}
	};
	

	// Set mounted to true once the component is mounted
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (theme && mounted) {
			document.documentElement.classList.add('theme-transition');
			setTimeout(() => {
				document.documentElement.classList.remove('theme-transition');
			}, 300);
		}
	}, [theme, mounted]);


	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 rounded-full hover:bg-accent transition-all flex items-center justify-center group"
				aria-label="Change theme"
			>
				<div className="relative">
					<PaletteIcon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
				</div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ duration: 0.15 }}
						className="absolute right-0 mt-2 p-3 rounded-lg shadow-xl bg-card border border-border w-72 z-50 backdrop-blur-sm"
					>
						<div className="mb-2 pb-2 border-b border-border">
							<h3 className="text-sm font-medium text-foreground">Select Theme</h3>
							<p className="text-xs text-muted-foreground mt-1">
								Customize your interface appearance
							</p>
						</div>

						<div className="grid grid-cols-2 gap-2">
							{themes.map((themeOption) => {
								const isActive = theme === themeOption.id;
								return (
									<button
										key={themeOption.id}
										onClick={() => {
											setTheme(themeOption.id);
											setIsOpen(false);
										}}
										className={`relative rounded-lg p-4 transition-all duration-200
                      ${isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:bg-accent/50'}
                      bg-gradient-to-br ${getThemeColors(themeOption.id)} group
                    `}
									>
										<div className="absolute inset-0 bg-black opacity-60 rounded-lg group-hover:opacity-50 transition-opacity" />

										<div className="relative flex items-center justify-between">
											<span className="text-white text-sm font-medium">{themeOption.label}</span>
											{isActive && (
												<span className="flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-md">
													<Check className="h-3 w-3 text-primary" />
												</span>
											)}
										</div>

										<div className="relative mt-2 flex space-x-1">
											<span className="w-2 h-2 rounded-full bg-white opacity-60" />
											<span className="w-2 h-2 rounded-full bg-white opacity-80" />
											<span className="w-2 h-2 rounded-full bg-white" />
										</div>
									</button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ThemeSelector;
