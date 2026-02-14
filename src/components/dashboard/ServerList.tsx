import React, { useEffect, useRef } from 'react';
import { DashboardGuild } from '@/types/api/bindings/DashboardGuild';
import { Search, Server } from 'lucide-react';
import { ServerCard } from '@/components/dashboard/ServerCard';

export const ServerList: React.FC<{
	servers: DashboardGuild[];
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	showViewButton: boolean;
	isLoading: boolean;
}> = ({ servers, searchTerm, setSearchTerm, showViewButton, isLoading }) => {
	const searchInputRef = useRef<HTMLInputElement>(null);

	const filteredServers = servers.filter((server) =>
		server.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

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

	return (
		<div>
			{/* Search */}
			<div className="relative mb-6">
				<Search
					size={18}
					className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
				/>
				<input
					ref={searchInputRef}
					type="text"
					placeholder="Search servers..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full pl-11 pr-20 py-3 bg-muted/50 border border-border rounded-xl text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
				/>
				<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
					<kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono text-[10px]">
						/
					</kbd>
					<span className="hidden sm:inline">to search</span>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
							<div className="flex items-start gap-4 mb-4">
								<div className="w-12 h-12 rounded-lg bg-muted" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-2/3 bg-muted rounded" />
									<div className="h-3 w-1/3 bg-muted rounded" />
								</div>
							</div>
							<div className="h-10 w-full bg-muted rounded-lg" />
						</div>
					))}
				</div>
			) : filteredServers.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredServers.map((server) => (
						<ServerCard key={server.id} server={server} showViewButton={showViewButton} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<Server size={48} className="text-muted-foreground/50 mb-4" />
					<h3 className="text-lg font-semibold mb-2">No servers found</h3>
					<p className="text-sm text-muted-foreground max-w-sm">
						{searchTerm
							? 'No servers match your search criteria.'
							: showViewButton
								? "You don't have any managed servers yet."
								: "You don't have any servers with sufficient permissions to add the bot."}
					</p>
					{!showViewButton && !searchTerm && servers.length === 0 && (
						<div className="mt-6 p-4 bg-muted/50 rounded-xl max-w-sm text-sm text-muted-foreground">
							<p>
								You need <span className="text-primary font-medium">Manage Server</span> or{' '}
								<span className="text-primary font-medium">Administrator</span> permissions to add
								bots.
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
