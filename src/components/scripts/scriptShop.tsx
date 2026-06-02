'use client';

import { useState, useRef, useMemo } from 'react';
import { useInView } from '@/lib/scroll-motion';
import { FiSearch, FiFilter, FiX, FiPackage, FiZap, FiGrid, FiList } from 'react-icons/fi';
import { CommonCard } from './ScriptCard';
import React from 'react';
import { useDebouncedSearch } from '@/lib/pacer';
import type { ScriptShopTemplate } from '@/types/script/shop';
import { cn } from '@/lib/utils';

export const TemplateShop = ({ data }: { data: ScriptShopTemplate[] }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebouncedSearch(searchTerm, 300);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const searchRef = useRef<HTMLInputElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(headerRef as React.RefObject<HTMLElement>, {
		threshold: 0.1,
		rootMargin: '-100px'
	});

	const filteredData = useMemo(() => {
		if (!Array.isArray(data)) return [];
		if (!debouncedSearchTerm) return data;

		const searchTerm =
			typeof debouncedSearchTerm === 'string'
				? debouncedSearchTerm.toLowerCase()
				: String(debouncedSearchTerm || '').toLowerCase();
		if (!searchTerm) return data;

		return data.filter(
			(template) =>
				(template.name?.toLowerCase() || '').includes(searchTerm) ||
				(template.description?.toLowerCase() || '').includes(searchTerm) ||
				(template.owner_guild?.toLowerCase() || '').includes(searchTerm)
		);
	}, [debouncedSearchTerm, data]);

	const clearSearch = () => {
		setSearchTerm('');
		if (searchRef.current) {
			searchRef.current.focus();
		}
	};

	return (
		<div className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 py-16">
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
					<h1
						className={cn(
							'relative font-monster font-bold text-5xl md:text-6xl lg:text-7xl mb-6 inline-block transition-all duration-[600ms] ease-out',
							isInView ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0',
							'delay-100'
						)}
					>
						<span className="relative z-10">Script</span>{' '}
						<span className="relative">
							<span className="absolute -inset-1 blur-md bg-gradient-to-r from-primary to-accent opacity-30 rounded-lg"></span>
							<span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Marketplace
							</span>
						</span>
					</h1>

					<p
						className={cn(
							'font-inter text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed transition-all duration-500 ease-out',
							isInView ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
							'delay-200'
						)}
					>
						Discover premium, ready-to-use scripts built by the AntiRaid community to enhance your
						Discord server experience. Browse, preview, and install with just a few clicks.
					</p>
				</div>

				<div className="animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto mb-16 relative duration-500 fill-mode-both delay-300">
					<div
						className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}
					>
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
				</div>

				{filteredData.length === 0 ? (
					<div
						key="empty"
						className="text-center py-20 max-w-2xl mx-auto animate-in zoom-in-95 fade-in duration-300"
					>
						<div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300 delay-200 fill-mode-both">
							<FiPackage className="w-12 h-12 text-primary" />
						</div>

						<h3 className="text-2xl font-bold mb-4 font-monster animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300 fill-mode-both">
							No scripts found
						</h3>

						<p className="text-muted-foreground text-lg mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[400ms] fill-mode-both">
							We couldn&apos;t find any scripts matching your search criteria.
						</p>

						<button
							type="button"
							onClick={() => setSearchTerm('')}
							className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center mx-auto gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 delay-500 fill-mode-both"
						>
							<FiZap className="w-4 h-4" />
							View all scripts
						</button>
					</div>
				) : (
					<div
						key="results"
						className={
							viewMode === 'grid'
								? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
								: 'flex flex-col space-y-6'
						}
					>
						{filteredData.map((template, index) => (
							<div
								key={template.id}
								style={{ animationDelay: `${index * 60}ms` }}
								className={cn(
									'animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500',
									viewMode === 'list' && 'max-w-4xl mx-auto w-full',
									'transition-transform duration-200 hover:-translate-y-1'
								)}
							>
								<CommonCard template={template} />
							</div>
						))}
					</div>
				)}

				{filteredData.length > 0 && (
					<div className="mt-16 text-center animate-in fade-in duration-500 fill-mode-both delay-700">
						<p className="text-muted-foreground">
							Showing <span className="text-primary font-medium">{filteredData.length}</span> scripts
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
