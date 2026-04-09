'use client';

import { useState, useEffect } from 'react';
import { FiChevronLeft, FiBox, FiChevronRight, FiPackage, FiShield } from 'react-icons/fi';
import { CommonCard } from '../scripts/ScriptCard';
import { listTemplateShop } from '@/lib/api';

export const TemplateCarousel = () => {
	const [templates, setTemplates] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(0);

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				setIsLoading(true);
				const templates = await listTemplateShop();
				setTemplates(templates);
			} catch (err) {
				setError('Failed to fetch template data. Using fallback data.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchTemplates();
		setViewportWidth(window.innerWidth);

		const handleResize = () => setViewportWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const getItemsPerView = () => {
		if (viewportWidth >= 1280) return 3;
		if (viewportWidth >= 768) return 2;
		return 1;
	};

	const itemsPerPage = getItemsPerView();
	const totalPages = Math.ceil(templates.length / itemsPerPage);

	const getVisibleTemplates = () => {
		const start = currentPage * itemsPerPage;
		return templates.slice(start, start + itemsPerPage);
	};

	const next = () => setCurrentPage((p) => (p + 1) % totalPages);
	const prev = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);

	return (
		<section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-background/95">
			{/* Background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div
					className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse"
					style={{ animationDuration: '15s' }}
				/>
				<div
					className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[150px] animate-pulse"
					style={{ animationDuration: '20s' }}
				/>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				{/* Section header */}
				<div className="text-center mb-16 relative animate-in fade-in-0 slide-in-from-bottom-4 duration-600">
					<div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-8 shadow-lg shadow-primary/5">
						<span className="h-px w-5 bg-gradient-to-r from-transparent to-primary"></span>
						<span className="text-primary/90 text-sm font-medium tracking-wider uppercase">
							Premium Scripts
						</span>
						<span className="h-px w-5 bg-gradient-to-r from-primary to-transparent"></span>
					</div>

					<h2 className="text-4xl md:text-6xl font-bold mb-6">
						Customize Your{' '}
						<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Protection
						</span>{' '}
						Experience
					</h2>

					<p className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl">
						Explore our community-made scripts to enhance your server security and moderation
					</p>
				</div>

				{/* Loading spinner */}
				{isLoading && (
					<div className="flex justify-center items-center h-64">
						<div className="rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary animate-spin" />
					</div>
				)}

				{/* Error state */}
				{error && !isLoading && (
					<div className="bg-destructive/10 text-destructive p-6 rounded-xl mb-8 border border-destructive/20 backdrop-blur-sm shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
						<div className="flex items-center gap-3">
							<FiShield className="w-6 h-6" />
							<p className="font-medium">{error}</p>
						</div>
					</div>
				)}

				{/* Carousel */}
				{!isLoading && templates.length > 0 && (
					<div className="relative">
						{/* Top Navigation */}
						<div className="flex justify-between items-center mb-10 md:mb-12 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
							<h3 className="text-2xl font-bold text-foreground/90 flex items-center gap-3">
								<FiPackage className="text-primary" />
								Popular Scripts
								<span className="ml-2 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium animate-in zoom-in-50 duration-300 delay-400">
									{templates.length}
								</span>
							</h3>

							<div className="flex gap-3">
								<button
									onClick={prev}
									className="p-4 rounded-xl bg-card hover:bg-secondary text-foreground transition-all duration-200 border border-border shadow-md hover:scale-105 active:scale-95 relative overflow-hidden group"
									aria-label="Previous"
								>
									<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<FiChevronLeft className="w-5 h-5 relative z-10" />
								</button>
								<button
									onClick={next}
									className="p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-md hover:scale-105 active:scale-95 relative overflow-hidden group"
									aria-label="Next"
								>
									<div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<FiChevronRight className="w-5 h-5 relative z-10" />
								</button>
							</div>
						</div>

						{/* Carousel items — key forces re-mount for entrance animation on page change */}
						<div className="relative overflow-hidden">
							<div
								key={currentPage}
								className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in-0 duration-500"
							>
								{getVisibleTemplates().map((template, idx) => (
									<div
										key={template.id}
										className="animate-in fade-in-0 slide-in-from-bottom-4 hover:-translate-y-2 transition-transform duration-300"
										style={{ animationDelay: `${idx * 100}ms` }}
									>
										<CommonCard template={template} />
									</div>
								))}
							</div>
						</div>

						{/* Carousel dots */}
						<div className="flex justify-center mt-12 gap-3">
							{Array.from({ length: totalPages }).map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrentPage(i)}
									className={`h-2 rounded-full transition-all duration-500 hover:scale-125 active:scale-90 ${
										i === currentPage
											? 'w-10 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30'
											: 'w-2 bg-muted hover:bg-primary/50'
									}`}
									aria-label={`Go to slide ${i + 1}`}
								/>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && templates.length === 0 && (
					<div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border p-8 text-center backdrop-blur-sm shadow-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
						<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300 delay-200">
							<FiBox className="w-10 h-10 text-primary" />
						</div>
						<p className="text-muted-foreground text-xl font-medium">No templates found</p>
						<p className="text-muted-foreground/70 mt-2">Check back later for new scripts</p>
					</div>
				)}
			</div>
		</section>
	);
};
