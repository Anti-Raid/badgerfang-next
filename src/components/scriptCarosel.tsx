'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiBox } from 'react-icons/fi';
import { CommonCard } from './scripts/ScriptCard';
import axios from 'axios';
import type { TemplateShopProps } from '@/types/script';

export const TemplateCarousel = () => {
	const [templates, setTemplates] = useState<TemplateShopProps[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(0);

	// Mock data for templates
	const mockData: TemplateShopProps[] = [
		{
			id: '1',
			name: 'Discord Moderation Suite',
			version: '1.0.0',
			description: 'i love my gf',
			owner_guild: 'RSEnterprises',
			created_at: '2025-12-15T10:30:00Z',
			created_by: 'RS',
			last_updated_at: '2025-12-01T15:45:00Z',
			last_updated_by: 'RS',
			tags: ['moderation', 'auto-mod', 'logs'],
			downloads: 3542,
			rating: 4.8
		},
		{
			id: '2',
			name: 'Welcome System Pro',
			version: '2.1.0',
			description: 'pls dont bite me',
			owner_guild: 'RSEnterprises',
			created_at: '2025-12-20T08:15:00Z',
			created_by: 'RS',
			last_updated_at: '2025-12-28T12:00:00Z',
			last_updated_by: 'RS',
			tags: ['welcome', 'onboarding', 'verification'],
			downloads: 7821,
			rating: 4.6
		},
		{
			id: '3',
			name: 'Hoover Max Extract Pressure Pro model 60',
			version: '1.0.1',
			description: 'dommy mommy',
			owner_guild: 'RSEnterprises',
			created_at: '2025-12-01T14:20:00Z',
			created_by: 'RS',
			last_updated_at: '2025-12-05T09:30:00Z',
			last_updated_by: 'RS',
			tags: ['analytics', 'data', 'automation'],
			downloads: 2135,
			rating: 4.9
		}
	];

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				setIsLoading(true);
				// Fetch repository info (not individual files)
				const response = await axios.get('https://api.github.com/repos/Anti-Raid/auto-slowdown');

				// Create a single template entry for the repository itself
				const repoTemplate: TemplateShopProps = {
					id: '4', // Add after mock data
					name: response.data.name || 'Auto Slowdown',
					version: 'v1.0.0',
					description: response.data.description || 'Luau template for Discord server management',
					owner_guild: 'Anti-Raid',
					created_at: response.data.created_at || new Date().toISOString(),
					created_by: 'Anti-Raid',
					last_updated_at: response.data.updated_at || new Date().toISOString(),
					last_updated_by: 'Anti-Raid',
					tags: ['automation', 'discord', 'luau'],
					downloads: 8423, // Random number for demonstration
					rating: 4.5
				};

				// Combine mock data with the repository data
				setTemplates([...mockData, repoTemplate]);
			} catch (err) {
				console.error('Error fetching repository:', err);
				setError('Failed to fetch repository data. Using fallback data.');
				// Fallback to just mock data if fetch fails
				setTemplates(mockData);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTemplates();

		// Set initial viewport width
		setViewportWidth(window.innerWidth);

		// Update viewport width on resize
		const handleResize = () => {
			setViewportWidth(window.innerWidth);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Determine items per view based on viewport width
	const getItemsPerView = () => {
		if (viewportWidth >= 1280) return 3; // xl
		if (viewportWidth >= 768) return 2; // md
		return 1; // mobile
	};

	// Calculate total pages (each page shows a full group of items)
	const itemsPerPage = getItemsPerView();
	const totalPages = Math.ceil(templates.length / itemsPerPage);

	// Get the visible templates for the current page
	const getVisibleTemplates = () => {
		const start = currentPage * itemsPerPage;
		return templates.slice(start, start + itemsPerPage);
	};

	// Page-based navigation for next and previous buttons
	const next = () => {
		setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
	};

	const prev = () => {
		setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
	};

	// Animation variants for navigation buttons
	const buttonVariants = {
		hover: {
			scale: 1.05,
			boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			transition: { duration: 0.2 }
		},
		tap: {
			scale: 0.95,
			boxShadow: '0 5px 15px -5px rgba(0, 0, 0, 0.1), 0 5px 5px -5px rgba(0, 0, 0, 0.04)',
			transition: { duration: 0.1 }
		}
	};

	return (
		<section className="py-20 bg-gradient-to-b from-background to-accent/5 relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

			<div className="container mx-auto px-4 relative">
				{/* Section Header with Decorative Elements */}
				<div className="text-center mb-16 relative">
					<div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
					<div className="absolute top-1/2 right-1/4 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10"></div>

					<div className="inline-flex items-center gap-4 mb-4">
						<span className="h-px w-8 bg-gradient-to-r to-primary from-transparent"></span>
						<motion.span
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="text-sm text-primary/80 font-monster uppercase tracking-wider"
						>
							Scripts
						</motion.span>
						<span className="h-px w-8 bg-gradient-to-l to-primary from-transparent"></span>
					</div>

					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-4xl md:text-5xl font-bold mb-6 font-monster"
					>
						Browse Our <span className="text-primary">Amazing</span> Scripts that our community has
						made to tailor your server needs
					</motion.h2>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="flex justify-center items-center h-64">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
							className="rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"
						></motion.div>
					</div>
				)}

				{/* Error State */}
				{error && !isLoading && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8 border border-destructive/20"
					>
						{error}
					</motion.div>
				)}

				{/* Carousel */}
				{!isLoading && templates.length > 0 && (
					<div className="relative">
						{/* Top Navigation Buttons */}
						<div className="flex justify-between items-center mb-8 md:mb-12">
							<h3 className="text-xl font-semibold text-foreground/80 font-monster">
								Popular Scripts
								<span className="ml-2 text-sm text-muted-foreground">({templates.length})</span>
							</h3>

							<div className="flex gap-2">
								<motion.button
									variants={buttonVariants}
									whileHover="hover"
									whileTap="tap"
									onClick={prev}
									className="p-3 rounded-full bg-card hover:bg-secondary text-foreground transition-colors duration-300 border border-border shadow-sm"
									aria-label="Previous template"
								>
									<FiChevronLeft className="w-5 h-5" />
								</motion.button>
								<motion.button
									variants={buttonVariants}
									whileHover="hover"
									whileTap="tap"
									onClick={next}
									className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300 shadow-sm"
									aria-label="Next template"
								>
									<FiChevronRight className="w-5 h-5" />
								</motion.button>
							</div>
						</div>

						{/* Carousel Track */}
						<div className="relative overflow-hidden">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentPage}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.4, ease: 'easeInOut' }}
									className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
								>
									{getVisibleTemplates().map((template, idx) => (
										<motion.div
											key={template.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.4, delay: idx * 0.1 }}
										>
											<CommonCard template={template} />
										</motion.div>
									))}
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Carousel Indicators */}
						<div className="flex justify-center mt-10 gap-3">
							{Array.from({ length: totalPages }).map((_, i) => (
								<motion.button
									key={i}
									onClick={() => setCurrentPage(i)}
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.9 }}
									className={`w-2 h-2 rounded-full transition-all duration-300 ${
										i === currentPage ? 'w-6 bg-primary' : 'bg-muted hover:bg-primary/50'
									}`}
									aria-label={`Go to slide ${i + 1}`}
								/>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && templates.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex flex-col items-center justify-center h-64 bg-card rounded-lg border border-border p-8 text-center shadow-md"
					>
						<FiBox className="w-12 h-12 mb-4 text-muted-foreground" />
						<h3 className="text-xl font-semibold mb-2">No Templates Available</h3>
						<p className="text-muted-foreground">Check back later for new templates</p>
					</motion.div>
				)}
			</div>
		</section>
	);
};
