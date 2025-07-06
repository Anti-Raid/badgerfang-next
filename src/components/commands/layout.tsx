'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
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
	List
} from 'lucide-react';
import type { BotState } from '../../types/gosdk/types';
import * as discordgo from '../../types/gosdk/types';
import { getBotState } from '@/lib/api';
import { InputField } from '@/components/settings/components/form-elements';

const Button = ({
	children,
	className = '',
	variant = 'primary',
	size = 'md',
	icon,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
	size?: 'sm' | 'md' | 'lg';
	icon?: React.ReactNode;
}) => {
	const baseStyles =
		'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background';
	const sizeStyles = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-5 py-2.5 text-base'
	};
	const variantStyles = {
		primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
		secondary: 'bg-secondary text-foreground hover:bg-secondary/80 focus:ring-secondary/50',
		ghost: 'bg-transparent hover:bg-secondary/50 focus:ring-secondary/50',
		outline: 'bg-transparent border border-border hover:bg-secondary/50 focus:ring-secondary/50'
	};

	return (
		<button
			className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
			{...props}
		>
			{icon && <span className="mr-2">{icon}</span>}
			{children}
		</button>
	);
};

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	className?: string;
}

const Select: React.FC<SelectProps> = ({
	value,
	onChange,
	options,
	placeholder = 'Select...',
	className = ''
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find((opt) => opt.value === value);

	return (
		<div className={`relative ${className}`}>
			<div
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-between w-full px-3 py-2.5 bg-background text-foreground rounded-lg border border-border cursor-pointer shadow-sm hover:border-primary/50 transition-all duration-200"
			>
				<span className="truncate">{selectedOption?.label || placeholder}</span>
				<ChevronDown
					className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
				/>
			</div>
			{isOpen && (
				<>
					<div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
					<div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden backdrop-blur-sm">
						<div className="max-h-60 overflow-y-auto py-1">
							{options.map((option) => (
								<div
									key={option.value}
									className={`px-3 py-2.5 cursor-pointer transition-colors duration-150 ${
										option.value === value
											? 'bg-primary/10 text-primary'
											: 'hover:bg-secondary text-foreground'
									}`}
									onClick={() => {
										onChange(option.value);
										setIsOpen(false);
									}}
								>
									{option.label}
								</div>
							))}
						</div>
					</div>
				</>
			)}
			I
		</div>
	);
};

const Badge = ({
	children,
	className = '',
	onClick,
	variant = 'default'
}: {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'required' | 'optional';
}) => {
	const variantStyles = {
		default: 'bg-secondary text-foreground',
		primary: 'bg-primary/15 text-primary',
		secondary: 'bg-secondary/70 text-foreground',
		outline: 'bg-transparent border border-border text-foreground',
		required: 'bg-red-500/20 text-red-500',
		optional: 'bg-secondary/70 text-foreground'
	};

	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variantStyles[variant]} ${className} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
			onClick={onClick}
		>
			{children}
		</span>
	);
};

const randomizeArray = <T,>(arr: T[]): T[] => {
	return [...arr].sort(() => Math.random() - 0.5);
};

/**
 * Separates an array of application command options into subcommands and arguments.
 *
 * Subcommands are options of type 1 (SubCommand) or 2 (SubCommandGroup); all other types are considered arguments.
 *
 * @param options - The list of application command options to process. Undefined entries are ignored.
 * @returns An object containing `subcommands` and `args` arrays.
 */
function extractSubcommandsAndArgs(
	options: (discordgo.ApplicationCommandOption | undefined)[] = []
) {
	const subcommands: discordgo.ApplicationCommandOption[] = [];
	const args: discordgo.ApplicationCommandOption[] = [];
	options.forEach((opt) => {
		if (!opt) return;
		if (
			opt.type === 1 || // ApplicationCommandOptionSubCommand
			opt.type === 2 // ApplicationCommandOptionSubCommandGroup
		) {
			subcommands.push(opt);
		} else {
			args.push(opt);
		}
	});
	return { subcommands, args };
}

/**
 * Renders a responsive, interactive UI for browsing, searching, and filtering bot commands.
 *
 * Fetches command data and provides module-based filtering, full-text search, pagination, and view toggling between grid and list layouts. Users can expand commands to view detailed information, including subcommands and arguments. The interface adapts for desktop and mobile devices and handles loading and error states.
 */
