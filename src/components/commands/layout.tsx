'use client';

import type React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
	Search,
	ChevronDown,
	Menu,
	X,
	Filter,
	Command,
	Zap,
	ArrowRight,
	LayoutGrid,
	List,
	Sparkles,
	BookOpen,
	Terminal,
	Shield,
	Rocket,
	Code2,
	Info,
	ChevronRight,
	HelpCircle,
	Copy,
	Check,
	MousePointer2,
	Globe,
	Settings as SettingsIcon,
	MessagesSquare,
	ShieldAlert,
	Wrench
} from 'lucide-react';
import {
	motion,
	AnimatePresence,
	useScroll,
	useTransform,
	useInView,
	useSpring,
	useMotionValue
} from '@/components/ui/motion';
import { useQuery } from '@tanstack/react-query';
import { botStateOptions } from '@/lib/api';
import { ApiCreateCommandOption } from '@/types/api/bindings/ApiCreateCommandOption';
import { TwState } from '@/types/api/bindings/TwState';
import { ApiCreateCommand } from '@/types/api/bindings/ApiCreateCommand';
import { useDebouncedSearch, useThrottledMouseMove } from '@/lib/pacer';

const useMousePosition = () => {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useThrottledMouseMove((e: MouseEvent) => {
		mouseX.set(e.clientX);
		mouseY.set(e.clientY);
	}, 16); // ~60fps throttling

	return { mouseX, mouseY };
};

