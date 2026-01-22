'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from '@/components/ui/motion';
import { useTheme } from 'next-themes';
import { PaletteIcon, Check, Sparkles, X } from 'lucide-react';

interface Theme {
	id: string;
	label: string;
}

interface ThemeSelectorProps {
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps & { variant?: 'dropdown' | 'sheet' | 'icon' }> = ({
	isOpen: controlledIsOpen,
	onOpenChange,
	variant = 'dropdown'
}) => {
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
	const setIsOpen = (value: boolean) => {
		if (onOpenChange) {
			onOpenChange(value);
		} else {
			setInternalIsOpen(value);
		}
	};

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

		// Modern themes
		{ id: 'stargaze-theme', label: 'Stargaze' },
		{ id: 'sunbeam-theme', label: 'Sunbeam' },
		{ id: 'velvetsky-theme', label: 'Velvet Sky' },
		{ id: 'crisp-theme', label: 'Crisp' },
		{ id: 'float-theme', label: 'Float' },
		{ id: 'puzzlebloom-theme', label: 'PuzzleBloom' },

		// New Vibrant Themes
		{ id: 'neon-cyber-theme', label: 'Neon Cyber' },
		{ id: 'retro-haze-theme', label: 'Retro Haze' },
		{ id: 'deep-ocean-theme', label: 'Deep Ocean' },
		{ id: 'cotton-candy-theme', label: 'Cotton Candy' }
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
			case 'velvetsky-theme':
				return 'from-[#A792B1] to-[#A8C0D9]';
			case 'crisp-theme':
				return 'from-[#F0F1ED] to-[#A5CCDC]';
			case 'float-theme':
				return 'from-[#A6D1D9] to-[#7FB8BE]';
			case 'puzzlebloom-theme':
				return 'from-[#F0E3CB] to-[#D9AA90]';

			// New Vibrant Themes
			case 'neon-cyber-theme':
				return 'from-[#d946ef] to-[#06b6d4]';
			case 'retro-haze-theme':
				return 'from-[#fb923c] to-[#a855f7]';
			case 'deep-ocean-theme':
				return 'from-[#0ea5e9] to-[#1e293b]';
			case 'cotton-candy-theme':
				return 'from-[#f9a8d4] to-[#a5f3fc]';

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
				// Only close on click outside if we NOT in sheet mode (sheet deals with its own backdrop)
				// Actually, for dropdown logic, we handle it here.
				// For sheet, we might want a separate backdrop handler or rely on the same logic if the sheet is inside ref.
				// However, sheet is usually portal-like or fixed.
				// Let's rely on the backdrop click for sheet.
				if (variant === 'dropdown' || variant === 'icon') setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [variant]); // Added variant dep

	useEffect(() => {
		if (theme && mounted) {
			document.documentElement.classList.add('theme-transition');
			setTimeout(() => {
				document.documentElement.classList.remove('theme-transition');
			}, 300);
		}
	}, [theme, mounted]);

