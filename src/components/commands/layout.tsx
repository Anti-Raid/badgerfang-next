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

const CustomButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
	children,
	className,
	...props
}) => (
	<button
		className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none ${className}`}
		{...props}
	>
		{children}
	</button>
);

const CustomInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
	className,
	...props
}) => (
	<input
		className={`w-full px-3 py-2 bg-[#2d2640] text-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-none outline-none ${className}`}
		{...props}
	/>
);

const CustomScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	children,
	className,
	...props
}) => (
	<div className={`overflow-auto ${className}`} {...props}>
		{children}
	</div>
);

const CustomSelect: React.FC<{
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative inline-block text-left">
			<div>
				<CustomButton
					type="button"
					className="inline-flex justify-center w-full rounded-md px-4 py-2 bg-[#2d2640] text-sm font-medium text-white shadow-md hover:shadow-lg transition-shadow"
					onClick={() => setIsOpen(!isOpen)}
				>
					{options.find((option) => option.value === value)?.label || 'Select...'}
					<ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
				</CustomButton>
			</div>

			{isOpen && (
				<div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#2d2640] ring-1 ring-black ring-opacity-5 z-10">
					<div
						className="py-1"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="options-menu"
					>
						{options.map((option) => (
							<CustomButton
								key={option.value}
								className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3150]"
								onClick={() => {
									onChange(option.value);
									setIsOpen(false);
								}}
							>
								{option.label}
							</CustomButton>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

const randomizeArray = <T,>(arr: T[]): T[] => {
	return [...arr].sort(() => Math.random() - 0.5);
};

interface CommandWithModule extends CanonicalCommand {
	moduleName: string;
	moduleId: string;
}

export default function CommandInterface() {
	const [botState, setBotState] = useState<BotState | null>(null);
	const [selectedModule, setSelectedModule] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [showCount, setShowCount] = useState('20');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
			} catch (error) {
				console.error('Error fetching bot state:', error);
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
		// Process the main command
		const mainCommand: CommandWithModule = {
			...cmd,
			moduleName,
			moduleId
		};

		// If the command has no subcommands, return it as-is
		if (!cmd.subcommands || cmd.subcommands.length === 0) {
			return [mainCommand];
		}

		// If the command has subcommands, process and return both the main command and its subcommands
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

		// Process all commands and their subcommands
		const commands: CommandWithModule[] = [];

		botState.commands.forEach((cmd) => {
			// For each command category (like "backups", "kick", etc.)
			// Get module name from command
			const moduleName = cmd.name;
			const moduleId = cmd.qualified_name;

			// Process the command and its subcommands
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

		// Create a unique list of modules based on command categories
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
			<div className="flex justify-center items-center h-screen bg-[#1a1625] text-white">
				Loading...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen bg-[#1a1625] text-white">
				{error}
			</div>
		);
	}

	const ModuleSidebar = () => (
		<div className="w-64 bg-[#1f1b2e] p-4 rounded-tl-[6px] rounded-bl-[6px] hidden md:block">
			<CustomScrollArea className="h-[calc(100vh-2rem)]">
				<CustomButton
					onClick={() => {
						setSelectedModule('all');
						setIsMobileMenuOpen(false);
					}}
					className={`w-full text-left p-3 rounded-lg mb-2 ${
						selectedModule === 'all'
							? 'bg-[#2d2640] text-white'
							: 'text-gray-400 hover:bg-[#2d2640] hover:text-white'
					}`}
				>
					All Modules
				</CustomButton>

				{modules.map((module) => (
					<CustomButton
						key={module.id}
						onClick={() => {
							setSelectedModule(module.id);
							setIsMobileMenuOpen(false);
						}}
						className={`w-full text-left p-3 rounded-lg mb-2 ${
							selectedModule === module.id
								? 'bg-[#2d2640] text-white'
								: 'text-gray-400 hover:bg-[#2d2640] hover:text-white'
						}`}
					>
						{module.name}
					</CustomButton>
				))}
			</CustomScrollArea>
		</div>
	);

	const MobileModuleMenu = () => (
		<>
			<div className="md:hidden flex justify-between rounded-tl-[6px] rounded-tr-[6px] items-center p-4 bg-[#1f1b2e]">
				<h1 className="text-xl font-bold text-white">Command Reference</h1>
				<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
					{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</button>
			</div>

			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-50 md:hidden">
					<div
						className="absolute inset-0 bg-black opacity-50"
						onClick={() => setIsMobileMenuOpen(false)}
					/>
					<div className="absolute left-0 top-0 bottom-0 w-64 bg-[#1f1b2e] p-4 overflow-y-auto">
						<CustomButton
							onClick={() => {
								setSelectedModule('all');
								setIsMobileMenuOpen(false);
							}}
							className={`w-full text-left p-3 rounded-lg mb-2 ${
								selectedModule === 'all'
									? 'bg-[#2d2640] text-white'
									: 'text-gray-400 hover:bg-[#2d2640] hover:text-white'
							}`}
						>
							All Modules
						</CustomButton>
						{modules.map((module) => (
							<CustomButton
								key={module.id}
								onClick={() => {
									setSelectedModule(module.id);
									setIsMobileMenuOpen(false);
								}}
								className={`w-full text-left p-3 rounded-lg mb-2 ${
									selectedModule === module.id
										? 'bg-[#2d2640] text-white'
										: 'text-gray-400 hover:bg-[#2d2640] hover:text-white'
								}`}
							>
								{module.name}
							</CustomButton>
						))}
					</div>
				</div>
			)}
		</>
	);

	return (
		<div className="min-h-screen bg-[#1a1625] max-w-[95%] mx-auto rounded-[6px]">
			{MobileModuleMenu()}

			<div className="flex flex-col md:flex-row rounded-[6px]">
				{ModuleSidebar()}

				<div className="flex-1 p-4 md:p-6">
					<div className="hidden md:block mb-8">
						<h1 className="text-2xl font-bold text-white mb-2">Command Reference</h1>
						<p className="text-gray-400">Explore all available commands across modules</p>
					</div>

					<div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
						<div className="relative w-full sm:max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<CustomInput
								placeholder="Search commands..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 w-full"
							/>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-gray-400">Show</span>
							<CustomSelect
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

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{paginatedCommands.map((cmd, index) => (
							<div
								key={`${cmd.moduleId}-${cmd.name}-${cmd.qualified_name || ''}-${index}`}
								className="bg-[#1f1b2e] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
							>
								<div className="text-white font-bold text-lg mb-2">
									{cmd.qualified_name || cmd.name}
								</div>
								<div className="text-sm text-gray-400 mb-2">
									Module: <span className="text-gray-300">{cmd.moduleName}</span>
								</div>
								{cmd.subcommands && cmd.subcommands.length > 0 && (
									<div className="text-sm text-gray-400 mb-2">
										Subcommands:
										<ul className="text-gray-300 list-disc pl-4">
											{cmd.subcommands.map((subCmd) => (
												<li key={subCmd.name}>
													{subCmd.name}
													{subCmd.description && `: ${subCmd.description}`}
												</li>
											))}
										</ul>
									</div>
								)}
								<div className="text-sm text-gray-400 mb-2">
									Description:{' '}
									<span className="text-gray-300">
										{cmd.description || 'No description available'}
									</span>
								</div>
								<div className="text-sm text-gray-400 mb-2">
									Arguments:
									<ul className="text-gray-300 list-disc pl-4">
										{cmd.arguments.map((arg) => (
											<li key={arg.name}>
												{arg.name}
												{arg.required ? ' (Required)' : ' (Optional)'}
												{arg.description && `: ${arg.description}`}
												{arg.choices && arg.choices.length > 0 && (
													<span> - Options: {arg.choices.join(', ')}</span>
												)}
											</li>
										))}
										{cmd.arguments.length === 0 && <li>No arguments</li>}
									</ul>
								</div>
								{botState?.command_permissions && (
									<div className="text-sm text-gray-400">
										Permissions:
										<ul className="text-gray-300 list-disc pl-4">
											{botState.command_permissions[cmd.qualified_name || cmd.name] ? (
												botState.command_permissions[cmd.qualified_name || cmd.name].map(
													(perm, i) => <li key={i}>{permissionNames[perm] || perm}</li>
												)
											) : (
												<li>No specific permissions required</li>
											)}
										</ul>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
