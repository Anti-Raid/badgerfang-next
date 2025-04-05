'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Menu, X } from 'lucide-react';
import type { CanonicalCommand, BotState } from '../../types/splashtail/types';

const permissionNames: { [key: string]: string } = {
	'1': 'CREATE_INSTANT_INVITE',
	'2': 'KICK_MEMBERS',
	'4': 'BAN_MEMBERS',
	'8': 'ADMINISTRATOR',
	'16': 'MANAGE_CHANNELS',
	'32': 'MANAGE_GUILD',
	'64': 'ADD_REACTIONS',
	'128': 'VIEW_AUDIT_LOG',
	'256': 'PRIORITY_SPEAKER',
	'512': 'STREAM',
	'1024': 'VIEW_CHANNEL',
	'2048': 'SEND_MESSAGES',
	'4096': 'SEND_TTS_MESSAGES',
	'8192': 'MANAGE_MESSAGES',
	'16384': 'EMBED_LINKS',
	'32768': 'ATTACH_FILES',
	'65536': 'READ_MESSAGE_HISTORY',
	'131072': 'MENTION_EVERYONE',
	'262144': 'USE_EXTERNAL_EMOJIS',
	'524288': 'VIEW_GUILD_INSIGHTS',
	'1048576': 'CONNECT',
	'2097152': 'SPEAK',
	'4194304': 'MUTE_MEMBERS',
	'8388608': 'DEAFEN_MEMBERS',
	'16777216': 'MOVE_MEMBERS',
	'33554432': 'USE_VAD',
	'67108864': 'CHANGE_NICKNAME',
	'134217728': 'MANAGE_NICKNAMES',
	'268435456': 'MANAGE_ROLES',
	'536870912': 'MANAGE_WEBHOOKS',
	'1073741824': 'MANAGE_EMOJIS_AND_STICKERS',
	'2147483648': 'USE_APPLICATION_COMMANDS',
	'4294967296': 'REQUEST_TO_SPEAK',
	'8589934592': 'MANAGE_EVENTS',
	'17179869184': 'MANAGE_THREADS',
	'34359738368': 'CREATE_PUBLIC_THREADS',
	'68719476736': 'CREATE_PRIVATE_THREADS',
	'137438953472': 'USE_EXTERNAL_STICKERS',
	'274877906944': 'SEND_MESSAGES_IN_THREADS',
	'549755813888': 'USE_EMBEDDED_ACTIVITIES',
	'1099511627776': 'MODERATE_MEMBERS'
};

const Button: React.FC<
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		variant?: 'primary' | 'secondary' | 'ghost';
	}