export default function CommandInterface() {
	const [botState, setBotState] = useState<BotState | null>(null);
	const [selectedModule, setSelectedModule] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [showCount, setShowCount] = useState('20');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');

	useEffect(() => {
		const fetchBotState = async () => {
			try {
				const data: BotState = await getBotState();
				setBotState(data);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching bot state:', err);
				setError('Failed to load commands. Please try again later.');
				setLoading(false);
			}
		};

		fetchBotState();
	}, []);

	// Process commands with unique ids
	const allCommands = useMemo(() => {
		if (!botState) return [];
		let idCounter = 0;
		const commands: any[] = [];
		botState.commands.forEach((cmd: discordgo.ApplicationCommand) => {
			const moduleName = cmd.name;
			const moduleId = cmd.name;
			const { subcommands, args } = extractSubcommandsAndArgs(cmd.options);
			const mainCommand = {
				...cmd,
				moduleName,
				moduleId,
				id: `cmd-${idCounter++}`,
				subcommands,
				arguments: args.map((arg: discordgo.ApplicationCommandOption) => ({
					...arg,
					required: arg.required ?? false,
					choices: Array.isArray(arg.choices)
						? arg.choices
								.filter((c): c is discordgo.ApplicationCommandOptionChoice => !!c)
								.map((c) => c.name)
						: []
				}))
			};
			commands.push(mainCommand);
			// Flatten subcommands (if any)
			subcommands.forEach((subCmd: discordgo.ApplicationCommandOption) => {
				const { subcommands: subSub, args: subArgs } = extractSubcommandsAndArgs(subCmd.options);
				commands.push({
					...subCmd,
					moduleName,
					moduleId,
					id: `cmd-${idCounter++}`,
					subcommands: subSub,
					arguments: subArgs.map((arg: discordgo.ApplicationCommandOption) => ({
						...arg,
						required: arg.required ?? false,
						choices: Array.isArray(arg.choices)
							? arg.choices
									.filter((c): c is discordgo.ApplicationCommandOptionChoice => !!c)
									.map((c) => c.name)
							: []
					}))
				});
			});
		});
		return commands;
	}, [botState]);

	// Filtering and pagination (unchanged except dependency on allCommands)
	const filteredCommands = useMemo(() => {
		return allCommands.filter((cmd: any) => {
			const matchesSearch =
				cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(cmd.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
				(Array.isArray(cmd.arguments) &&
					cmd.arguments.some(
						(arg: any) =>
							arg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
							(arg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
					));
			const matchesModule = selectedModule === 'all' || cmd.moduleId === selectedModule;
			return matchesSearch && matchesModule;
		});
	}, [allCommands, searchQuery, selectedModule]);

	const paginatedCommands = useMemo(() => {
		return randomizeArray(filteredCommands).slice(0, Number.parseInt(showCount));
	}, [filteredCommands, showCount]);

	const modules = useMemo(() => {
		if (!botState) return [];
		const uniqueModules = new Map<string, { id: string; name: string }>();
		botState.commands.forEach((cmd: discordgo.ApplicationCommand) => {
			uniqueModules.set(cmd.name, {
				id: cmd.name,
				name: cmd.name
			});
		});
		return Array.from(uniqueModules.values());
	}, [botState]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="relative w-16 h-16">
						<div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
						<div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
					</div>
					<p className="text-foreground font-medium">Loading commands...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen bg-background">
				<div className="bg-background border border-border p-8 rounded-xl shadow-lg max-w-md">
					<div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10">
						<X className="h-8 w-8 text-red-500" />
					</div>
					<h2 className="text-2xl font-bold text-center mb-4">Error</h2>
					<p className="text-foreground text-center mb-6">{error}</p>
					<div className="flex justify-center">
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					</div>
				</div>
			</div>
		);
	}

	const ModuleSidebar = () => (
		<aside className="w-72 bg-background/50 backdrop-blur-sm border-r border-border rounded-l-xl hidden md:block overflow-hidden">
			<div className="p-5 border-b border-border">
				<div className="flex items-center space-x-3">
					<Command className="h-5 w-5 text-primary" />
					<h2 className="text-lg font-bold">Modules</h2>
				</div>
			</div>
			<div className="h-[calc(100vh-12rem)] overflow-y-auto p-3 space-y-1">
				<Button
					variant={selectedModule === 'all' ? 'primary' : 'ghost'}
					onClick={() => setSelectedModule('all')}
					className="w-full justify-start text-left"
					icon={<Zap className="h-4 w-4" />}
				>
					All Modules
				</Button>
				{modules.map((module) => (
					<Button
						key={module.id}
						variant={selectedModule === module.id ? 'primary' : 'ghost'}
						onClick={() => setSelectedModule(module.id)}
						className="w-full justify-start text-left truncate"
					>
						{module.name}
					</Button>
				))}
			</div>
		</aside>
	);

	const MobileHeader = () => (
		<div className="md:hidden flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
			<div className="flex items-center space-x-2">
				<Command className="h-5 w-5 text-primary" />
				<h1 className="text-xl font-bold">Command Reference</h1>
			</div>
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="rounded-lg p-2 hover:bg-secondary transition-colors"
				aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
			>
				{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>
		</div>
	);

	const MobileSidebar = () => (
		<div
			className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
				isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
			}`}
		>
			<div
				className="absolute inset-0 bg-background/80 backdrop-blur-sm"
				onClick={() => setIsMobileMenuOpen(false)}
			/>
			<div
				className={`absolute left-0 top-0 h-full w-72 bg-background border-r border-border shadow-xl overflow-y-auto transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
			>
				<div className="p-4 border-b border-border flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<Command className="h-5 w-5 text-primary" />
						<h2 className="font-bold">Modules</h2>
					</div>
					<button
						onClick={() => setIsMobileMenuOpen(false)}
						className="rounded-full p-1 hover:bg-secondary transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<div className="p-3 space-y-1">
					<Button
						variant={selectedModule === 'all' ? 'primary' : 'ghost'}
						onClick={() => {
							setSelectedModule('all');
							setIsMobileMenuOpen(false);
						}}
						className="w-full justify-start text-left"
						icon={<Zap className="h-4 w-4" />}
					>
						All Modules
					</Button>
					{modules.map((module) => (
						<Button
							key={module.id}
							variant={selectedModule === module.id ? 'primary' : 'ghost'}
							onClick={() => {
								setSelectedModule(module.id);
								setIsMobileMenuOpen(false);
							}}
							className="w-full justify-start text-left truncate"
						>
							{module.name}
						</Button>
					))}
				</div>
			</div>
		</div>
	);

	const CommandCard: React.FC<{ command: any }> = ({ command }) => {
		const [expanded, setExpanded] = useState(false);

		return (
			<div className="bg-background border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
				<div className="p-5 flex flex-col">
					<div className="flex justify-between items-start mb-3 gap-2">
						<h3 className="font-bold text-lg truncate">{command.name}</h3>
						<Badge variant="primary">{command.moduleName}</Badge>
					</div>
					{command.description && (
						<p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
							{command.description}
						</p>
					)}
					<div className="space-y-3 flex-grow">
						{command.subcommands && command.subcommands.length > 0 && (
							<div className="space-y-2">
								<p className="text-sm font-medium flex items-center gap-1.5">
									<ArrowRight className="h-3.5 w-3.5 text-primary" />
									Subcommands
								</p>
								<div className="flex flex-wrap gap-1.5">
									{command.subcommands
										.slice(0, expanded ? command.subcommands.length : 3)
										.map((subCmd: discordgo.ApplicationCommandOption) => (
											<Badge key={subCmd.name} variant="secondary">
												{subCmd.name}
											</Badge>
										))}
									{!expanded && command.subcommands.length > 3 && (
										<Badge variant="outline" onClick={() => setExpanded(true)}>
											+{command.subcommands.length - 3} more
										</Badge>
									)}
								</div>
							</div>
						)}
						{command.arguments.length > 0 && (
							<div className="space-y-2">
								<p className="text-sm font-medium flex items-center gap-1.5">
									<ArrowRight className="h-3.5 w-3.5 text-primary" />
									Arguments
								</p>
								<div className="flex flex-wrap gap-1.5">
									{command.arguments
										.slice(0, expanded ? command.arguments.length : 3)
										.map((arg: any) => (
											<Badge key={arg.name} variant={arg.required ? 'required' : 'optional'}>
												{arg.name}
											</Badge>
										))}
									{!expanded && command.arguments.length > 3 && (
										<Badge variant="outline" onClick={() => setExpanded(true)}>
											+{command.arguments.length - 3} more
										</Badge>
									)}
								</div>
							</div>
						)}
					</div>
					{!expanded && (
						<button
							className="mt-auto text-sm text-primary hover:underline flex items-center gap-1"
							onClick={() => setExpanded(true)}
						>
							<span>Show details</span>
							<ChevronDown className="h-3.5 w-3.5" />
						</button>
					)}
					{expanded && (
						<div className="mt-5 pt-4 border-t border-border space-y-4">
							{command.description && (
								<div>
									<h4 className="text-sm font-medium mb-1.5">Description</h4>
									<p className="text-sm text-foreground">{command.description}</p>
								</div>
							)}
							{command.subcommands && command.subcommands.length > 0 && (
								<div>
									<h4 className="text-sm font-medium mb-1.5">Subcommands</h4>
									<ul className="space-y-3">
										{command.subcommands.map((subCmd: discordgo.ApplicationCommandOption) => (
											<li key={subCmd.name} className="text-sm bg-secondary/30 p-3 rounded-lg">
												<span className="font-medium text-primary">{subCmd.name}</span>
												{subCmd.description && (
													<p className="text-muted-foreground mt-1">{subCmd.description}</p>
												)}
											</li>
										))}
									</ul>
								</div>
							)}
							{command.arguments.length > 0 && (
								<div>
									<h4 className="text-sm font-medium mb-1.5">Arguments</h4>
									<ul className="space-y-3">
										{command.arguments.map((arg: discordgo.ApplicationCommandOption) => (
											<li key={arg.name} className="text-sm bg-secondary/30 p-3 rounded-lg">
												<div className="flex items-center gap-2">
													<span className="font-medium text-primary">{arg.name}</span>
													{arg.required ? (
														<Badge variant="required">Required</Badge>
													) : (
														<Badge variant="optional">Optional</Badge>
													)}
												</div>
												{arg.description && (
													<p className="text-muted-foreground mt-1">{arg.description}</p>
												)}
												{arg.choices && arg.choices.length > 0 && (
													<div className="mt-2">
														<span className="text-xs text-muted-foreground">Options: </span>
														<div className="flex flex-wrap gap-1.5 mt-1.5">
															{arg.choices &&
																arg.choices.length > 0 &&
																(arg.choices as unknown as string[]).map((choice, idx) => (
																	<Badge key={idx} variant="secondary">
																		{choice}
																	</Badge>
																))}
														</div>
													</div>
												)}
											</li>
										))}
									</ul>
								</div>
							)}
							<button
								className="text-sm text-primary hover:underline flex items-center gap-1"
								onClick={() => setExpanded(false)}
							>
								<span>Show less</span>
								<ChevronDown className="h-3.5 w-3.5 rotate-180" />
							</button>
						</div>
					)}
				</div>
			</div>
		);
	};

	const CommandListItem: React.FC<{ command: any }> = ({ command }) => {
		const [expanded, setExpanded] = useState(false);

		return (
			<div className="bg-background border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
				<div className="p-5">
					<div className="flex justify-between items-center">
						<div className="flex-1">
							<div className="flex items-center gap-3">
								<h3 className="font-bold text-lg">{command.name}</h3>
								<Badge variant="primary">{command.moduleName}</Badge>
							</div>
							{command.description && (
								<p className="text-muted-foreground mt-1 line-clamp-1">{command.description}</p>
							)}
						</div>
						<button
							onClick={() => setExpanded(!expanded)}
							className="ml-4 p-2 rounded-full hover:bg-secondary/50 transition-colors"
						>
							<ChevronDown
								className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
							/>
						</button>
					</div>
					{expanded && (
						<div className="mt-4 pt-4 border-t border-border space-y-4">
							{command.description && (
								<div>
									<h4 className="text-sm font-medium mb-1.5">Description</h4>
									<p className="text-sm text-foreground">{command.description}</p>
								</div>
							)}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{command.subcommands && command.subcommands.length > 0 && (
									<div>
										<h4 className="text-sm font-medium mb-1.5">Subcommands</h4>
										<div className="bg-secondary/30 p-3 rounded-lg">
											<div className="flex flex-wrap gap-1.5">
												{command.subcommands.map((subCmd: discordgo.ApplicationCommandOption) => (
													<Badge key={subCmd.name} variant="secondary">
														{subCmd.name}
													</Badge>
												))}
											</div>
										</div>
									</div>
								)}
								{command.arguments.length > 0 && (
									<div>
										<h4 className="text-sm font-medium mb-1.5">Arguments</h4>
										<div className="bg-secondary/30 p-3 rounded-lg">
											<div className="flex flex-wrap gap-1.5">
												{command.arguments.map((arg: discordgo.ApplicationCommandOption) => (
													<Badge key={arg.name} variant={arg.required ? 'required' : 'optional'}>
														{arg.name}
													</Badge>
												))}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto p-4">
				<MobileHeader />
				<MobileSidebar />
				<div className="flex flex-col md:flex-row rounded-xl overflow-hidden border border-border bg-background/30 backdrop-blur-sm shadow-xl mt-4">
					<ModuleSidebar />
					<main className="flex-1 flex flex-col min-h-[calc(100vh-2rem)]">
						<div className="p-6 border-b border-border hidden md:block">
							<h1 className="text-2xl font-bold mb-2">Command Reference</h1>
							<p className="text-muted-foreground">
								{selectedModule === 'all'
									? 'Browse all available commands'
									: `Browsing commands in ${modules.find((m) => m.id === selectedModule)?.name || ''}`}
							</p>
						</div>
						{/* Filters */}
						<div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="relative flex-1">
									<InputField
										placeholder="Search commands, arguments, descriptions..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										icon={Search}
									/>
								</div>
								<div className="flex items-center gap-4 w-full sm:w-auto">
									<div className="flex items-center gap-2">
										<button
											onClick={() => setActiveView('grid')}
											className={`p-2 rounded-lg transition-colors ${
												activeView === 'grid'
													? 'bg-primary text-white'
													: 'bg-secondary/50 hover:bg-secondary'
											}`}
											aria-label="Grid view"
										>
											<LayoutGrid className="h-5 w-5" />
										</button>
										<button
											onClick={() => setActiveView('list')}
											className={`p-2 rounded-lg transition-colors ${
												activeView === 'list'
													? 'bg-primary text-white'
													: 'bg-secondary/50 hover:bg-secondary'
											}`}
											aria-label="List view"
										>
											<List className="h-5 w-5" />
										</button>
									</div>
									<div className="flex items-center gap-2 flex-1 sm:flex-none">
										<span className="text-muted-foreground whitespace-nowrap">Show</span>
										<Select
											value={showCount}
											onChange={setShowCount}
											options={[
												{ value: '10', label: '10' },
												{ value: '20', label: '20' },
												{ value: '50', label: '50' },
												{ value: '100', label: '100' }
											]}
											className="w-24"
										/>
									</div>
								</div>
							</div>
						</div>
						{/* Results */}
						<div className="flex-1 p-4 overflow-auto">
							<div className="mb-4 flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									Showing {paginatedCommands.length} of {filteredCommands.length} commands
								</p>
								{selectedModule !== 'all' && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSelectedModule('all')}
										icon={<Filter className="h-3.5 w-3.5" />}
									>
										Clear filter
									</Button>
								)}
							</div>
							{paginatedCommands.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-64 text-center">
									<div className="rounded-full bg-secondary/50 w-16 h-16 flex items-center justify-center mb-4">
										<Search className="h-7 w-7 text-muted-foreground" />
									</div>
									<h3 className="text-xl font-medium mb-2">No commands found</h3>
									<p className="text-muted-foreground max-w-md">
										Try adjusting your search or selecting a different module
									</p>
								</div>
							) : (
								<>
									{activeView === 'grid' ? (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
											{paginatedCommands.map((command) => (
												<CommandCard key={command.id} command={command} />
											))}
										</div>
									) : (
										<div className="space-y-4">
											{paginatedCommands.map((command) => (
												<CommandListItem key={command.id} command={command} />
											))}
										</div>
									)}
								</>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
