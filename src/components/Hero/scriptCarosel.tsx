'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiBox, FiChevronRight } from 'react-icons/fi';
import { CommonCard } from '../scripts/ScriptCard';
import { anonexecuteSettings } from '@/lib/api';
import type { TemplateShopProps } from '@/types/script';

export const TemplateCarousel = () => {
	const [templates, setTemplates] = useState<TemplateShopProps[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(0);

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				setIsLoading(true);

				const payload = {
					operation: 'View',
					setting: 'template_shop_public_list',
					fields: {}
				};
				const settingsResponse = await anonexecuteSettings(payload);

				const templatesData = settingsResponse.fields;

				if (Array.isArray(templatesData)) {
					setTemplates(templatesData);
				} else {
					setError('Failed to fetch repository data. Using fallback data.');
				}
			} catch (err) {
				setError('Failed to fetch repository data. Using fallback data.');
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

	const getItemsPerView = () => {
		if (viewportWidth >= 1280) return 3; // xl
		if (viewportWidth >= 768) return 2; // md
		return 1; // mobile
	};

	const itemsPerPage = getItemsPerView();
	const totalPages = Math.ceil(templates.length / itemsPerPage);

	const getVisibleTemplates = () => {
		const start = currentPage * itemsPerPage;
		return templates.slice(start, start + itemsPerPage);
	};

	const next = () => {
		setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
	};

	const prev = () => {
		setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
	};

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
		<section className="py-20 relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl"></div>
			<div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"></div>

			<div className="container mx-auto px-4 relative">
				{/* Section header */}
				<div className="text-center mb-16 relative">
					<div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-3xl -z-10"></div>
					<div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-3xl -z-10"></div>

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

				{/* Loading spinner */}
				{isLoading && (
					<div className="flex justify-center items-center h-64">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
							className="rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"
						></motion.div>
					</div>
				)}

				{/* Error state */}
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
						{/* Top Navigation */}
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
									aria-label="Previous"
								>
									<FiChevronLeft className="w-5 h-5" />
								</motion.button>
								<motion.button
									variants={buttonVariants}
									whileHover="hover"
									whileTap="tap"
									onClick={next}
									className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300 shadow-sm"
									aria-label="Next"
								>
									<FiChevronRight className="w-5 h-5" />
								</motion.button>
							</div>
						</div>

						{/* Carousel items */}
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

						{/* Carousel dots */}
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
						className="flex flex-col items-center justify-center h-64 bg-card rounded-lg border border-border p-6 text-center"
					>
						<FiBox className="w-12 h-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground text-lg">No templates found.</p>
					</motion.div>
				)}
			</div>
		</section>
	);
};
