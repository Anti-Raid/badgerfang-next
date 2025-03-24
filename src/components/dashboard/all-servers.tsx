'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCcw, FiEye } from 'react-icons/fi';
import type { Servers } from '@/types/dashboard/servers';

interface AllServersProps {
	servers: Servers[];
}

const AllServers: React.FC<AllServersProps> = ({ servers }) => {
	const [searchTerm, setSearchTerm] = useState('');

	return (
		<main className="container mx-auto p-4">
			{/* User Info */}
			<div className="flex items-center mb-6 gap-4">
				<img
					src="/user-pfp.webp"
					onError={(e) => (e.currentTarget.src = './logo.webp')}
					alt="User Avatar"
					className="w-20 h-20 rounded-full border-2 border-purple-500"
				/>
				<div>
					<h2 className="text-white text-lg font-semibold">Ranveer Soni</h2>
					<p className="text-gray-400 text-sm">ranveersoni</p>
				</div>
			</div>

			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-white text-2xl font-bold flex items-center gap-2">
					Servers With AntiRaid <span className="text-gray-400">(9)</span>
				</h1>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="flex items-center gap-2 bg-[#3c2854] text-white px-4 py-2 rounded-md hover:bg-[#4c3266] transition-colors"
				>
					<FiRefreshCcw className="text-lg" />
					Refresh Server List
				</motion.button>
			</div>

			{/* Notice */}
			<p className="text-red-400 mb-6">
				You may or may not have permission to view or modify these servers...
			</p>

			{/* Search Input */}
			<div className="mb-8">
				<input
					type="text"
					placeholder="Search for a server"
					className="w-full bg-[#3c2854] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{/* Server Card */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{servers.map((server, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="bg-[#1a1225] rounded-lg p-6 border border-[#3c2854]"
					>
						<div className="flex items-center gap-3 mb-4">
							<img
								src={server.icon || '/placeholder.svg'}
								alt={`${server.name} icon`}
								className="w-10 h-10 rounded-lg"
							/>
							<h3 className="text-white font-semibold">{server.name}</h3>
						</div>
						<p className="text-green-400 text-sm mb-4">{server.status}</p>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="flex items-center gap-2 bg-[#8100BD] text-white px-4 py-2 rounded-md w-full justify-center hover:bg-[#7c3aed] transition-colors"
						>
							<FiEye />
							View
						</motion.button>
					</motion.div>
				))}
			</div>
		</main>
	);
};

export default AllServers;
