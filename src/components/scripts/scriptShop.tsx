'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiPackage, FiZap, FiGrid, FiList } from 'react-icons/fi';
import type { TemplateShopProps } from '@/types/script';
import { CommonCard } from './ScriptCard';

export const TemplateShop = ({ data }: { data: TemplateShopProps[] }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredData, setFilteredData] = useState<TemplateShopProps[]>([]);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const searchRef = useRef<HTMLInputElement>(null);
	const headerRef = useRef(null);
	const isInView = useInView(headerRef, { once: true, margin: '-100px' });

	useEffect(() => {
		if (Array.isArray(data)) {
			setFilteredData(
				data.filter(
					(template) =>
						template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
						template.owner_guild.toLowerCase().includes(searchTerm.toLowerCase())
				)
			);
		} else {
			setFilteredData([]);
		}
	}, [searchTerm, data]);

	const clearSearch = () => {
		setSearchTerm('');
		if (searchRef.current) {
			searchRef.current.focus();
		}
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: 'spring', stiffness: 100 }
		}
	};

	return (
		<div className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 py-16">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div
					className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse"
					style={{ animationDuration: '15s' }}
				></div>
				<div
					className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse"
					style={{ animationDuration: '20s' }}
				></div>
				<div
					className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px] animate-pulse"
					style={{ animationDuration: '12s' }}
				></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<div className="mb-20 text-center" ref={headerRef}>
					<motion.h1
						initial={{ opacity: 0, y: -20 }}
						animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="relative font-monster font-bold text-5xl md:text-6xl lg:text-7xl mb-6 inline-block"
					>
						<span className="relative z-10">Script</span>{' '}
						<span className="relative">
							<span className="absolute -inset-1 blur-md bg-gradient-to-r from-primary to-accent opacity-30 rounded-lg"></span>
							<span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Marketplace
							</span>
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
					>
						Discover premium, ready-to-use scripts built by the AntiRaid community to enhance your
						Discord server experience. Browse, preview, and install with just a few clicks.
					</motion.p>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="max-w-4xl mx-auto mb-16 relative"
				>
					<div
						className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}
					>
						{/* Glowing border effect */}
						<div
							className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity duration-300 ${isSearchFocused ? 'opacity-100 animate-gradient-x' : ''}`}
						></div>

						<div className="relative bg-card/80 backdrop-blur-md border border-border hover:border-primary/30 rounded-2xl shadow-xl transition-all duration-300 flex items-center overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

							<div className="pl-6 text-primary">
								<FiSearch className="w-5 h-5" />
							</div>

							<input
								ref={searchRef}
								type="text"
								placeholder="Search scripts by name, description, or guild..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onFocus={() => setIsSearchFocused(true)}
								onBlur={() => setIsSearchFocused(false)}
								className="w-full px-4 py-5 bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground text-foreground font-medium text-lg"
							/>

							{searchTerm && (
								<button
									onClick={clearSearch}
									className="mr-2 p-2 hover:bg-primary/10 rounded-full transition-colors"
								>
									<FiX className="text-muted-foreground hover:text-primary transition-colors" />
								</button>
							)}

							<div className="h-10 w-px bg-border mx-2"></div>

							<button className="p-6 hover:bg-primary/10 transition-colors flex items-center justify-center">
								<FiFilter className="text-primary w-5 h-5" />
							</button>
						</div>
					</div>

					{/* View mode toggle */}
					<div className="flex justify-end mt-4">
						<div className="bg-card/80 backdrop-blur-md rounded-xl border border-border p-1 flex space-x-1">
							<button
								onClick={() => setViewMode('grid')}
								className={`p-2 rounded-lg flex items-center justify-center transition-all ${
									viewMode === 'grid'
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-primary/10'
								}`}
							>
								<FiGrid className="w-4 h-4" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`p-2 rounded-lg flex items-center justify-center transition-all ${
									viewMode === 'list'
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-primary/10'
								}`}
							>
								<FiList className="w-4 h-4" />
							</button>
						</div>
					</div>
				</motion.div>

				<AnimatePresence mode="wait">
					{filteredData.length === 0 ? (
						<motion.div
							key="empty"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ type: 'spring', stiffness: 300, damping: 25 }}
							className="text-center py-20 max-w-2xl mx-auto"
						>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
								className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
							>
								<FiPackage className="w-12 h-12 text-primary" />
							</motion.div>

							<motion.h3
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="text-2xl font-bold mb-4 font-monster"
							>
								No scripts found
							</motion.h3>

							<motion.p
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="text-muted-foreground text-lg mb-8"
							>
								We couldn't find any scripts matching your search criteria.
							</motion.p>

							<motion.button
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setSearchTerm('')}
								className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center mx-auto gap-2 hover:bg-primary/90 transition-colors"
							>
								<FiZap className="w-4 h-4" />
								View all scripts
							</motion.button>
						</motion.div>
					) : (
						<motion.div
							key="results"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							exit={{ opacity: 0 }}
							className={
								viewMode === 'grid'
									? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
									: 'flex flex-col space-y-6'
							}
						>
							{filteredData.map((template, index) => (
								<motion.div
									key={template.id}
									variants={itemVariants}
									custom={index}
									whileHover={{ y: -5, transition: { duration: 0.2 } }}
									className={viewMode === 'list' ? 'max-w-4xl mx-auto w-full' : ''}
								>
									<CommonCard template={template} />
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				{filteredData.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
						className="mt-16 text-center"
					>
						<p className="text-muted-foreground">
							Showing <span className="text-primary font-medium">{filteredData.length}</span>{' '}
							scripts
						</p>
					</motion.div>
				)}
			</div>
		</div>
	);
};
