'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { RefreshCw, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUserServers } from '@/lib/api';
import logger from '@/lib/logger';
import { getAvatarUrl } from '@/lib/auth/getAvatarUrl';
import { PartialUser } from '@/types/api/bindings/PartialUser';
import { DashboardGuild } from '@/types/api/bindings/DashboardGuild';
import Image from 'next/image';
import { ServerList } from '@/components/dashboard/ServerList';

const AllServers: React.FC = () => {
	const [userData, setUserData] = useState<PartialUser | null>(null);
	const [managedServers, setManagedServers] = useState<DashboardGuild[]>([]);
	const [yourServers, setYourServers] = useState<DashboardGuild[]>([]);
	const [managedSearchTerm, setManagedSearchTerm] = useState('');
	const [yourSearchTerm, setYourSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'managed' | 'yours'>('managed');
	const [refreshing, setRefreshing] = useState(false);

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

	const fetchServers = async (refetch = false) => {
		setIsLoading(true);
		if (refetch) setRefreshing(true);

		try {
			const response = await getUserServers(refetch);
			const { guilds, bot_in_guilds } = response;

			const managed = guilds.filter((server) => bot_in_guilds.includes(server.id));
			const yours = guilds.filter((server) => !bot_in_guilds.includes(server.id));

			setManagedServers(managed);
			setYourServers(yours);

			if (refetch) {
				toast.success('Servers refreshed');
			}
		} catch (error) {
			console.error('Failed to fetch servers:', error);
			toast.error('Failed to fetch servers');
		} finally {
			setIsLoading(false);
			if (refetch) {
				setTimeout(() => setRefreshing(false), 500);
			}
		}
	};

	useEffect(() => {
		fetchServers();
	}, []);

	if (!userData && isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
					<p className="text-sm text-muted-foreground">Loading servers...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pt-24 pb-16 px-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
					<div className="flex items-center gap-4">
						<div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
							{userData ? (
								<Image
									src={getAvatarUrl(userData)}
									alt={userData.global_name || userData.username || 'User'}
									fill
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<User size={20} className="text-muted-foreground" />
								</div>
							)}
						</div>
						<div>
							<h1 className="text-xl font-semibold">
								{userData?.global_name || userData?.username || 'Dashboard'}
							</h1>
							{userData?.username && (
								<p className="text-sm text-muted-foreground">@{userData.username}</p>
							)}
						</div>
					</div>
					<button
						onClick={() => fetchServers(true)}
						disabled={refreshing}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
					>
						<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
						{refreshing ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>

				{/* Tabs */}
				<div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-8">
					<button
						onClick={() => setActiveTab('managed')}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
							activeTab === 'managed'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Managed ({managedServers.length})
					</button>
					<button
						onClick={() => setActiveTab('yours')}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
							activeTab === 'yours'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Your Servers ({yourServers.length})
					</button>
				</div>

				{/* Content */}
				{activeTab === 'managed' ? (
					<ServerList
						servers={managedServers}
						searchTerm={managedSearchTerm}
						setSearchTerm={setManagedSearchTerm}
						showViewButton={true}
						isLoading={isLoading}
					/>
				) : (
					<ServerList
						servers={yourServers}
						searchTerm={yourSearchTerm}
						setSearchTerm={setYourSearchTerm}
						showViewButton={false}
						isLoading={isLoading}
					/>
				)}
			</div>
		</div>
	);
};

export default AllServers;