	const ThemeButton = ({ themeOption }: { themeOption: Theme }) => {
		const isActive = theme === themeOption.id;
		return (
			<button
				onClick={() => {
					setTheme(themeOption.id);
					setIsOpen(false);
				}}
				className={`relative h-20 rounded-2xl overflow-hidden transition-all duration-300 group shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
				${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[0.98]' : 'hover:scale-[1.02] hover:shadow-md'}
				`}
			>
				{/* Gradient Background */}
				<div className={`absolute inset-0 bg-gradient-to-br ${getThemeColors(themeOption.id)}`} />

				{/* Overlay */}
				<div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

				{/* Content */}
				<div className="relative h-full p-3 flex flex-col justify-between">
					<div className="flex justify-between items-start">
						{isActive && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="bg-white/30 backdrop-blur-md rounded-full p-1"
							>
								<Check className="h-3 w-3 text-white" />
							</motion.div>
						)}
					</div>
					<span
						className={`text-sm font-bold text-white/95 group-hover:text-white transition-colors text-left truncate shadow-sm ${!isActive && 'mt-auto'}`}
					>
						{themeOption.label}
					</span>
				</div>
			</button>
		);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Trigger Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`
                    relative group overflow-hidden
                    flex items-center justify-center
                    transition-all duration-300
                    ${
											variant === 'sheet'
												? 'p-2 rounded-full hover:bg-muted/50 active:scale-95'
												: variant === 'icon'
													? 'p-2 rounded-full hover:bg-white/10'
													: 'p-2.5 rounded-xl hover:bg-accent/80 ring-1 ring-border/50 hover:ring-primary/50'
										}
                `}
				aria-label="Change theme"
			>
				{variant === 'dropdown' && (
					<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
				)}
				<div className="relative z-10">
					<PaletteIcon
						className={`
                            transition-colors duration-300
                            ${variant === 'sheet' ? 'h-6 w-6 text-foreground' : 'h-5 w-5 text-muted-foreground group-hover:text-primary'}
                            ${variant === 'icon' ? 'text-white/70 hover:text-white' : ''}
                        `}
					/>
				</div>
			</button>

			<AnimatePresence>
				{isOpen &&
					(variant === 'sheet' ? (
						<>
							{/* Mobile Backdrop */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998]"
								onClick={() => setIsOpen(false)}
								style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
							/>
							{/* Mobile Sheet */}
							<motion.div
								initial={{ y: '100%' }}
								animate={{ y: 0 }}
								exit={{ y: '100%' }}
								transition={{ type: 'spring', damping: 25, stiffness: 250 }}
								className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/98 backdrop-blur-3xl rounded-t-[32px] overflow-hidden border-t border-white/10 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.6)] max-h-[80vh] flex flex-col"
							>
								{/* Drag Handle Area */}
								<div
									className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors touch-none"
									onClick={() => setIsOpen(false)}
									role="button"
									tabIndex={0}
									aria-label="Close theme gallery"
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											setIsOpen(false);
										}
									}}
								>
									<div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
								</div>

								{/* Header */}
								<div className="px-6 pb-4 flex items-center justify-between border-b border-border/30">
									<div>
										<h3 className="text-xl font-bold text-foreground tracking-tight">
											Theme Gallery
										</h3>
										<p className="text-sm text-muted-foreground">Select your preferred style</p>
									</div>
									<button
										onClick={() => setIsOpen(false)}
										className="p-2 bg-muted/50 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
										aria-label="Close"
									>
										<X size={20} />
									</button>
								</div>

								{/* Scrollable Content */}
								<div
									className="p-4 overflow-y-auto overflow-x-hidden soft-scrollbar"
									style={{ maxHeight: '60vh' }}
								>
									<div className="grid grid-cols-2 gap-3 pb-safe-area-inset-bottom">
										{themes.map((t) => (
											<ThemeButton key={t.id} themeOption={t} />
										))}
									</div>
									{/* Bottom Safe Area Spacer */}
									<div className="h-8 md:h-0" />
								</div>
							</motion.div>
						</>
					) : (
						/* Desktop Dropdown (for 'dropdown' and 'icon' variants) */
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
							animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
							exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
							transition={{ duration: 0.2, type: 'spring' }}
							className="absolute right-0 mt-4 p-1 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-background/95 backdrop-blur-3xl border border-white/10 w-[360px] z-[100] overflow-hidden ring-1 ring-black/5 origin-top-right"
						>
							<div className="p-5 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
								<div className="flex items-center gap-3">
									<div className="p-2.5 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
										<Sparkles className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h3 className="text-base font-bold text-foreground">Theme Gallery</h3>
										<p className="text-xs text-muted-foreground font-medium">
											Personalize your interface
										</p>
									</div>
								</div>
							</div>

							<div className="p-3 max-h-[450px] overflow-y-auto no-scrollbar bg-grid-pattern">
								<div className="grid grid-cols-2 gap-2.5">
									{themes.map((t) => (
										<ThemeButton key={t.id} themeOption={t} />
									))}
								</div>
							</div>
						</motion.div>
					))}
			</AnimatePresence>
		</div>
	);
};

export default ThemeSelector;
