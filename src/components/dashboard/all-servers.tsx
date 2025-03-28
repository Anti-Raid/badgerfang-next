'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiRefreshCcw } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { getUserServers } from '@/lib/api'; 
import { Server, ApiResponse } from '@/types/dashboard/servers';
import { AuthUser } from '@/types/user';
import { useRouter } from 'next/navigation';
import { supportConfig } from '@/lib/data/support';

const AllServers: React.FC = () => {
    const [userData, setUserData] = useState<AuthUser | null>(null);
    const [servers, setServers] = useState<Server[]>([]);
    const [managedServers, setManagedServers] = useState<Server[]>([]);
    const [yourServers, setYourServers] = useState<Server[]>([]);
    const [managedSearchTerm, setManagedSearchTerm] = useState('');
    const [yourSearchTerm, setYourSearchTerm] = useState('');

    useEffect(() => {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
            setUserData(JSON.parse(authUser));
        }
    }, []);

    const fetchServers = async (refetch = false) => {
        try {
            const response: ApiResponse = await getUserServers(refetch ? '?refresh=true' : '');
            const { guilds, has_bot } = response;
            setServers(guilds);

            const managed = guilds.filter(server => has_bot.includes(server.id));
            const yours = guilds.filter(server => !has_bot.includes(server.id));

            setManagedServers(managed);
            setYourServers(yours);
        } catch (error) {
            console.error('Failed to fetch servers:', error);
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <main className="container mx-auto p-4">
            <div className="flex items-center mb-6 gap-4">
                <img
                    src={userData.user.avatar}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full border-2 border-purple-500"
                />
                <div>
                    <h2 className="text-white text-lg font-semibold">{userData.user.display_name || userData.user.username}</h2>
                    <p className="text-gray-400 text-sm">{userData.user.username}</p>
                </div>
            </div>

            <div className="flex justify-end mb-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-[#3c2854] text-white px-4 py-2 rounded-md hover:bg-[#4c3266] transition-colors"
                    onClick={() => fetchServers(true)}
                >
                    <FiRefreshCcw className="text-lg" />
                    Refresh Server List
                </motion.button>
            </div>

            <ServerList title="Managed Servers" servers={managedServers} searchTerm={managedSearchTerm} setSearchTerm={setManagedSearchTerm} showViewButton />
            <ServerList title="Your Server List" servers={yourServers} searchTerm={yourSearchTerm} setSearchTerm={setYourSearchTerm} showViewButton={false} />
        </main>
    );
};

const ServerList: React.FC<{ title: string; servers: Server[]; searchTerm: string; setSearchTerm: (value: string) => void; showViewButton: boolean; }> = ({ title, servers, searchTerm, setSearchTerm, showViewButton }) => (
    <div className="mb-8">
        <h2 className="text-white text-xl font-bold mb-4">{title}</h2>
        <input
            type="text"
            placeholder="Search for a server"
            className="w-full bg-[#3c2854] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.filter(server => server.name.toLowerCase().includes(searchTerm.toLowerCase())).map(server => (
                <ServerCard key={server.id} server={server} showViewButton={showViewButton} />
            ))}
        </div>
    </div>
);

const ServerCard: React.FC<{ server: Server; showViewButton: boolean }> = ({ server, showViewButton }) => {
    const router = useRouter();

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
            className="bg-[#1a1225] rounded-lg p-6 border border-[#3c2854]"
        >
            <div className="flex items-center gap-3 mb-4">
                <img
                    src={server.avatar || '/logo.webp'}
                    alt={`${server.name} icon`}
                    className="w-10 h-10 rounded-lg"
                />
                <h3 className="text-white font-semibold">{server.name}</h3>
            </div>
            <p className="text-green-400 text-sm mb-4">Permissions: {server.permissions}</p>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-[#8100BD] text-white px-4 py-2 rounded-md w-full justify-center hover:bg-[#7c3aed] transition-colors"
                onClick={showViewButton ? handleViewClick : handleInviteClick}
            >
                {showViewButton ? <><FiEye /> View</> : <><FaDiscord /> Invite</>}
            </motion.button>
        </motion.div>
    );
};

export default AllServers;
