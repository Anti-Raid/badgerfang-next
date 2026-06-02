'use client';

import { useState, useEffect } from 'react';
import { FiChevronLeft, FiBox, FiChevronRight, FiPackage, FiZap, FiShield } from 'react-icons/fi';
import { CommonCard } from '../scripts/ScriptCard';
import { listTemplateShop } from '@/lib/api';
import type { ScriptShopTemplate } from '@/types/script/shop';

export const TemplateCarousel = () => {
	const [templates, setTemplates] = useState<ScriptShopTemplate[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(0);
	const [isHovering, setIsHovering] = useState(false);
	const [isChanging, setIsChanging] = useState(false);

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
		setIsChanging(true);
		setTimeout(() => {
			setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
			setIsChanging(false);
		}, 300);
	};

	const prev = () => {
		setIsChanging(true);
		setTimeout(() => {
			setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
			setIsChanging(false);
		}, 300);
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
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9InN2ZyIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNCAwaDYwdjYwSDB6Ii8+PHBhdGggZD0iTTYwIDBIMH Y2MGg2MFYwei BNNTkgMUgxdjU4aDU4VjF6IiBmaWxsPSIjMjcyNTNGIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjxwYXRoIGQ9Ik02MCAwSDB2NjBoNjBWMEgiIHN0cm9rZT0iIzI3MjUzRiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				{/* Section header */}
				<div
					className="animate-in fade-in slide-in-from-bottom-5 duration-700 text-center mb-16 relative"
				>
					<div
						className="animate-in fade-in zoom-in-95 duration-500 delay-200 inline-flex items-center gap-4 px-6 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-8 shadow-lg shadow-primary/5"
					>
						<span className="h-px w-5 bg-gradient-to-r from-transparent to-primary"></span>
						<span className="text-primary/90 font-monster text-sm font-medium tracking-wider uppercase">
							Premium Scripts
						</span>
						<span className="h-px w-5 bg-gradient-to-r from-primary to-transparent"></span>
					</div>

					<h2
						className="animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300 text-4xl md:text-6xl font-bold mb-6 font-monster"
					>
						Customize Your{' '}
						<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Protection
						</span>{' '}
						Experience
					</h2>

					<p
						className="animate-in fade-in slide-in-from-bottom-5 duration-500 delay-400 text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
					>
						Explore our community-made scripts to enhance your server security and moderation
					</p>
				</div>

				{/* Loading spinner */}
				{isLoading && (
					<div className="flex justify-center items-center h-64">
						<div
							className="rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary animate-spin shadow-[0_0_20px_rgba(var(--primary),0.5)]"
						></div>
					</div>
				)}

				{/* Error state */}
				{error && !isLoading && (
					<div
						className="animate-in fade-in slide-in-from-top-5 duration-500 bg-destructive/10 text-destructive p-6 rounded-xl mb-8 border border-destructive/20 backdrop-blur-sm shadow-lg"
					>
						<div className="flex items-center gap-3">
							<FiShield className="w-6 h-6" />
							<p className="font-medium">{error}</p>
						</div>
					</div>
				)}

				{/* Carousel */}
				{!isLoading && templates.length > 0 && (
					<div
						className="relative"
						onMouseEnter={() => setIsHovering(true)}
						onMouseLeave={() => setIsHovering(false)}
					>
						{/* Top Navigation */}
						<div
							className="animate-in fade-in slide-in-from-bottom-5 duration-500 flex justify-between items-center mb-10 md:mb-12"
						>
							<h3
								className="text-2xl font-bold text-foreground/90 font-monster flex items-center gap-3"
							>
								<FiPackage className="text-primary" />
								Popular Scripts
								<span
									className="animate-in zoom-in duration-500 delay-300 ml-2 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
								>
									{templates.length}
								</span>
							</h3>

							<div className="flex gap-3">
								<button
									onClick={prev}
									className="p-4 rounded-xl bg-card hover:bg-secondary text-foreground transition-all duration-300 border border-border shadow-md relative overflow-hidden group hover:scale-105 active:scale-95"
									aria-label="Previous"
								>
									<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<FiChevronLeft className="w-5 h-5 relative z-10" />
								</button>
								<button
									onClick={next}
									className="p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-md relative overflow-hidden group hover:scale-105 active:scale-95"
									aria-label="Next"
								>
									<div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<FiChevronRight className="w-5 h-5 relative z-10" />
								</button>
							</div>
						</div>

						{/* Carousel items */}
						<div className="relative overflow-hidden">
							<div
								className={`transition-all duration-500 ease-in-out grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 ${isChanging ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
							>
								{getVisibleTemplates().map((template, idx) => (
									<div
										key={template.id}
										style={{ animationDelay: `${idx * 100}ms` }}
										className="animate-in fade-in slide-in-from-bottom-5 duration-500 hover:-translate-y-2 transition-transform duration-300"
									>
										<CommonCard template={template} />
									</div>
								))}
							</div>
						</div>

						{/* Carousel dots */}
						<div
							className="animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300 flex justify-center mt-12 gap-3"
						>
							{Array.from({ length: totalPages }).map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrentPage(i)}
									className={`h-2 rounded-full transition-all duration-500 hover:scale-110 active:scale-90 ${
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
					<div
						className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border p-8 text-center backdrop-blur-sm shadow-xl"
					>
						<div
							className="animate-in zoom-in duration-500 delay-200 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
						>
							<FiBox className="w-10 h-10 text-primary" />
						</div>
						<p
							className="text-muted-foreground text-xl font-medium"
						>
							No templates found
						</p>
						<p
							className="text-muted-foreground/70 mt-2"
						>
							Check back later for new scripts
						</p>
					</div>
				)}
			</div>
		</section>
	);
};
