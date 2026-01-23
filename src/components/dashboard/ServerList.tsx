import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DashboardGuild } from '@/types/api/bindings/DashboardGuild';
import { Search, Server, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ServerCard } from '@/components/dashboard/ServerCard';
import { getDiscordPermissionNames } from '@/lib/utils';

export const ServerList: React.FC<{
	servers: DashboardGuild[];
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	showViewButton: boolean;
	isLoading: boolean;
}> = ({ servers, searchTerm, setSearchTerm, showViewButton, isLoading }) => {
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [sortBy, setSortBy] = useState<'permission' | 'name'>('permission');

	// Keyboard shortcut: Press "/" to focus search
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
				e.preventDefault();
				searchInputRef.current?.focus();
			}
			if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
				setSearchTerm('');
				searchInputRef.current?.blur();
			}
		};
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [setSearchTerm]);

	// Filtered servers
	const filteredServers = useMemo(() => {
		const searchLower = searchTerm.toLowerCase();
		return servers.filter((server) => server.name.toLowerCase().includes(searchLower));
	}, [servers, searchTerm]);

	// Sorted servers
	const sortedServers = useMemo(() => {
		const rank = (permissions: string[]) => {
			if (permissions.includes('Administrator')) return 1;
			if (permissions.includes('Manage Server')) return 2;
			if (permissions.includes('Manage Channels')) return 3;
			if (permissions.includes('Manage Roles')) return 4;
			if (permissions.includes('Manage Messages')) return 5;
			if (permissions.includes('Manage Webhooks')) return 6;
			return 99;
		};

		const copy = [...filteredServers];

		if (sortBy === 'permission') {
			copy.sort((a, b) => {
				const permA = getDiscordPermissionNames(BigInt(a.permissions));
				const permB = getDiscordPermissionNames(BigInt(b.permissions));
				const rankA = rank(permA);
				const rankB = rank(permB);
				if (rankA !== rankB) return rankA - rankB;
				return a.name.localeCompare(b.name);
			});
		} else {
			copy.sort((a, b) => a.name.localeCompare(b.name));
		}

		return copy;
	}, [filteredServers, sortBy]);

	return (
		<div>
			{/* Search + Sort */}
			<div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
				{/* Search */}
				<div className="relative flex-1 group">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-extra/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
					<div className="relative bg-accent/80 backdrop-blur-sm rounded-xl overflow-hidden border shadow-lg transition-all duration-300 group-hover:shadow-primary/10 group-focus-within:shadow-primary/20 group-focus-within:border-primary/30">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
						<input
							ref={searchInputRef}
							type="text"
							placeholder="Search for a server"
							className="w-full bg-transparent text-foreground pl-12 pr-24 py-4 focus:outline-none placeholder-muted-foreground transition-all"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
							<kbd className="px-2 py-1 bg-accent/50 rounded border border-border/50 font-mono">/</kbd>
							<span className="hidden sm:inline">to search</span>
						</div>
					</div>
				</div>

				{/* Radix Dropdown for sorting */}
{/* Radix Dropdown for sorting */}
<DropdownMenu.Root>
  <DropdownMenu.Trigger className="flex items-center gap-2 bg-accent/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-border/30 text-foreground shadow-lg hover:shadow-primary/20 transition-all focus:outline-none">
    {sortBy === 'permission' ? '🔑 Top Permission' : '🔤 Name A-Z'}
    <ChevronDown className="h-4 w-4" />
  </DropdownMenu.Trigger>

  <DropdownMenu.Portal>
    <DropdownMenu.Content
      className="bg-card/90 backdrop-blur-md rounded-xl p-2 shadow-lg border border-border/30 min-w-[180px] animate-fadeIn scale-95 origin-top-right"
    >
      <DropdownMenu.Item
        className="px-4 py-2 rounded-lg hover:bg-primary/20 cursor-pointer select-none transition-colors flex items-center gap-2"
        onClick={() => setSortBy('permission')}
      >
        🔑 Top Permission
      </DropdownMenu.Item>
      <DropdownMenu.Item
        className="px-4 py-2 rounded-lg hover:bg-primary/20 cursor-pointer select-none transition-colors flex items-center gap-2"
        onClick={() => setSortBy('name')}
      >
        🔤 Name A-Z
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

			</div>

			{/* Server List */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="bg-card/80 rounded-xl p-6 border border-border/30 h-48 shadow-lg relative overflow-hidden"
							style={{
								animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
								animationDelay: `${i * 100}ms`
							}}
						/>
					))}
				</div>
			) : sortedServers.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{sortedServers.map((server, index) => (
						<div
							key={server.id}
							style={{
								animation: 'fadeInUp 0.5s ease-out forwards',
								animationDelay: `${index * 50}ms`,
								opacity: 0
							}}
						>
							<ServerCard server={server} showViewButton={showViewButton} />
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="relative w-24 h-24 mb-6">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-extra/20 rounded-full blur-lg"></div>
						<div className="relative flex items-center justify-center w-full h-full">
							<Server className="h-16 w-16 text-muted-foreground" />
						</div>
					</div>
					<h3 className="text-2xl font-semibold text-foreground mb-3">No servers found</h3>
					<p className="text-muted-foreground max-w-md">
						{searchTerm
							? "We couldn't find any servers matching your search"
							: showViewButton
								? "You don't have any managed servers yet"
								: "You don't have any servers with sufficient permissions to add the bot"}
					</p>
				</div>
			)}
		</div>
	);
};
