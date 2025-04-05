'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiRefreshCcw, FiSearch, FiServer, FiShield } from 'react-icons/fi';
import { FaDiscord, FaCrown, FaUserShield } from 'react-icons/fa';
import { getUserServers } from '@/lib/api';
import { Server, ApiResponse } from '@/types/dashboard/servers';
import { AuthUser } from '@/types/user';
import { useRouter } from 'next/navigation';
import { supportConfig } from '@/lib/data/support';

// Discord permission flags
const DISCORD_PERMISSIONS = {
	ADMINISTRATOR: 0x8,
	MANAGE_GUILD: 0x20,
	MANAGE_CHANNELS: 0x10,
	MANAGE_ROLES: 0x10000000,
	MANAGE_MESSAGES: 0x2000,
	MANAGE_WEBHOOKS: 0x80000000
};

// Function to check if user has sufficient permissions to manage bot
const canManageBot = (permissions: number): boolean => {
	return !!(
		permissions & DISCORD_PERMISSIONS.ADMINISTRATOR ||
		permissions & DISCORD_PERMISSIONS.MANAGE_GUILD
	);
};

// Function to get readable permission names
const getPermissionNames = (permissions: number): string[] => {
	const permNames: string[] = [];

	if (permissions & DISCORD_PERMISSIONS.ADMINISTRATOR) {
		return ['Administrator']; // Admin has all permissions
	}

	if (permissions & DISCORD_PERMISSIONS.MANAGE_GUILD) permNames.push('Manage Server');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_CHANNELS) permNames.push('Manage Channels');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_ROLES) permNames.push('Manage Roles');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_MESSAGES) permNames.push('Manage Messages');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_WEBHOOKS) permNames.push('Manage Webhooks');

	return permNames.length ? permNames : ['Limited Access'];
};