const CommandBadge = ({
	children,
	variant = 'default',
	className = ''
}: {
	children: React.ReactNode;
	variant?: 'default' | 'primary' | 'secondary' | 'required' | 'optional' | 'success' | 'module';
	className?: string;
}) => {
	const variants = {
		default: 'bg-white/5 text-foreground/70 border-white/10',
		primary: 'bg-primary/20 text-primary border-primary/30',
		secondary: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
		required: 'bg-red-500/15 text-red-400 border-red-500/20',
		optional: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
		success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
		module: 'bg-white/10 text-foreground border-white/20 font-bold'
	};

	return (
		<span
			className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${variants[variant]} ${className}`}
		>
			{children}
		</span>
	);
};

const CopyButton = ({ text }: { text: string }) => {
	const [copied, setCopied] = useState(false);
	const onCopy = async () => {
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(text);
			} else {
				// Fallback for non-secure contexts or older browsers
				const textArea = document.createElement('textarea');
				textArea.value = text;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
			}
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy text:', err);
		}
	};

	return (
		<button
			onClick={(e) => {
				e.stopPropagation();
				onCopy();
			}}
			className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary active:scale-90"
		>
			{copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
		</button>
	);
};

const ModuleIcon = ({ name, size = 18 }: { name: string; size?: number }) => {
	const n = name.toLowerCase();
	if (n.includes('security') || n.includes('defend')) return <Shield size={size} />;
	if (n.includes('mod') || n.includes('admin')) return <ShieldAlert size={size} />;
	if (n.includes('util') || n.includes('tool')) return <Wrench size={size} />;
	if (n.includes('social') || n.includes('chat')) return <MessagesSquare size={size} />;
	if (n.includes('premium') || n.includes('star')) return <Sparkles size={size} />;
	if (n.includes('config') || n.includes('setting')) return <SettingsIcon size={size} />;
	return <Terminal size={size} />;
};

export default function CommandInterface() {
	const [selectedModule, setSelectedModule] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const debouncedSearchQuery = useDebouncedSearch(searchQuery, 300);
	const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const { mouseX, mouseY } = useMousePosition();

	const { data: botState, isLoading, error } = useQuery(botStateOptions);

	useEffect(() => {
		setIsMounted(true);

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setSearchQuery('');
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll();
	const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

	const allCommands = useMemo(() => {
		const actualBotState = (botState as any)?.data || botState;
		if (!actualBotState || !actualBotState.commands || !Array.isArray(actualBotState.commands)) {
			console.warn('[Commands] Bot state invalid:', { actualBotState, botState });
			return [];
		}
		let idCounter = 0;
		const commands: any[] = [];
		actualBotState.commands.forEach((cmd: ApiCreateCommand) => {
			const extract = (options: any[] = []) => {
				const sub: any[] = [];
				const args: any[] = [];
				options.forEach((o) => {
					if (!o) return;
					if (o.type === 1 || o.type === 2) sub.push(o);
					else args.push(o);
				});
				return { sub, args };
			};

			const { sub, args } = extract(cmd.options);
			commands.push({
				...cmd,
				moduleName: cmd.name,
				id: `cmd-${idCounter++}`,
				subcommands: sub,
				arguments: args.map((a) => ({ ...a, required: a.required ?? false }))
			});

			sub.forEach((sc) => {
				const { sub: sSub, args: sArgs } = extract(sc.options);
				commands.push({
					...sc,
					moduleName: cmd.name,
					id: `cmd-${idCounter++}`,
					parentName: cmd.name,
					subcommands: sSub,
					arguments: sArgs.map((a) => ({ ...a, required: a.required ?? false }))
				});
			});
		});
		return commands;
	}, [botState]);

	const filteredCommands = useMemo(() => {
		const searchTerm = typeof debouncedSearchQuery === 'string' ? debouncedSearchQuery.toLowerCase() : String(debouncedSearchQuery || '').toLowerCase();
		return allCommands.filter((cmd: any) => {
			const matchesSearch = searchTerm
				? (cmd.name?.toLowerCase().includes(searchTerm) ?? false) ||
				  (cmd.description?.toLowerCase().includes(searchTerm) ?? false)
				: true;
			const matchesModule = selectedModule === 'all' || cmd.moduleName === selectedModule;
			return matchesSearch && matchesModule;
		});
	}, [allCommands, debouncedSearchQuery, selectedModule]);

	const modules = useMemo((): string[] => {
		const actualBotState = (botState as any)?.data || botState;
		if (!actualBotState || !actualBotState.commands || !Array.isArray(actualBotState.commands))
			return [];
		return Array.from(
			new Set(actualBotState.commands.map((c: any) => c.name).filter((n: any): n is string => !!n))
		);
	}, [botState]);

	const actualBotState = useMemo(() => (botState as any)?.data || botState, [botState]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="relative w-24 h-24">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
						className="absolute inset-0 rounded-full border-t-2 border-primary border-r-transparent border-b-transparent border-l-transparent"
					/>
					<motion.div
						animate={{ rotate: -360 }}
						transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
						className="absolute inset-2 rounded-full border-b-2 border-accent/50 border-t-transparent border-r-transparent border-l-transparent"
					/>
					<div className="absolute inset-0 flex items-center justify-center">
						<Terminal className="text-primary animate-pulse" size={24} />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<ShieldAlert size={64} className="text-destructive mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-2">Failed to load commands</h2>
					<p className="text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
				</div>
			</div>
		);
	}

	if (!actualBotState || !actualBotState.commands || actualBotState.commands.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Terminal size={64} className="text-muted-foreground mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-2">No commands available</h2>
					<p className="text-muted-foreground">Commands data is not available at this time.</p>
				</div>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="min-h-screen text-foreground font-inter">
			{/* Hero Section */}
			<section className="relative pt-32 pb-20 px-6 lg:pt-56 lg:pb-32 overflow-hidden z-10">
				<div className="max-w-7xl mx-auto flex flex-col items-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						className="relative"
					>
						<h1 className="text-[12vw] lg:text-[10rem] font-black font-monster leading-[0.8] tracking-tighter text-center uppercase">
							<span className="relative block italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
								Command
							</span>
							<span className="relative block text-primary drop-shadow-[0_0_50px_rgba(var(--primary),0.5)]">
								Arsenal
							</span>
						</h1>
						<div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-primary/40">
							<div className="h-px w-24 bg-gradient-to-r from-transparent to-primary" />
							<Terminal size={32} strokeWidth={3} />
							<div className="h-px w-24 bg-gradient-to-l from-transparent to-primary" />
						</div>
					</motion.div>

					{/* Digital Search Bar */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.3 }}
						className="w-full max-w-3xl mt-16 group relative"
					>
						<div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-20 blur-xl group-focus-within:opacity-100 transition-opacity" />
						<div className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 flex items-center">
							<div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-focus-within:rotate-12">
								<Search size={24} />
							</div>
							<input
								type="text"
								placeholder="Querying command definitions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold px-6 placeholder:text-foreground/20"
							/>
							<div className="hidden lg:flex items-center gap-2 px-6 border-l border-white/10 ml-4">
								<kbd className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-black">ESC</kbd>
								<span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 text-nowrap">
									to clear
								</span>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Command Browsing Hub */}
			<section className="relative max-w-7xl mx-auto px-6 pb-40 z-10 focus:outline-none">
				<div className="flex flex-col lg:flex-row gap-12">
					{/* Holographic Nav Drawer */}
					<aside className="lg:w-80 shrink-0">
						<div className="sticky top-32 space-y-12">
							<div>
								<div className="flex items-center justify-between mb-8 pl-4">
									<h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/30">
										System Modules
									</h3>
									<div className="h-[2px] w-12 bg-primary/50" />
								</div>

								<div className="space-y-2">
									<button
										onClick={() => setSelectedModule('all')}
										className={`w-full group relative flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${selectedModule === 'all' ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'hover:bg-white/5 text-foreground/50'}`}
									>
										<div className="flex items-center gap-4">
											<Globe
												size={20}
												className={
													selectedModule === 'all'
														? 'text-white'
														: 'text-primary group-hover:scale-125 transition-transform'
												}
											/>
											<span className="font-monster font-black text-sm uppercase italic">
												Global Central
											</span>
										</div>
										<ChevronRight
											size={16}
											className={
												selectedModule === 'all'
													? 'opacity-100'
													: 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all'
											}
										/>
									</button>
									{modules.map((mod) => (
										<button
											key={mod}
											onClick={() => setSelectedModule(mod)}
											className={`w-full group relative flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${selectedModule === mod ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'hover:bg-white/5 text-foreground/50'}`}
										>
											<div className="flex items-center gap-4">
												<ModuleIcon name={mod} size={20} />
												<span className="font-monster font-black text-sm uppercase">{mod}</span>
											</div>
											<ChevronRight
												size={16}
												className={
													selectedModule === mod
														? 'opacity-100'
														: 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all'
												}
											/>
										</button>
									))}
								</div>
							</div>
						</div>
					</aside>

					{/* Command Interface */}
					<div className="flex-1">
						{/* View Controls */}
						<div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-8 mb-16">
							<div>
								<div className="flex items-center gap-3 mb-2">
									<Terminal size={24} className="text-primary" />
									<h2 className="text-4xl font-black font-monster tracking-tighter uppercase italic">
										{selectedModule === 'all' ? 'The Registry' : `${selectedModule} Unit`}
									</h2>
								</div>
								<p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.2em]">
									Showing {filteredCommands.length} commands & sub-commands.
								</p>
							</div>

							<div className="flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl">
								<button
									onClick={() => setActiveView('grid')}
									className={`p-3 rounded-xl transition-all ${activeView === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-foreground/30 hover:text-foreground/70'}`}
								>
									<LayoutGrid size={20} />
								</button>
								<button
									onClick={() => setActiveView('list')}
									className={`p-3 rounded-xl transition-all ${activeView === 'list' ? 'bg-primary text-white shadow-lg' : 'text-foreground/30 hover:text-foreground/70'}`}
								>
									<List size={20} />
								</button>
							</div>
						</div>

						{/* Dynamic Command */}
						<AnimatePresence mode="popLayout">
							{filteredCommands.length > 0 ? (
								<motion.div
									layout
									className={
										activeView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-4'
									}
								>
									{filteredCommands.map((command, idx) => (
										<HolographicCard
											key={command.id}
											command={command}
											view={activeView}
											index={idx}
										/>
									))}
								</motion.div>
							) : (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem]"
								>
									<ShieldAlert size={64} className="text-primary/20 mb-8" />
									<p className="text-sm text-foreground/40 mt-4 uppercase tracking-[0.1em]">
										No commands found for your query
									</p>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</section>
		</div>
	);
}

// --- Specific  Card Components ---

const HolographicCard = ({ command, view, index }: any) => {
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(cardRef as any, { margin: '-10%' } as any);

	return (
		<motion.div
			ref={cardRef}
			layout
			initial={{ opacity: 0, scale: 0.95, y: 20 }}
			animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
			transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
			className={`
				group relative overflow-hidden transition-all duration-500
				${
					view === 'grid'
						? 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl border border-white/10 rounded-[2.5rem] hover:border-primary/40'
						: 'bg-white/[0.02] border border-white/5 rounded-2xl hover:border-primary/20'
				}
			`}
		>
			<div
				className={`p-8 ${view === 'list' ? 'flex flex-col md:flex-row md:items-center gap-8' : ''}`}
			>
				{/* Top  Line */}
				<div className="absolute top-0 right-12 w-16 h-[2px] bg-primary/20 group-hover:w-24 group-hover:bg-primary/60 transition-all" />

				<div className={view === 'list' ? 'flex-1' : ''}>
					<div className="flex items-start justify-between mb-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:border-primary/50 transition-all shadow-inner">
								<ModuleIcon name={command.moduleName} size={24} />
							</div>
							<div>
								<h3 className="text-2xl font-black font-monster tracking-tighter italic uppercase group-hover:text-primary transition-colors">
									/{command.name}
								</h3>
								{command.parentName && (
									<span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
										Group: {command.parentName}
									</span>
								)}
							</div>
						</div>
						<div className="flex gap-2">
							<CopyButton text={`/${command.name}`} />
						</div>
					</div>

					<p className="text-muted-foreground leading-relaxed text-sm mb-8 line-clamp-2 italic">
						{command.description ||
							'The documentation for this subroutine has not been synthesized yet.'}
					</p>
				</div>

				<div
					className={`${view === 'list' ? 'md:w-72 flex flex-col items-end gap-4' : 'flex items-center justify-between border-t border-white/5 pt-8 mt-auto'}`}
				>
					<div className="flex flex-wrap gap-2">
						{command.arguments?.length > 0 && (
							<CommandBadge variant="optional">{command.arguments.length} INPUTS</CommandBadge>
						)}
						{command.subcommands?.length > 0 && (
							<CommandBadge variant="primary">{command.subcommands.length} SUBS</CommandBadge>
						)}
					</div>

					<button
						onClick={() => setIsDetailOpen(!isDetailOpen)}
						className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 hover:text-primary transition-all group/expand"
					>
						{isDetailOpen ? 'Collapse BIOS' : 'Analyze Logic'}
						<div
							className={`w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center transition-transform duration-500 ${isDetailOpen ? 'rotate-180 bg-primary/10 border-primary' : 'group-hover:bg-primary/10'}`}
						>
							<ChevronDown size={14} className="text-primary" />
						</div>
					</button>
				</div>

				<AnimatePresence>
					{isDetailOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
							className="overflow-hidden"
						>
							<div className="pt-12 space-y-12 pb-4">
								{/* Arg Section */}
								{command.arguments?.length > 0 && (
									<div>
										<div className="flex items-center gap-3 mb-6">
											<div className="h-[1px] flex-1 bg-white/5" />
											<h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">
												Parameter Matrix
											</h4>
											<div className="h-[1px] flex-1 bg-white/5" />
										</div>
										<div className="grid grid-cols-1 gap-4">
											{command.arguments.map((arg: any) => (
												<div
													key={arg.name}
													className="group/arg p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
												>
													<div className="flex items-center justify-between mb-3">
														<div className="flex items-center gap-3">
															<code className="text-sm font-black text-primary font-mono">
																{arg.name}
															</code>
															{arg.required ? (
																<CommandBadge variant="required" className="!px-1.5 !py-0">
																	REQ
																</CommandBadge>
															) : (
																<CommandBadge
																	variant="optional"
																	className="!px-1.5 !py-0 text-[8px]"
																>
																	OPT
																</CommandBadge>
															)}
														</div>
														<CopyButton text={arg.name} />
													</div>
													<p className="text-xs text-muted-foreground leading-relaxed">
														{arg.description}
													</p>
													{arg.choices?.length > 0 && (
														<div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
															<span className="text-[8px] font-black text-foreground/30 uppercase mr-2 mt-1">
																Options:
															</span>
															{arg.choices.map((c: string) => (
																<span
																	key={c}
																	className="px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] text-primary/70 font-mono"
																>
																	{c}
																</span>
															))}
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{/* Subs Section */}
								{command.subcommands?.length > 0 && (
									<div>
										<div className="flex items-center gap-3 mb-6">
											<div className="h-[1px] flex-1 bg-white/5" />
											<h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">
												Linked Subroutines
											</h4>
											<div className="h-[1px] flex-1 bg-white/5" />
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											{command.subcommands.map((sub: any) => (
												<div
													key={sub.name}
													className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/sub"
												>
													<div className="flex items-center justify-between mb-2">
														<div className="flex items-center gap-2">
															<div className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-125 transition-transform" />
															<span className="font-monster font-black text-xs uppercase group-hover:text-accent transition-colors">
																{sub.name}
															</span>
														</div>
														<CopyButton text={`${command.name} ${sub.name}`} />
													</div>
													<p className="text-[10px] text-muted-foreground leading-relaxed">
														{sub.description}
													</p>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Terminal Widget */}
								<div className="p-6 rounded-[2rem] bg-black border border-white/5 flex items-center justify-between gap-4 group/sim relative overflow-hidden">
									<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/sim:opacity-100 transition-opacity" />
									<div className="flex items-center gap-4 relative z-10">
										<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/sim:border-primary/30 transition-colors">
											<Terminal size={18} className="text-primary" />
										</div>
										<div className="font-mono text-sm flex items-center gap-2">
											<span className="text-primary font-bold">/</span>
											<span className="text-white font-bold">{command.name}</span>
											<span className="text-foreground/20 italic">
												{command.arguments && command.arguments.length > 0
													? ` [${command.arguments[0].name}]`
													: ''}
											</span>
											<motion.div
												animate={{ opacity: 1 }}
												initial={{ opacity: 0 }}
												transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
												className="w-1.5 h-4 bg-primary/50"
											/>
										</div>
									</div>
									<CopyButton text={`/${command.name}`} />
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Decorative Corner */}
			<div className="absolute top-4 right-4 text-foreground/5 pointer-events-none select-none">
				<Command size={120} />
			</div>
		</motion.div>
	);
};
