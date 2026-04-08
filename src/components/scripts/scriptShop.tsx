'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiFilter, FiX, FiPackage, FiZap, FiGrid, FiList } from 'react-icons/fi';
import { CommonCard } from './ScriptCard';
import React from 'react';

export const TemplateShop = ({ data }: { data: any[] }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredData, setFilteredData] = useState<any[]>([]);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [headerVisible, setHeaderVisible] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = headerRef.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => { if (e.isIntersecting) { setHeaderVisible(true); obs.disconnect(); } },
			{ rootMargin: '-100px' }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

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

	return (
		<div className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 py-16">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
				<div
					className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse"
					style={{ animationDuration: '15s' }}
				></div>
				<div
					className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse"
					style={{ animationDuration: '20s' }}
				></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<div className="mb-20 text-center" ref={headerRef}>
					<h1
						className={`relative font-semibold text-5xl md:text-6xl lg:text-7xl mb-6 inline-block transition-all duration-600 ${
							headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
						}`}
					>
						<span className="relative z-10">Script</span>{' '}
						<span className="relative">
							<span
								className="absolute -inset-1 blur-md bg-gradient-to-r from-primary to-accent opacity-30 rounded-lg"
								aria-hidden="true"
							></span>
							<span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Marketplace
							</span>
						</span>
					</h1>

					<p
						className={`font-inter text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed transition-all duration-500 delay-200 ${
							headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
						}`}
					>
						Discover premium, ready-to-use scripts built by the AntiRaid community to enhance your
						Discord server experience. Browse, preview, and install with just a few clicks.
					</p>
				</div>

				<div className="max-w-4xl mx-auto mb-16 relative animate-in fade-in-0 slide-in-from-bottom-3 duration-500 delay-300">
					<div
						className={`relative transition-transform duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}
					>
						{/* Glowing border effect */}
						<div
							className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity duration-300 ${isSearchFocused ? 'opacity-100' : ''}`}
						></div>

						<div className="relative bg-card/80 backdrop-blur-md border border-border hover:border-primary/30 rounded-2xl shadow-xl transition-all duration-300 flex items-center overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

							<div className="pl-6 text-primary" aria-hidden="true">
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
								className="w-full px-4 py-5 bg-transparent border-none focus:ring-0 focus-visible:outline-none placeholder:text-muted-foreground text-foreground font-medium text-lg"
								aria-label="Search scripts"
							/>

							{searchTerm && (
								<button
									onClick={clearSearch}
									className="mr-2 p-2 hover:bg-primary/10 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
									aria-label="Clear search"
								>
									<FiX
										className="text-muted-foreground hover:text-primary transition-colors"
										aria-hidden="true"
									/>
								</button>
							)}

							<div className="h-10 w-px bg-border mx-2" aria-hidden="true"></div>

							<button
								className="p-6 hover:bg-primary/10 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
								aria-label="Filter scripts"
							>
								<FiFilter className="text-primary w-5 h-5" aria-hidden="true" />
							</button>
						</div>
					</div>

					{/* View mode toggle */}
					<div className="flex justify-end mt-4" role="group" aria-label="View mode">
						<div className="bg-card/80 backdrop-blur-md rounded-xl border border-border p-1 flex space-x-1">
							<button
								onClick={() => setViewMode('grid')}
								className={`p-2 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/10'}`}
								aria-label="Grid view"
								aria-pressed={viewMode === 'grid'}
							>
								<FiGrid className="w-4 h-4" aria-hidden="true" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`p-2 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/10'}`}
								aria-label="List view"
								aria-pressed={viewMode === 'list'}
							>
								<FiList className="w-4 h-4" aria-hidden="true" />
							</button>
						</div>
					</div>
				</div>

				{filteredData.length === 0 ? (
					<div className="text-center py-20 max-w-2xl mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
						<div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-50 duration-300 delay-200">
							<FiPackage className="w-12 h-12 text-primary" />
						</div>

						<h3 className="text-2xl font-semibold mb-4">No scripts found</h3>

						<p className="text-muted-foreground text-lg mb-8">
							We couldn&apos;t find any scripts matching your search criteria.
						</p>

						<button
							onClick={() => setSearchTerm('')}
							className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center mx-auto gap-2 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
						>
							<FiZap className="w-4 h-4" />
							View all scripts
						</button>
					</div>
				) : (
					<div
						className={
							viewMode === 'grid'
								? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
								: 'flex flex-col space-y-6'
						}
					>
						{filteredData.map((template, index) => (
							<div
								key={template.id}
								className={`animate-in fade-in-0 slide-in-from-bottom-4 hover:-translate-y-1 transition-transform duration-200 ${
									viewMode === 'list' ? 'max-w-4xl mx-auto w-full' : ''
								}`}
								style={{ animationDelay: `${index * 50}ms` }}
							>
								<CommonCard template={template} />
							</div>
						))}
					</div>
				)}

				{filteredData.length > 0 && (
					<div className="mt-16 text-center animate-in fade-in-0 duration-500 delay-500">
						<p className="text-muted-foreground">
							Showing <span className="text-primary font-medium">{filteredData.length}</span>{' '}
							scripts
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
