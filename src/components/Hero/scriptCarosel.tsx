'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiBox, FiChevronRight, FiPackage, FiZap, FiShield } from 'react-icons/fi';
import { CommonCard } from '../scripts/ScriptCard';
import { anonexecuteSettings } from '@/lib/api';
import type { TemplateShopProps } from '@/types/script';

export const TemplateCarousel = () => {
	const [templates, setTemplates] = useState<TemplateShopProps[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(0);
	const [isHovering, setIsHovering] = useState(false);

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
		initial: {
			scale: 1,
			boxShadow: '0px 0px 0px rgba(var(--primary), 0.3)'
		},
		hover: {
			scale: 1.05,
			boxShadow: '0px 0px 20px rgba(var(--primary), 0.5)',
			transition: { duration: 0.2, type: 'spring', stiffness: 400 }
		},
		tap: {
			scale: 0.95,
			boxShadow: '0px 0px 5px rgba(var(--primary), 0.3)',
			transition: { duration: 0.1 }
		}
	};

	return (
		<section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-background/95">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div
					className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse"
					style={{ animationDuration: '15s' }}
				></div>
				<div
					className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[150px] animate-pulse"
					style={{ animationDuration: '20s' }}
				></div>

				{/* Cyberpunk grid overlay */}
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9InN2ZyIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNCAwaDYwdjYwSDB6Ii8+PHBhdGggZD0iTTYwIDBIMH Y2MGg2MFYweiBNNTkgMUgxdjU4aDU4VjF6IiBmaWxsPSIjMjcyNTNGIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjxwYXRoIGQ9Ik02MCAwSDB2NjBoNjBWMEgiIHN0cm9rZT0iIzI3MjUzRiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				{/* Section header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true, margin: '-100px' }}
					className="text-center mb-16 relative"
				>
					<motion.div
						initial={{ width: 0, opacity: 0 }}
						whileInView={{ width: 'auto', opacity: 1 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-8 shadow-lg shadow-primary/5"
					>
						<span className="h-px w-5 bg-gradient-to-r from-transparent to-primary"></span>
						<span className="text-primary/90 font-monster text-sm font-medium tracking-wider uppercase">
							Premium Scripts
						</span>
						<span className="h-px w-5 bg-gradient-to-r from-primary to-transparent"></span>
					</motion.div>

					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						viewport={{ once: true }}
						className="text-4xl md:text-6xl font-bold mb-6 font-monster"
					>
						Customize Your{' '}
						<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Protection
						</span>{' '}
						Experience
					</motion.h2>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						viewport={{ once: true }}
						className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl"
					>
						Explore our community-made scripts to enhance your server security and moderation
					</motion.p>
				</motion.div>

				{/* Loading spinner */}
				{isLoading && (
					<div className="flex justify-center items-center h-64">
						<motion.div
							animate={{
								rotate: 360,
								boxShadow: [
									'0 0 5px rgba(var(--primary), 0.5)',
									'0 0 20px rgba(var(--primary), 0.5)',
									'0 0 5px rgba(var(--primary), 0.5)'
								]
							}}
							transition={{
								rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
								boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
							}}
							className="rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"
						></motion.div>
					</div>
				)}

				{/* Error state */}
				{error && !isLoading && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-destructive/10 text-destructive p-6 rounded-xl mb-8 border border-destructive/20 backdrop-blur-sm shadow-lg"
					>
						<div className="flex items-center gap-3">
							<FiShield className="w-6 h-6" />
							<p className="font-medium">{error}</p>
						</div>
					</motion.div>
				)}

				{/* Carousel */}
				{!isLoading && templates.length > 0 && (
					<div
						className="relative"
						onMouseEnter={() => setIsHovering(true)}
						onMouseLeave={() => setIsHovering(false)}
					>
						{/* Top Navigation */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							viewport={{ once: true }}
							className="flex justify-between items-center mb-10 md:mb-12"
						>
							<motion.h3
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 }}
								className="text-2xl font-bold text-foreground/90 font-monster flex items-center gap-3"
							>
								<FiPackage className="text-primary" />
								Popular Scripts
								<motion.span
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.4, type: 'spring' }}
									className="ml-2 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
								>
									{templates.length}
								</motion.span>
							</motion.h3>

							<div className="flex gap-3">
								<motion.button
									variants={buttonVariants}
									initial="initial"
									whileHover="hover"
									whileTap="tap"
									onClick={prev}
									className="p-4 rounded-xl bg-card hover:bg-secondary text-foreground transition-colors duration-300 border border-border shadow-md relative overflow-hidden group"
									aria-label="Previous"
								>
									<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<FiChevronLeft className="w-5 h-5 relative z-10" />
								</motion.button>
								<motion.button
									variants={buttonVariants}
									initial="initial"
									whileHover="hover"
									whileTap="tap"
									onClick={next}
									className="p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300 shadow-md relative overflow-hidden group"
									aria-label="Next"
								>
									<div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<FiChevronRight className="w-5 h-5 relative z-10" />
								</motion.button>
							</div>
						</motion.div>

						{/* Carousel items */}
						<div className="relative overflow-hidden">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentPage}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.5, ease: 'easeInOut' }}
									className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
								>
									{getVisibleTemplates().map((template, idx) => (
										<motion.div
											key={template.id}
											initial={{ opacity: 0, y: 30 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.5, delay: idx * 0.1 }}
											whileHover={{
												y: -10,
												transition: { duration: 0.3, type: 'spring', stiffness: 300 }
											}}
										>
											<CommonCard template={template} />
										</motion.div>
									))}
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Carousel dots */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="flex justify-center mt-12 gap-3"
						>
							{Array.from({ length: totalPages }).map((_, i) => (
								<motion.button
									key={i}
									onClick={() => setCurrentPage(i)}
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.9 }}
									className={`h-2 rounded-full transition-all duration-500 ${
										i === currentPage
											? 'w-10 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30'
											: 'w-2 bg-muted hover:bg-primary/50'
									}`}
									aria-label={`Go to slide ${i + 1}`}
								/>
							))}
						</motion.div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && templates.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border p-8 text-center backdrop-blur-sm shadow-xl"
					>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
							className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
						>
							<FiBox className="w-10 h-10 text-primary" />
						</motion.div>
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="text-muted-foreground text-xl font-medium"
						>
							No templates found
						</motion.p>
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="text-muted-foreground/70 mt-2"
						>
							Check back later for new scripts
						</motion.p>
					</motion.div>
				)}
			</div>
		</section>
	);
};