> = ({ children, className = '', variant = 'primary', ...props }) => {
	const baseStyles =
		'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50';

	const variantStyles = {
		primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'bg-transparent hover:bg-secondary/50'
	};

	return (
		<button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
			{children}
		</button>
	);
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
	className = '',
	...props
}) => (
	<input
		className={`w-full px-3 py-2 bg-card text-foreground rounded-lg border border-input shadow-sm transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${className}`}
		{...props}
	/>
);

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ value, onChange, options, placeholder = 'Select...' }) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find((opt) => opt.value === value);

	return (
		<div className="relative w-full">
			<div
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-between w-full px-3 py-2 bg-card text-foreground rounded-lg border border-input cursor-pointer shadow-sm hover:border-primary/50 transition-all duration-200"
			>
				<span className="truncate">{selectedOption?.label || placeholder}</span>
				<ChevronDown
					className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
				/>
			</div>

			{isOpen && (
				<>
					<div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
					<div className="absolute z-50 w-full mt-1 bg-card border border-input rounded-lg shadow-lg overflow-hidden">
						<div className="max-h-60 overflow-y-auto py-1">
							{options.map((option) => (
								<div
									key={option.value}
									className={`px-3 py-2 cursor-pointer transition-colors duration-150 ${
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
		</div>
	);
};

// Helper to randomize array
const randomizeArray = <T,>(arr: T[]): T[] => {
	return [...arr].sort(() => Math.random() - 0.5);
};

// Extended command interface with module info
interface CommandWithModule extends CanonicalCommand {
	moduleName: string;
	moduleId: string;
}

// Badge component for UI elements
const Badge: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
	children,
	className = '',
	onClick
}) => (
	<span
		className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className} ${onClick ? 'cursor-pointer' : ''}`}
		onClick={onClick}
	>
		{children}
	</span>
);

/**
 * Renders a responsive command interface for browsing and interacting with bot commands.
 *
 * This React component fetches the bot state from an API endpoint to retrieve the available commands,
 * processes them to attach module information and subcommands, and implements search, module-based
 * filtering, and pagination. It adapts its layout for both desktop and mobile views, including a toggleable
 * sidebar on mobile devices.
 *
 * @returns A JSX.Element representing the command interface.
 */
export default function CommandInterface() {
	// State management
	const [botState, setBotState] = useState<BotState | null>(null);
	const [selectedModule, setSelectedModule] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [showCount, setShowCount] = useState('20');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Data fetching
	useEffect(() => {
		const fetchBotState = async () => {
			try {
				const response = await fetch('https://splashtail-staging.antiraid.xyz/bot-state');
				if (!response.ok) {
					throw new Error('Failed to fetch bot state');
				}
				const data: BotState = await response.json();
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

	const processCommand = (
		cmd: CanonicalCommand,
		moduleName: string,
		moduleId: string
	): CommandWithModule[] => {
		const mainCommand: CommandWithModule = {
			...cmd,
			moduleName,
			moduleId
		};

		if (!cmd.subcommands || cmd.subcommands.length === 0) {
			return [mainCommand];
		}

		const subcommands = cmd.subcommands.map(
			(subCmd): CommandWithModule => ({
				...subCmd,
				moduleName,
				moduleId
			})
		);

		return [mainCommand, ...subcommands];
	};

	const allCommands = useMemo(() => {
		if (!botState) return [];

		const commands: CommandWithModule[] = [];

		botState.commands.forEach((cmd) => {
			const moduleName = cmd.name;
			const moduleId = cmd.qualified_name;

			const processedCommands = processCommand(cmd, moduleName, moduleId);
			commands.push(...processedCommands);
		});

		return commands;
	}, [botState]);

	const filteredCommands = useMemo(() => {
		return allCommands.filter((cmd) => {
			const matchesSearch =
				cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(cmd.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
				cmd.arguments.some(
					(arg) =>
						arg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						(arg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
				);

			const matchesModule = selectedModule === 'all' || cmd.moduleId === selectedModule;

			return matchesSearch && matchesModule;
		});
	}, [allCommands, searchQuery, selectedModule]);

	const paginatedCommands = useMemo(() => {
		return randomizeArray(filteredCommands).slice(0, parseInt(showCount));
	}, [filteredCommands, showCount]);

	const modules = useMemo(() => {
		if (!botState) return [];

		const uniqueModules = new Map<string, { id: string; name: string }>();

		botState.commands.forEach((cmd) => {
			uniqueModules.set(cmd.qualified_name, {
				id: cmd.qualified_name,
				name: cmd.name
			});
		});

		return Array.from(uniqueModules.values());
	}, [botState]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
					<p className="text-foreground font-medium">Loading commands...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen bg-background">
				<div className="bg-card p-6 rounded-lg shadow-lg max-w-md">
					<h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
					<p className="text-foreground mb-4">{error}</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
				</div>
			</div>
		);
	}

	const ModuleSidebar = () => (
		<aside className="w-64 bg-card border-r border-border rounded-l-lg hidden md:block overflow-hidden">
			<div className="p-4 border-b border-border">
				<h2 className="text-lg font-bold">Modules</h2>
			</div>
			<div className="h-[calc(100vh-12rem)] overflow-y-auto p-2">
				<Button
					variant={selectedModule === 'all' ? 'primary' : 'ghost'}
					onClick={() => setSelectedModule('all')}
					className="w-full justify-start text-left mb-1"
				>
					All Modules
				</Button>

				{modules.map((module) => (
					<Button
						key={module.id}
						variant={selectedModule === module.id ? 'primary' : 'ghost'}
						onClick={() => setSelectedModule(module.id)}
						className="w-full justify-start text-left mb-1 truncate"
					>
						{module.name}
					</Button>
				))}
			</div>
		</aside>
	);

	const MobileHeader = () => (
		<div className="md:hidden flex justify-between items-center p-4 bg-card border-b border-border">
			<h1 className="text-xl font-bold">Command Reference</h1>
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="rounded-lg p-2 hover:bg-secondary transition-colors"
				aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
			>
				{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>
		</div>
	);

	// Mobile sidebar menu
	const MobileSidebar = () => (
		<div
			className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
				isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
			}`}
		>
			<div
				className="absolute inset-0 bg-background/80 backdrop-blur-sm"
				onClick={() => setIsMobileMenuOpen(false)}
			/>
			<div className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl overflow-y-auto">
				<div className="p-4 border-b border-border flex justify-between items-center">
					<h2 className="font-bold">Modules</h2>
					<button
						onClick={() => setIsMobileMenuOpen(false)}
						className="rounded-full p-1 hover:bg-secondary transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-2">
					<Button
						variant={selectedModule === 'all' ? 'primary' : 'ghost'}
						onClick={() => {
							setSelectedModule('all');
							setIsMobileMenuOpen(false);
						}}
						className="w-full justify-start text-left mb-1"
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
							className="w-full justify-start text-left mb-1 truncate"
						>
							{module.name}
						</Button>
					))}
				</div>
			</div>
		</div>
	);

	const CommandCard: React.FC<{ command: CommandWithModule; index: number }> = ({
		command,
		index
	}) => {
		const [expanded, setExpanded] = useState(false);

		return (
			<div
				className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
				key={`${command.moduleId}-${command.name}-${command.qualified_name || ''}-${index}`}
			>
				<div className="p-4">
					<div className="flex justify-between items-start mb-3">
						<h3 className="font-bold text-lg truncate">{command.qualified_name || command.name}</h3>
						<Badge className="bg-primary/15 text-primary">{command.moduleName}</Badge>
					</div>

					{command.description && (
						<p className="text-muted-foreground mb-3 line-clamp-2">{command.description}</p>
					)}

					<div className="space-y-2">
						{command.subcommands && command.subcommands.length > 0 && (
							<div className="space-y-1">
								<p className="text-sm font-medium">Subcommands:</p>
								<div className="flex flex-wrap gap-1">
									{command.subcommands
										.slice(0, expanded ? command.subcommands.length : 3)
										.map((subCmd) => (
											<Badge key={subCmd.name} className="bg-secondary text-secondary-foreground">
												{subCmd.name}
											</Badge>
										))}
									{!expanded && command.subcommands.length > 3 && (
										<Badge
											className="bg-secondary/50 text-secondary-foreground cursor-pointer"
											onClick={() => setExpanded(true)}
										>
											+{command.subcommands.length - 3} more
										</Badge>
									)}
								</div>
							</div>
						)}

						{command.arguments.length > 0 && (
							<div className="space-y-1">
								<p className="text-sm font-medium">Arguments:</p>
								<div className="flex flex-wrap gap-1">
									{command.arguments
										.slice(0, expanded ? command.arguments.length : 3)
										.map((arg) => (
											<Badge
												key={arg.name}
												className={`${arg.required ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-secondary-foreground'}`}
											>
												{arg.name}
											</Badge>
										))}
									{!expanded && command.arguments.length > 3 && (
										<Badge
											className="bg-secondary/50 text-secondary-foreground cursor-pointer"
											onClick={() => setExpanded(true)}
										>
											+{command.arguments.length - 3} more
										</Badge>
									)}
								</div>
							</div>
						)}

						{botState?.command_permissions &&
							botState.command_permissions[command.qualified_name || command.name] && (
								<div className="space-y-1">
									<p className="text-sm font-medium">Required Permissions:</p>
									<div className="flex flex-wrap gap-1">
										{botState.command_permissions[command.qualified_name || command.name]
											.slice(
												0,
												expanded
													? botState.command_permissions[command.qualified_name || command.name]
															.length
													: 2
											)
											.map((perm, idx) => (
												<Badge key={idx} className="bg-accent text-accent-foreground">
													{permissionNames[perm] || perm}
												</Badge>
											))}
										{!expanded &&
											botState.command_permissions[command.qualified_name || command.name].length >
												2 && (
												<Badge
													className="bg-accent/50 text-accent-foreground cursor-pointer"
													onClick={() => setExpanded(true)}
												>
													+
													{botState.command_permissions[command.qualified_name || command.name]
														.length - 2}{' '}
													more
												</Badge>
											)}
									</div>
								</div>
							)}
					</div>

					{!expanded && (
						<button
							className="mt-3 text-sm text-primary hover:underline"
							onClick={() => setExpanded(true)}
						>
							Show details
						</button>
					)}

					{expanded && (
						<div className="mt-4 pt-3 border-t border-border space-y-3">
							{command.description && (
								<div>
									<h4 className="text-sm font-medium mb-1">Description</h4>
									<p className="text-sm text-foreground">{command.description}</p>
								</div>
							)}

							{command.subcommands && command.subcommands.length > 0 && (
								<div>
									<h4 className="text-sm font-medium mb-1">Subcommands</h4>
									<ul className="space-y-2">
										{command.subcommands.map((subCmd) => (
											<li key={subCmd.name} className="text-sm">
												<span className="font-medium">{subCmd.name}</span>
												{subCmd.description && (
													<p className="text-muted-foreground">{subCmd.description}</p>
												)}
											</li>
										))}
									</ul>
								</div>
							)}

							{command.arguments.length > 0 && (
								<div>
									<h4 className="text-sm font-medium mb-1">Arguments</h4>
									<ul className="space-y-2">
										{command.arguments.map((arg) => (
											<li key={arg.name} className="text-sm">
												<div className="flex items-center gap-2">
													<span className="font-medium">{arg.name}</span>
													{arg.required ? (
														<Badge className="bg-destructive/20 text-destructive">Required</Badge>
													) : (
														<Badge className="bg-secondary text-secondary-foreground">
															Optional
														</Badge>
													)}
												</div>
												{arg.description && (
													<p className="text-muted-foreground">{arg.description}</p>
												)}
												{arg.choices && arg.choices.length > 0 && (
													<div className="mt-1">
														<span className="text-xs text-muted-foreground">Options: </span>
														<div className="flex flex-wrap gap-1 mt-1">
															{arg.choices.map((choice, idx) => (
																<Badge
																	key={idx}
																	className="bg-secondary/70 text-secondary-foreground"
																>
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

							{botState?.command_permissions &&
								botState.command_permissions[command.qualified_name || command.name] && (
									<div>
										<h4 className="text-sm font-medium mb-1">Required Permissions</h4>
										<div className="flex flex-wrap gap-1">
											{botState.command_permissions[command.qualified_name || command.name].map(
												(perm, idx) => (
													<Badge key={idx} className="bg-accent text-accent-foreground">
														{permissionNames[perm] || perm}
													</Badge>
												)
											)}
										</div>
									</div>
								)}

							<button
								className="text-sm text-primary hover:underline"
								onClick={() => setExpanded(false)}
							>
								Show less
							</button>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto">
				<MobileHeader />

				<MobileSidebar />

				<div className="flex flex-col md:flex-row rounded-lg overflow-hidden border border-border bg-card/30 shadow-md">
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
						<div className="p-4 border-b border-border bg-card/50">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
									<Input
										placeholder="Search commands, arguments, descriptions..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-9"
									/>
								</div>
								<div className="flex items-center gap-2 w-full sm:w-auto">
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
									/>
								</div>
							</div>
						</div>

						{/* Results */}
						<div className="flex-1 p-4 overflow-auto">
							<div className="mb-4">
								<p className="text-sm text-muted-foreground">
									Showing {paginatedCommands.length} of {filteredCommands.length} commands
								</p>
							</div>

							{paginatedCommands.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-64 text-center">
									<div className="rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
										<Search className="h-6 w-6 text-secondary-foreground" />
									</div>
									<h3 className="text-lg font-medium mb-1">No commands found</h3>
									<p className="text-muted-foreground max-w-md">
										Try adjusting your search or selecting a different module
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{paginatedCommands.map((command, index) => (
										<CommandCard key={index} command={command} index={index} />
									))}
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
