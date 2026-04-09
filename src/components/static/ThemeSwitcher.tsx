'use client';

import React, { useState, useRef, useEffect } from 'react';
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

const ThemeSelector: React.FC<
	ThemeSelectorProps & { variant?: 'dropdown' | 'sheet' | 'icon' | 'inline' }
> = ({ isOpen: controlledIsOpen, onOpenChange, variant = 'dropdown' }) => {
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
		{ id: 'dark', label: 'Dark' },
		{ id: 'blue-theme', label: 'Ocean Blue' },
		{ id: 'dark-blue-theme', label: 'Midnight Navy' },
		{ id: 'dark-red-theme', label: 'Crimson Night' },
		{ id: 'green-theme', label: 'Emerald' },
		{ id: 'dark-green-theme', label: 'Forest Deep' },
		{ id: 'electric-purple-theme', label: 'Electric Purple' },
		{ id: 'sunset-amber-theme', label: 'Sunset Amber' },
		{ id: 'stargaze-theme', label: 'Stargaze' },
		{ id: 'sunbeam-theme', label: 'Sunbeam' },
		{ id: 'velvetsky-theme', label: 'Velvet Sky' },
		{ id: 'crisp-theme', label: 'Crisp' },
		{ id: 'float-theme', label: 'Float' },
		{ id: 'puzzlebloom-theme', label: 'PuzzleBloom' },
		{ id: 'neon-cyber-theme', label: 'Neon Cyber' },
		{ id: 'retro-haze-theme', label: 'Retro Haze' },
		{ id: 'deep-ocean-theme', label: 'Deep Ocean' },
		{ id: 'cotton-candy-theme', label: 'Cotton Candy' },
		{ id: 'arctic-frost-theme', label: 'Arctic Frost' },
		{ id: 'aurora-theme', label: 'Aurora' },
		{ id: 'mocha-theme', label: 'Mocha' },
		{ id: 'sakura-theme', label: 'Sakura' },
		{ id: 'void-theme', label: 'Void' },
		{ id: 'copper-theme', label: 'Copper' },
		{ id: 'hacker-theme', label: 'Hacker' },
		{ id: 'dusk-theme', label: 'Dusk' }
	];

	const getThemeColors = (themeId: string) => {
		switch (themeId) {
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
			case 'neon-cyber-theme':
				return 'from-[#d946ef] to-[#06b6d4]';
			case 'retro-haze-theme':
				return 'from-[#fb923c] to-[#a855f7]';
			case 'deep-ocean-theme':
				return 'from-[#0ea5e9] to-[#1e293b]';
			case 'cotton-candy-theme':
				return 'from-[#f9a8d4] to-[#a5f3fc]';
			case 'arctic-frost-theme':
				return 'from-[hsl(195,85%,45%)] to-[hsl(180,75%,42%)]';
			case 'aurora-theme':
				return 'from-[hsl(160,100%,48%)] to-[hsl(185,100%,44%)]';
			case 'mocha-theme':
				return 'from-[hsl(25,72%,52%)] to-[hsl(35,65%,58%)]';
			case 'sakura-theme':
				return 'from-[hsl(345,70%,62%)] to-[hsl(320,60%,68%)]';
			case 'void-theme':
				return 'from-[hsl(270,45%,48%)] to-[hsl(255,40%,50%)]';
			case 'copper-theme':
				return 'from-[hsl(20,82%,50%)] to-[hsl(10,75%,55%)]';
			case 'hacker-theme':
				return 'from-[hsl(120,100%,40%)] to-[hsl(140,100%,38%)]';
			case 'dusk-theme':
				return 'from-[hsl(28,92%,58%)] to-[hsl(280,65%,58%)]';
			default:
				return 'from-primary to-extra';
		}
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				if (variant === 'dropdown' || variant === 'icon') setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [variant]);

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
				<div className={`absolute inset-0 bg-gradient-to-br ${getThemeColors(themeOption.id)}`} />
				<div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
				<div className="relative h-full p-3 flex flex-col justify-between">
					<div className="flex justify-between items-start">
						{isActive && (
							<div className="bg-white/30 backdrop-blur-md rounded-full p-1 animate-in zoom-in-50 duration-200">
								<Check className="h-3 w-3 text-white" />
							</div>
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

	// Inline variant — no overlay, just a toggle button + collapsible grid
	if (variant === 'inline') {
		return (
			<div className="w-full">
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
					aria-label="Change theme"
				>
					<span className="text-sm font-semibold text-foreground">Theme</span>
					<div className="flex items-center gap-2">
						{mounted && (
							<span className="text-xs text-muted-foreground capitalize">
								{themes.find((t) => t.id === theme)?.label ?? theme}
							</span>
						)}
						<PaletteIcon
							className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
						/>
					</div>
				</button>
				<div
					className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'}`}
				>
					<div className="overflow-hidden">
						<div className="grid grid-cols-2 gap-2 pb-1">
							{themes.map((t) => (
								<ThemeButton key={t.id} themeOption={t} />
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

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

			{isOpen &&
				(variant === 'sheet' ? (
					<>
						{/* Mobile Backdrop */}
						<div
							className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998] animate-in fade-in-0 duration-200"
							onClick={() => setIsOpen(false)}
							style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
						/>
						{/* Mobile Sheet */}
						<div className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/98 backdrop-blur-3xl rounded-t-[32px] overflow-hidden border-t border-white/10 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.6)] max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
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
								<div className="h-8 md:h-0" />
							</div>
						</div>
					</>
				) : (
					/* Desktop Dropdown */
					<div className="absolute right-0 mt-4 p-1 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-background/95 backdrop-blur-3xl border border-white/10 w-[360px] z-[100] overflow-hidden ring-1 ring-black/5 origin-top-right animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
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
					</div>
				))}
		</div>
	);
};

export default ThemeSelector;
