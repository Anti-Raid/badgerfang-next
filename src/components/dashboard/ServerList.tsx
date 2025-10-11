import React from 'react';
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
	const filteredServers = servers.filter((server) =>
		server.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div>
			<div className="relative mb-8 group">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-extra/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
				<div className="relative bg-accent/80 backdrop-blur-sm rounded-xl overflow-hidden border shadow-lg transition-all duration-300 group-hover:shadow-primary/10">
					<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<input
						type="text"
						placeholder="Search for a server"
						className="w-full bg-transparent text-foreground pl-12 pr-4 py-4 focus:outline-none placeholder-muted-foreground"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="bg-card/80 rounded-xl p-6 border border-border/30 animate-pulse h-48 shadow-lg"
						></div>
					))}
				</div>
			) : filteredServers.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredServers.map((server) => (
						<ServerCard key={server.id} server={server} showViewButton={showViewButton} />
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
							? 'We couldn&apos;t find any servers matching your search'
							: showViewButton
								? 'You don&apos;t have any managed servers yet'
								: 'You don&apos;t have any servers with sufficient permissions to add the bot'}
					</p>
					{!showViewButton && !searchTerm && servers.length === 0 && (
						<div className="mt-6 p-5 bg-accent/50 backdrop-blur-sm rounded-xl max-w-md text-sm border border-border/30 shadow-lg">
							<p className="text-muted-foreground mb-3">
								<strong>Note:</strong> You need{' '}
								<span className="text-primary font-medium">Manage Server</span> or{' '}
								<span className="text-primary font-medium">Administrator</span> permissions to add
								bots to a server.
							</p>
							<p className="text-muted-foreground">
								If you don&apos;t see your servers, make sure you&apos;re logged in with the correct
								Discord account.
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
