'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter } from 'react-icons/fi';
import type { TemplateShopProps } from '@/types/script';
import { CommonCard } from './ScriptCard';

export const TemplateShop = ({ data }: { data: TemplateShopProps[] }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredData, setFilteredData] = useState(data);

	useEffect(() => {
		setFilteredData(
			data.filter(
				(template) =>
					template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
					template.owner_guild.toLowerCase().includes(searchTerm.toLowerCase())
			)
		);
	}, [searchTerm, data]);

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="mb-16 text-center">
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="font-monster font-bold text-4xl md:text-5xl lg:text-6xl text-transparent mb-6"
				>
					Script Shop
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto"
				>
					Discover premium, ready-to-use Script built by the AntiRaid community to enhance your
					Discord server experience. Browse, preview, and install with just a few clicks.
				</motion.p>
			</div>

			<div className="max-w-3xl mx-auto mb-12">
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<FiSearch className="text-muted-foreground" />
					</div>
					<input
						type="text"
						placeholder="Search script by name, description, or guild..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground"
					/>
					<button className="absolute inset-y-0 right-0 pr-3 flex items-center">
						<FiFilter className="text-muted-foreground hover:text-primary transition-colors" />
					</button>
				</div>
			</div>

			<AnimatePresence>
				{filteredData.length === 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="text-center py-16"
					>
						<p className="text-muted-foreground text-lg">
							No script found matching your search criteria.
						</p>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
					>
						{filteredData.map((template, index) => (
							<motion.div
								key={template.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
							>
								<CommonCard template={template} />
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
