'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { getBotState } from '@/lib/api';
import useSWR from 'swr';
import {
	Search,
	Copy,
	Check,
	ChevronDown,
	Grid3X3,
	List,
	Shield,
	Settings,
	MessageSquare,
	Users,
	Lock,
	Zap,
	Bell,
	Globe
} from 'lucide-react';

// Animation variants
const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }
	}
};

// Badge component
const Badge = ({
	children,
	variant = 'default'
}: {
	children: React.ReactNode;
	variant?: 'default' | 'required' | 'optional' | 'primary';
}) => {
	const variants = {
		default: 'bg-muted text-muted-foreground',
		required: 'bg-red-500/10 text-red-500 border-red-500/20',
		optional: 'bg-muted text-muted-foreground',
		primary: 'bg-primary/10 text-primary'
	};

	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-transparent ${variants[variant]}`}
		>
			{children}
		</span>
	);
};

// Copy button component
const CopyButton = ({ text }: { text: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			console.error('Failed to copy');
		}
	};

	return (
		<button
			onClick={handleCopy}
			className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
			aria-label={copied ? 'Copied' : 'Copy to clipboard'}
		>
			{copied ? <Check size={14} /> : <Copy size={14} />}
		</button>
	);
};

// Module icon component
const ModuleIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
	const icons: Record<string, React.ReactNode> = {
		moderation: <Shield size={size} />,
		settings: <Settings size={size} />,
		messages: <MessageSquare size={size} />,
		members: <Users size={size} />,
		permissions: <Lock size={size} />,
		automation: <Zap size={size} />,
		notifications: <Bell size={size} />
	};

	return (
		<span className="text-primary">{icons[name?.toLowerCase()] || <Globe size={size} />}</span>
	);
};

// Main component
export default function CommandInterface() {
	const { data: botState, isLoading } = useSWR('bot-state', getBotState, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});

	const [selectedModule, setSelectedModule] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');

	// Process commands
	const allCommands = useMemo(() => {
		if (!botState) return [];
		let idCounter = 0;
		const commands: any[] = [];

		const extract = (opts: any[] = []) => {
			const sub: any[] = [];
			const args: any[] = [];
			opts.forEach((o) => {
				if (o.type === 1 || o.type === 2) sub.push(o);
				else args.push(o);
			});
			return { sub, args };
		};

		botState.commands.forEach((cmd: any) => {
			const { sub, args } = extract(cmd.options);

			if (sub.length === 0) {
				commands.push({
					...cmd,
					moduleName: cmd.name,
					id: `cmd-${idCounter++}`,
					arguments: args.map((a) => ({ ...a, required: a.required ?? false }))
				});
			}

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
		return allCommands.filter((cmd: any) => {
			const matchesSearch =
				(cmd.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
				(cmd.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
			const matchesModule = selectedModule === 'all' || cmd.moduleName === selectedModule;
			return matchesSearch && matchesModule;
		});
	}, [allCommands, searchQuery, selectedModule]);

	const modules = useMemo(() => {
		if (!botState) return [];
		return Array.from(
			new Set(botState.commands.map((c: any) => c.name).filter((n: any): n is string => !!n))
		);
	}, [botState]);

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
					<p className="text-sm text-muted-foreground">Loading commands...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="pt-32 pb-16 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<motion.p
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						className="text-sm font-medium text-primary mb-4"
					>
						Documentation
					</motion.p>
					<motion.h1
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.1 }}
						className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
					>
						Commands
					</motion.h1>
					<motion.p
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.2 }}
						className="text-lg text-muted-foreground max-w-2xl mx-auto"
					>
						Explore all available commands to configure and manage AntiRaid for your server.
					</motion.p>

					{/* Search */}
					<motion.div
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.3 }}
						className="mt-10 max-w-xl mx-auto"
					>
						<div className="relative">
							<Search
								size={18}
								className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<input
								type="text"
								placeholder="Search commands..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
							/>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Content */}
			<section className="max-w-6xl mx-auto px-6 pb-24">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Sidebar */}
					<aside className="lg:w-64 shrink-0">
						<div className="lg:sticky lg:top-24">
							<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-3">
								Modules
							</h3>
							<nav className="space-y-1">
								<button
									onClick={() => setSelectedModule('all')}
									className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
										selectedModule === 'all'
											? 'bg-primary text-primary-foreground'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted'
									}`}
								>
									<Globe size={18} />
									All Commands
								</button>
								{modules.map((mod) => (
									<button
										key={mod}
										onClick={() => setSelectedModule(mod)}
										className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
											selectedModule === mod
												? 'bg-primary text-primary-foreground'
												: 'text-muted-foreground hover:text-foreground hover:bg-muted'
										}`}
									>
										<ModuleIcon name={mod} size={18} />
										{mod}
									</button>
								))}
							</nav>
						</div>
					</aside>

					{/* Main content */}
					<div className="flex-1 min-w-0">
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<p className="text-sm text-muted-foreground">
								{filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
							</p>
							<div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
								<button
									onClick={() => setActiveView('grid')}
									className={`p-2 rounded-md transition-colors ${
										activeView === 'grid'
											? 'bg-background text-foreground shadow-sm'
											: 'text-muted-foreground hover:text-foreground'
									}`}
									aria-label="Grid view"
								>
									<Grid3X3 size={16} />
								</button>
								<button
									onClick={() => setActiveView('list')}
									className={`p-2 rounded-md transition-colors ${
										activeView === 'list'
											? 'bg-background text-foreground shadow-sm'
											: 'text-muted-foreground hover:text-foreground'
									}`}
									aria-label="List view"
								>
									<List size={16} />
								</button>
							</div>
						</div>

						{/* Commands */}
						<AnimatePresence mode="popLayout">
							{filteredCommands.length > 0 ? (
								<motion.div
									layout
									className={
										activeView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'
									}
								>
									{filteredCommands.map((command, idx) => (
										<CommandCard key={command.id} command={command} view={activeView} index={idx} />
									))}
								</motion.div>
							) : (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl"
								>
									<Search size={32} className="text-muted-foreground/50 mb-4" />
									<p className="text-muted-foreground">No commands found</p>
									<p className="text-sm text-muted-foreground/70 mt-1">
										Try adjusting your search or filter
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

// Command card component
const CommandCard = ({
	command,
	view,
	index
}: {
	command: any;
	view: 'grid' | 'list';
	index: number;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const cardRef = useRef(null);
	const isInView = useInView(cardRef, { once: true, margin: '-50px' });

	return (
		<motion.div
			ref={cardRef}
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.3, delay: (index % 8) * 0.03 }}
			className={`group bg-card border border-border rounded-xl transition-colors hover:border-primary/30 ${
				view === 'list' ? '' : ''
			}`}
		>
			<div className={`p-5 ${view === 'list' ? 'flex items-start gap-4' : ''}`}>
				<div className={view === 'list' ? 'flex-1 min-w-0' : ''}>
					{/* Header */}
					<div className="flex items-start justify-between gap-3 mb-3">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
								<ModuleIcon name={command.moduleName} size={18} />
							</div>
							<div>
								<h3 className="font-semibold text-foreground">/{command.name}</h3>
								{command.parentName && (
									<p className="text-xs text-muted-foreground">in /{command.parentName}</p>
								)}
							</div>
						</div>
						<CopyButton text={`/${command.name}`} />
					</div>

					{/* Description */}
					<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
						{command.description || 'No description available.'}
					</p>

					{/* Badges */}
					<div className="flex flex-wrap items-center gap-2">
						{command.arguments?.length > 0 && (
							<Badge variant="optional">
								{command.arguments.length} argument{command.arguments.length !== 1 ? 's' : ''}
							</Badge>
						)}
						{command.subcommands?.length > 0 && (
							<Badge variant="primary">
								{command.subcommands.length} subcommand{command.subcommands.length !== 1 ? 's' : ''}
							</Badge>
						)}
					</div>
				</div>

				{/* Expand button */}
				{(command.arguments?.length > 0 || command.subcommands?.length > 0) && (
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<span>{isOpen ? 'Hide details' : 'Show details'}</span>
						<ChevronDown
							size={16}
							className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
						/>
					</button>
				)}
			</div>

			{/* Expanded content */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const }}
						className="overflow-hidden"
					>
						<div className="px-5 pb-5 pt-2 space-y-6 border-t border-border">
							{/* Arguments */}
							{command.arguments?.length > 0 && (
								<div>
									<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
										Arguments
									</h4>
									<div className="space-y-2">
										{command.arguments.map((arg: any) => (
											<div key={arg.name} className="p-3 bg-muted/50 rounded-lg">
												<div className="flex items-center justify-between mb-1">
													<div className="flex items-center gap-2">
														<code className="text-sm font-mono font-medium text-primary">
															{arg.name}
														</code>
														{arg.required ? (
															<Badge variant="required">Required</Badge>
														) : (
															<Badge variant="optional">Optional</Badge>
														)}
													</div>
													<CopyButton text={arg.name} />
												</div>
												{arg.description && (
													<p className="text-xs text-muted-foreground">{arg.description}</p>
												)}
												{arg.choices?.length > 0 && (
													<div className="mt-2 flex flex-wrap gap-1">
														{arg.choices.map((c: string) => (
															<span
																key={c}
																className="px-2 py-0.5 bg-background rounded text-xs font-mono text-muted-foreground"
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

							{/* Subcommands */}
							{command.subcommands?.length > 0 && (
								<div>
									<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
										Subcommands
									</h4>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{command.subcommands.map((sub: any) => (
											<div key={sub.name} className="p-3 bg-muted/50 rounded-lg">
												<div className="flex items-center justify-between mb-1">
													<span className="text-sm font-medium">{sub.name}</span>
													<CopyButton text={`${command.name} ${sub.name}`} />
												</div>
												{sub.description && (
													<p className="text-xs text-muted-foreground line-clamp-2">
														{sub.description}
													</p>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Usage example */}
							<div className="p-3 bg-muted rounded-lg flex items-center justify-between">
								<code className="text-sm font-mono">
									<span className="text-primary">/</span>
									<span>{command.name}</span>
									{command.arguments?.[0] && (
										<span className="text-muted-foreground"> [{command.arguments[0].name}]</span>
									)}
								</code>
								<CopyButton text={`/${command.name}`} />
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
