'use client';

import { useState, useMemo } from 'react';
import { getBotState } from '@/lib/api';
import useSWR from 'swr';
import {
	Search,
	Copy,
	Check,
	ChevronRight,
	Shield,
	Settings,
	MessageSquare,
	Users,
	Lock,
	Zap,
	Bell,
	Globe,
	Terminal,
	Hash
} from 'lucide-react';

// ─── Module config ────────────────────────────────────────────────────────────

type ModuleMeta = {
	icon: React.ElementType;
	color: string;
	bg: string;
};

const MODULE_META: Record<string, ModuleMeta> = {
	moderation: { icon: Shield, color: 'text-rose-400', bg: 'bg-rose-400/10' },
	settings: { icon: Settings, color: 'text-sky-400', bg: 'bg-sky-400/10' },
	messages: { icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-400/10' },
	members: { icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
	permissions: { icon: Lock, color: 'text-violet-400', bg: 'bg-violet-400/10' },
	automation: { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10' },
	notifications: { icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-400/10' }
};

const DEFAULT_META: ModuleMeta = { icon: Globe, color: 'text-primary', bg: 'bg-primary/10' };

function getModuleMeta(name: string): ModuleMeta {
	return MODULE_META[name?.toLowerCase()] ?? DEFAULT_META;
}

// ─── Copy button ──────────────────────────────────────────────────────────────

const CopyButton = ({ text, small }: { text: string; small?: boolean }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	};

	const sz = small ? 12 : 14;

	return (
		<button
			onClick={(e) => {
				e.stopPropagation();
				handleCopy();
			}}
			className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
			aria-label={copied ? 'Copied' : 'Copy'}
		>
			{copied ? <Check size={sz} /> : <Copy size={sz} />}
		</button>
	);
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CommandInterface() {
	const { data: botState, isLoading } = useSWR('bot-state', getBotState, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});

	const [selectedModule, setSelectedModule] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');

	const allCommands = useMemo(() => {
		if (!botState) return [];
		let id = 0;
		const commands: any[] = [];

		const extract = (opts: any[] = []) => {
			const sub: any[] = [],
				args: any[] = [];
			opts.forEach((o) => (o.type === 1 || o.type === 2 ? sub : args).push(o));
			return { sub, args };
		};

		botState.commands.forEach((cmd: any) => {
			const { sub, args } = extract(cmd.options);
			if (sub.length === 0) {
				commands.push({
					...cmd,
					moduleName: cmd.name,
					id: `cmd-${id++}`,
					arguments: args.map((a) => ({ ...a, required: a.required ?? false }))
				});
			}
			sub.forEach((sc) => {
				const { sub: sSub, args: sArgs } = extract(sc.options);
				commands.push({
					...sc,
					moduleName: cmd.name,
					id: `cmd-${id++}`,
					parentName: cmd.name,
					subcommands: sSub,
					arguments: sArgs.map((a) => ({ ...a, required: a.required ?? false }))
				});
			});
		});

		return commands;
	}, [botState]);

	const filteredCommands = useMemo(
		() =>
			allCommands.filter((cmd: any) => {
				const q = searchQuery.toLowerCase();
				const matchesSearch =
					cmd.name?.toLowerCase().includes(q) || cmd.description?.toLowerCase().includes(q);
				return matchesSearch && (selectedModule === 'all' || cmd.moduleName === selectedModule);
			}),
		[allCommands, searchQuery, selectedModule]
	);

	const modules = useMemo(() => {
		if (!botState) return [];
		return Array.from(
			new Set(botState.commands.map((c: any) => c.name).filter(Boolean))
		) as string[];
	}, [botState]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Header */}
			<div className="pt-8 pb-10 border-b border-border">
				<div className="max-w-5xl mx-auto">
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-400">
						<div>
							<h1 className="text-3xl font-bold text-foreground tracking-tight">Commands</h1>
							<p className="text-sm text-muted-foreground mt-1">
								{allCommands.length} commands across {modules.length} modules
							</p>
						</div>

						<div className="relative sm:w-72">
							<Search
								size={15}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<input
								type="text"
								placeholder="Search..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
							/>
						</div>
					</div>

					{/* Module filter */}
					<div className="flex items-center gap-2 flex-wrap animate-in fade-in-0 duration-400 delay-100">
						<FilterPill
							active={selectedModule === 'all'}
							onClick={() => setSelectedModule('all')}
							icon={<Hash size={13} />}
							label="All"
							count={allCommands.length}
						/>
						{modules.map((mod) => {
							const meta = getModuleMeta(mod);
							const Icon = meta.icon;
							return (
								<FilterPill
									key={mod}
									active={selectedModule === mod}
									onClick={() => setSelectedModule(mod)}
									icon={<Icon size={13} />}
									label={mod}
									count={allCommands.filter((c: any) => c.moduleName === mod).length}
									colorClass={selectedModule === mod ? meta.color : undefined}
									bgClass={selectedModule === mod ? meta.bg : undefined}
								/>
							);
						})}
					</div>
				</div>
			</div>

			{/* List */}
			<div className="max-w-5xl mx-auto py-8 pb-24">
				{filteredCommands.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<Terminal size={32} className="text-muted-foreground/30 mb-3" />
						<p className="text-muted-foreground text-sm">No commands match your search</p>
					</div>
				) : (
					<div className="space-y-1.5">
						{filteredCommands.map((command, idx) => (
							<CommandRow key={command.id} command={command} index={idx} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

const FilterPill = ({
	active,
	onClick,
	icon,
	label,
	count,
	colorClass,
	bgClass
}: {
	active: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	count: number;
	colorClass?: string;
	bgClass?: string;
}) => (
	<button
		onClick={onClick}
		className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${
			active
				? `${bgClass ?? 'bg-primary/10'} ${colorClass ?? 'text-primary'} border-transparent`
				: 'border-border text-muted-foreground hover:text-foreground hover:border-border/80 bg-transparent'
		}`}
	>
		{icon}
		{label}
		<span className={`tabular-nums ${active ? 'opacity-70' : 'opacity-50'}`}>{count}</span>
	</button>
);

// ─── Command row ──────────────────────────────────────────────────────────────

const CommandRow = ({ command, index }: { command: any; index: number }) => {
	const [open, setOpen] = useState(false);
	const meta = getModuleMeta(command.moduleName);
	const Icon = meta.icon;
	const hasDetails = command.arguments?.length > 0 || command.subcommands?.length > 0;

	// Build usage string
	const usageArgs = (command.arguments ?? [])
		.map((a: any) => (a.required ? `<${a.name}>` : `[${a.name}]`))
		.join(' ');
	const usage = `/${command.parentName ? `${command.parentName} ` : ''}${command.name}${usageArgs ? ' ' + usageArgs : ''}`;

	return (
		<div
			className="animate-in fade-in-0 slide-in-from-bottom-2"
			style={{ animationDuration: '200ms', animationDelay: `${Math.min(index * 15, 300)}ms` }}
		>
			<div
				onClick={() => hasDetails && setOpen(!open)}
				className={`group flex items-start gap-4 px-4 py-4 rounded-xl border transition-all duration-150 ${
					open
						? 'bg-card border-border rounded-b-none'
						: `border-transparent hover:bg-card hover:border-border ${hasDetails ? 'cursor-pointer' : ''}`
				}`}
			>
				{/* Module icon */}
				<div
					className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}
				>
					<Icon size={15} className={meta.color} />
				</div>

				{/* Name + description */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1 flex-wrap">
						<code className="text-sm font-semibold text-foreground font-mono tracking-tight">
							{usage}
						</code>
						{command.parentName && (
							<span className="text-[11px] text-muted-foreground/60 font-sans">
								{command.parentName}
							</span>
						)}
					</div>
					<p className="text-sm text-muted-foreground leading-snug">
						{command.description || 'No description available.'}
					</p>

					{/* Inline meta */}
					{(command.arguments?.length > 0 || command.subcommands?.length > 0) && (
						<div className="flex items-center gap-3 mt-2">
							{command.arguments?.length > 0 && (
								<span className="text-xs text-muted-foreground/60">
									{command.arguments.length} argument{command.arguments.length !== 1 ? 's' : ''}
								</span>
							)}
							{command.subcommands?.length > 0 && (
								<span className="text-xs text-muted-foreground/60">
									{command.subcommands.length} subcommand
									{command.subcommands.length !== 1 ? 's' : ''}
								</span>
							)}
						</div>
					)}
				</div>

				{/* Right: copy + expand */}
				<div className="flex items-center gap-2 shrink-0 mt-0.5">
					<span className="opacity-0 group-hover:opacity-100 transition-opacity">
						<CopyButton text={`/${command.name}`} />
					</span>
					{hasDetails && (
						<ChevronRight
							size={15}
							className={`text-muted-foreground/50 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
						/>
					)}
				</div>
			</div>

			{/* Expanded panel — CSS grid accordion */}
			<div
				className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
			>
				<div className="overflow-hidden">
					<div className="bg-card border border-t-0 border-border rounded-b-xl px-4 pb-4">
						<div className="grid sm:grid-cols-2 gap-4 pt-4">
							{/* Arguments */}
							{command.arguments?.length > 0 && (
								<div>
									<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
										Arguments
									</p>
									<div className="space-y-1">
										{command.arguments.map((arg: any) => (
											<ArgRow key={arg.name} arg={arg} />
										))}
									</div>
								</div>
							)}

							{/* Subcommands */}
							{command.subcommands?.length > 0 && (
								<div>
									<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
										Subcommands
									</p>
									<div className="space-y-1">
										{command.subcommands.map((sub: any) => (
											<SubRow key={sub.name} sub={sub} parent={command.name} />
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// ─── Arg row ──────────────────────────────────────────────────────────────────

const ArgRow = ({ arg }: { arg: any }) => (
	<div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-muted/40 group/arg">
		<div className="min-w-0 flex-1">
			<div className="flex items-center gap-2 flex-wrap">
				<code className="text-xs font-mono font-semibold text-foreground">{arg.name}</code>
				<span
					className={`text-[10px] px-1.5 py-px rounded font-medium ${
						arg.required ? 'bg-rose-500/10 text-rose-400' : 'text-muted-foreground/60'
					}`}
				>
					{arg.required ? 'required' : 'optional'}
				</span>
			</div>
			{arg.description && (
				<p className="text-xs text-muted-foreground mt-0.5 leading-snug">{arg.description}</p>
			)}
			{arg.choices?.length > 0 && (
				<div className="mt-1 flex flex-wrap gap-1">
					{arg.choices.map((c: any) => {
						// Command option choices are objects ({ name, value }); fall back to
						// the raw value if a plain string is ever provided.
						const label = typeof c === 'string' ? c : (c?.name ?? String(c?.value ?? ''));
						const value = typeof c === 'string' ? c : String(c?.value ?? c?.name ?? '');
						return (
							<span
								key={value}
								className="text-[10px] px-1.5 py-px bg-background border border-border rounded font-mono text-muted-foreground"
							>
								{label}
							</span>
						);
					})}
				</div>
			)}
		</div>
		<span className="opacity-0 group-hover/arg:opacity-100 transition-opacity shrink-0 mt-0.5">
			<CopyButton text={arg.name} small />
		</span>
	</div>
);

// ─── Sub row ──────────────────────────────────────────────────────────────────

const SubRow = ({ sub, parent }: { sub: any; parent: string }) => (
	<div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-muted/40 group/sub">
		<div className="min-w-0 flex-1">
			<code className="text-xs font-mono font-semibold text-foreground">
				/{parent} {sub.name}
			</code>
			{sub.description && (
				<p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
					{sub.description}
				</p>
			)}
		</div>
		<span className="opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0 mt-0.5">
			<CopyButton text={`/${parent} ${sub.name}`} small />
		</span>
	</div>
);