const AllServers: React.FC = () => {
	const [userData, setUserData] = useState<AuthUser | null>(null);
	const [servers, setServers] = useState<Server[]>([]);
	const [managedServers, setManagedServers] = useState<Server[]>([]);
	const [yourServers, setYourServers] = useState<Server[]>([]);
	const [managedSearchTerm, setManagedSearchTerm] = useState('');
	const [yourSearchTerm, setYourSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('managed');
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const authUser = localStorage.getItem('authUser');
		if (authUser) {
			setUserData(JSON.parse(authUser));
		}
	}, []);

	const fetchServers = async (refetch = false) => {
		setIsLoading(true);
		if (refetch) setRefreshing(true);

		try {
			const response: ApiResponse = await getUserServers(refetch);
			const { guilds, has_bot } = response;
			setServers(guilds);

			const managed = guilds.filter((server) => has_bot.includes(server.id));
			const yours = guilds.filter(
				(server) => !has_bot.includes(server.id) && canManageBot(server.permissions)
			);

			setManagedServers(managed);
			setYourServers(yours);
		} catch (error) {
			console.error('Failed to fetch servers:', error);
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
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
			</div>
		);
	}

	return (
		<main className="container mx-auto p-4 max-w-7xl">
			{/* User Profile Header */}
			<div className="bg-card rounded-xl p-6 mb-8 shadow-lg border border-[#3c2854] backdrop-blur-sm bg-opacity-60">
				<div className="flex flex-col sm:flex-row items-center gap-6">
					<div className="relative">
						<img
							src={userData?.user.avatar || '/logo.webp'}
							alt="User Avatar"
							className="w-20 h-20 rounded-full border-2 border-purple-500 object-cover"
						/>
						<div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-card"></div>
					</div>
					<div className="text-center sm:text-left">
						<h2 className="text-white text-2xl font-bold">
							{userData?.user.display_name || userData?.user.username}
						</h2>
						<p className="text-gray-400">@{userData?.user.username}</p>
					</div>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="flex items-center gap-2 bg-[#3c2854] text-white px-4 py-2 rounded-md hover:bg-[#4c3266] transition-colors ml-auto"
						onClick={() => fetchServers(true)}
						disabled={refreshing}
					>
						<FiRefreshCcw className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
						<span className="hidden sm:inline">
							{refreshing ? 'Refreshing...' : 'Refresh Servers'}
						</span>
					</motion.button>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="flex mb-6 border-b border-[#3c2854]">
				<button
					className={`px-6 py-3 font-medium text-lg transition-colors ${
						activeTab === 'managed'
							? 'text-purple-400 border-b-2 border-purple-500'
							: 'text-gray-400 hover:text-white'
					}`}
					onClick={() => setActiveTab('managed')}
				>
					Managed Servers ({managedServers.length})
				</button>
				<button
					className={`px-6 py-3 font-medium text-lg transition-colors ${
						activeTab === 'yours'
							? 'text-purple-400 border-b-2 border-purple-500'
							: 'text-gray-400 hover:text-white'
					}`}
					onClick={() => setActiveTab('yours')}
				>
					Your Servers ({yourServers.length})
				</button>
			</div>

			{/* Active Tab Content */}
			<AnimatePresence mode="wait">
				{activeTab === 'managed' ? (
					<motion.div
						key="managed"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						<ServerList
							servers={managedServers}
							searchTerm={managedSearchTerm}
							setSearchTerm={setManagedSearchTerm}
							showViewButton={true}
							isLoading={isLoading}
						/>
					</motion.div>
				) : (
					<motion.div
						key="yours"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						<ServerList
							servers={yourServers}
							searchTerm={yourSearchTerm}
							setSearchTerm={setYourSearchTerm}
							showViewButton={false}
							isLoading={isLoading}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
};

const ServerList: React.FC<{
	servers: Server[];
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
			<div className="relative mb-6">
				<FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Search for a server"
					className="w-full bg-[#3c2854] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="bg-card rounded-lg p-6 border border-[#3c2854] animate-pulse h-40"
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
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<FiServer className="text-5xl text-gray-500 mb-4" />
					<h3 className="text-xl font-semibold text-white mb-2">No servers found</h3>
					<p className="text-gray-400">
						{searchTerm
							? "We couldn't find any servers matching your search"
							: showViewButton
								? "You don't have any managed servers yet"
								: "You don't have any servers with sufficient permissions to add the bot"}
					</p>
					{!showViewButton && !searchTerm && servers.length === 0 && (
						<div className="mt-4 p-4 bg-[#3c2854] rounded-lg max-w-md text-sm">
							<p className="text-gray-300 mb-2">
								<strong>Note:</strong> You need{' '}
								<span className="text-purple-300">Manage Server</span> or{' '}
								<span className="text-purple-300">Administrator</span> permissions to add bots to a
								server.
							</p>
							<p className="text-gray-300">
								If you don't see your servers, make sure you're logged in with the correct Discord
								account.
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const ServerCard: React.FC<{ server: Server; showViewButton: boolean }> = ({
	server,
	showViewButton
}) => {
	const router = useRouter();
	const permissionValue = server.permissions;
	const permissionNames = getPermissionNames(permissionValue);
	const isAdministrator = permissionNames.includes('Administrator');

	const handleViewClick = () => {
		router.push(`/dashboard/guilds/?id=${server.id}`);
	};

	const handleInviteClick = () => {
		const inviteUrl = supportConfig.invite.full.replace('{guild_id}', server.id);
		window.location.href = inviteUrl;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			whileHover={{ y: -5 }}
			className="bg-card rounded-lg overflow-hidden border border-[#3c2854] shadow-lg"
		>
			<div className="h-16 bg-gradient-to-r from-purple-900 to-[#3c2854]"></div>
			<div className="p-6 pt-0 -mt-8">
				<div className="flex items-start gap-3 mb-4">
					<img
						src={server.avatar || '/logo.webp'}
						alt={`${server.name} icon`}
						className="w-16 h-16 rounded-lg border-4 border-card bg-[#3c2854]"
					/>
					<div className="mt-8">
						<h3 className="text-white font-bold text-lg truncate max-w-[180px]">{server.name}</h3>
					</div>
				</div>

				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-1">
						{isAdministrator ? (
							<div className="bg-purple-700 px-3 py-1 rounded-full text-xs text-white flex items-center gap-1">
								<FaCrown className="text-yellow-400" />
								<span>Administrator</span>
							</div>
						) : (
							<div className="bg-[#3c2854] px-3 py-1 rounded-full text-xs text-purple-300 flex items-center gap-1">
								<FiShield />
								<span>{permissionNames[0]}</span>
							</div>
						)}
					</div>
					<div className="text-xs text-gray-400">ID: {server.id.slice(0, 8)}...</div>
				</div>

				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					className={`flex items-center gap-2 px-4 py-3 rounded-md w-full justify-center transition-colors ${
						showViewButton
							? 'bg-[#3c2854] text-white hover:bg-[#4c3266]'
							: 'bg-purple-600 text-white hover:bg-purple-700'
					}`}
					onClick={showViewButton ? handleViewClick : handleInviteClick}
				>
					{showViewButton ? (
						<>
							<FiEye className="text-lg" /> Manage Server
						</>
					) : (
						<>
							<FaDiscord className="text-lg" /> Add Bot
						</>
					)}
				</motion.button>
			</div>
		</motion.div>
	);
};

export default AllServers;
