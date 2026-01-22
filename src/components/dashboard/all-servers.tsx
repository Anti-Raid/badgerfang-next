'use client';

import type React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userServersOptions } from '@/lib/api';
import logger from '@/lib/logger';
import { getAvatarUrl } from '@/lib/auth/getAvatarUrl';
import { PartialUser } from '@/types/api/bindings/PartialUser';
import { DashboardGuild } from '@/types/api/bindings/DashboardGuild';
import { Image } from '@unpic/react';
import { ServerList } from '@/components/dashboard/ServerList';
import { useDebouncedSearch } from '@/lib/pacer';

const AllServers: React.FC = () => {
	const [userData, setUserData] = useState<PartialUser | null>(null);
	const [managedSearchTerm, setManagedSearchTerm] = useState('');
	const debouncedManagedSearch = useDebouncedSearch(managedSearchTerm, 300);
	const [yourSearchTerm, setYourSearchTerm] = useState('');
	const debouncedYourSearch = useDebouncedSearch(yourSearchTerm, 300);
	const [activeTab, setActiveTab] = useState('managed');
	const [refreshing, setRefreshing] = useState(false);
	const queryClient = useQueryClient();

	const { data: response, isLoading, refetch, isRefetching } = useQuery(userServersOptions);

	const servers = useMemo(() => response?.guilds || [], [response?.guilds]);
	const managedServers = useMemo(() => {
		if (!response) return [];
		return servers.filter((server) => response.bot_in_guilds.includes(server.id));
	}, [servers, response?.bot_in_guilds]);
	const yourServers = useMemo(() => {
		if (!response) return [];
		return servers.filter((server) => !response.bot_in_guilds.includes(server.id));
	}, [servers, response?.bot_in_guilds]);

	useEffect(() => {
		const authUser = localStorage.getItem('authUser');
		if (authUser) {
			try {
				setUserData(JSON.parse(authUser));
			} catch (error) {
				logger.error('AllServers: Failed to parse user data', error);
				setUserData(null);
			}
		}
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			// Invalidate and refetch with refresh flag
			await queryClient.invalidateQueries({ queryKey: ['userServers'] });
			// Manually call getUserServers with refresh=true
			const { getUserServers } = await import('@/lib/api');
			const refreshed = await getUserServers(true);
			queryClient.setQueryData(['userServers'], refreshed);
			toast.success('Servers refreshed successfully');
		} catch (error) {
			console.error('Failed to fetch servers:', error);
			toast.error('Failed to fetch servers');
		} finally {
			setTimeout(() => setRefreshing(false), 500);
		}
	};

	if (!userData && isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<main className="container mx-auto p-4 max-w-7xl">
			{/* User Profile Header */}
			<div className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-xl border border-border/50 transition-all duration-300 hover:shadow-primary/5">
				<div className="flex flex-col sm:flex-row items-center gap-6">
					<div className="relative group">
						<div className="absolute inset-0 bg-gradient-to-r from-primary to-extra rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
						<Image
							src={userData ? getAvatarUrl(userData) : '/logo.webp'}
							alt="User Avatar"
							height={20}
							width={20}
							className="relative w-20 h-20 rounded-full border-2 border-primary object-cover"
						/>
						<div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-card z-10"></div>
					</div>
					<div className="text-center sm:text-left">
						<h2 className="text-foreground text-2xl font-bold">
							{userData?.global_name || userData?.username || 'Unknown User'}
						</h2>
						<p className="text-muted-foreground">@{userData?.username || 'unknown1234'}</p>
					</div>
					<button
						className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-accent-foreground px-5 py-2.5 rounded-lg transition-all duration-300 ml-auto transform hover:scale-105 hover:shadow-lg"
						onClick={handleRefresh}
						disabled={refreshing || isRefetching}
					>
						<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
						<span className="hidden sm:inline font-medium">
							{refreshing ? 'Refreshing...' : 'Refresh Servers'}
						</span>
					</button>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="flex mb-8 border-b border-border/50 relative">
				<button
					className={`px-6 py-3 font-medium text-lg transition-all duration-300 relative ${
						activeTab === 'managed' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
					}`}
					onClick={() => setActiveTab('managed')}
				>
					Managed Servers ({managedServers.length})
					{activeTab === 'managed' && (
						<div
							className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-extra"
							style={{ animation: 'slideInFromRight 0.3s ease-out' }}
						/>
					)}
				</button>
				<button
					className={`px-6 py-3 font-medium text-lg transition-all duration-300 relative ${
						activeTab === 'yours' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
					}`}
					onClick={() => setActiveTab('yours')}
				>
					Your Servers ({yourServers.length})
					{activeTab === 'yours' && (
						<div
							className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-extra"
							style={{ animation: 'slideInFromRight 0.3s ease-out' }}
						/>
					)}
				</button>
				<div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10"></div>
			</div>

			{/* Active Tab Content */}
			<div className="transition-all duration-300">
				{activeTab === 'managed' ? (
					<div className="animate-[theme-fade_0.3s_ease-in-out]">
						<ServerList
							servers={managedServers}
							searchTerm={debouncedManagedSearch}
							setSearchTerm={setManagedSearchTerm}
							showViewButton={true}
							isLoading={isLoading}
						/>
					</div>
				) : (
					<div className="animate-[theme-fade_0.3s_ease-in-out]">
						<ServerList
							servers={yourServers}
							searchTerm={debouncedYourSearch}
							setSearchTerm={setYourSearchTerm}
							showViewButton={false}
							isLoading={isLoading}
						/>
					</div>
				)}
			</div>
		</main>
	);
};

export default AllServers;
