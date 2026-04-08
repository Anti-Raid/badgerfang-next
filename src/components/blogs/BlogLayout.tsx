'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, User, Tag } from 'lucide-react';
import BlogCard from '@/components/blogs/BlogCard';
import type { BlogPost } from '@/types/blogs/index';
import { fetchBlogs } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

const calculateReadingTime = (content: string): string => {
	if (!content) return '1 min';
	const words = content.split(/\s+/).length;
	const mins = Math.ceil(words / 200);
	return `${mins} min read`;
};

// ── Featured post card ────────────────────────────────────────────────────────

const FeaturedCard = ({ blog }: { blog: BlogPost }) => (
	<motion.div
		initial={{ opacity: 0, y: 24 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6 }}
		className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
	>
		<div className="grid lg:grid-cols-2">
			{/* Image */}
			<div className="relative aspect-[4/3] lg:aspect-auto min-h-[280px] overflow-hidden">
				<Image
					src={`/api/get/og-image?slug=${blog.slug}`}
					alt={blog.title}
					fill
					className="object-cover group-hover:scale-105 transition-transform duration-700"
					priority
				/>
				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/80 hidden lg:block" />
				<div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent lg:hidden" />

				{/* Featured badge */}
				<span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30">
					<span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
					Featured
				</span>
			</div>

			{/* Content */}
			<div className="p-8 lg:p-10 flex flex-col justify-center">
				{/* Tags */}
				{blog.tags?.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-4">
						{blog.tags.slice(0, 3).map((tag) => (
							<span
								key={tag}
								className="px-2.5 py-0.5 text-xs font-bold text-primary bg-primary/10 rounded-full border border-primary/20"
							>
								{tag}
							</span>
						))}
					</div>
				)}

				<h2 className="text-2xl lg:text-3xl font-extrabold text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
					{blog.title}
				</h2>

				<p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">{blog.description}</p>

				{/* Meta */}
				<div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
					{blog.author?.avatar ? (
						<div className="relative w-7 h-7 rounded-full overflow-hidden border border-border flex-shrink-0">
							<Image
								src={blog.author.avatar}
								alt={blog.author.name}
								fill
								className="object-cover"
							/>
						</div>
					) : (
						<div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
							<User className="w-3.5 h-3.5" />
						</div>
					)}
					<span className="font-medium text-foreground">{blog.author?.name ?? 'AntiRaid Team'}</span>
					<span className="text-border">·</span>
					<span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
					<span className="text-border">·</span>
					<span className="flex items-center gap-1">
						<Clock className="w-3.5 h-3.5" />
						{calculateReadingTime(blog.content)}
					</span>
				</div>

				<Link
					href={`/blogs/${blog.slug}`}
					className="group/btn self-start inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all"
				>
					Read Article
					<ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
				</Link>
			</div>
		</div>
	</motion.div>
);

// ── Main layout ───────────────────────────────────────────────────────────────

export default function BlogLayout() {
	const [blogs, setBlogs] = useState<BlogPost[]>([]);
	const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [allTags, setAllTags] = useState<string[]>([]);

	useEffect(() => {
		const fetchBlog = async () => {
			try {
				const data = await fetchBlogs();
				setBlogs(data);
				setFilteredBlogs(data);
				const tags = data.reduce((acc: string[], blog: BlogPost) => {
					blog.tags?.forEach((t) => { if (!acc.includes(t)) acc.push(t); });
					return acc;
				}, []);
				setAllTags(tags);
			} catch (err) {
				console.error('Error fetching blogs:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchBlog();
	}, []);

	useEffect(() => {
		let result = blogs;
		if (searchTerm) {
			result = result.filter(
				(b) =>
					b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					b.description?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (selectedTag) {
			result = result.filter((b) => b.tags?.includes(selectedTag));
		}
		setFilteredBlogs(result);
	}, [searchTerm, selectedTag, blogs]);

	const isFiltering = !!searchTerm || !!selectedTag;
	const featuredPost = !isFiltering && filteredBlogs.length > 0 ? filteredBlogs[0] : null;
	const gridPosts = !isFiltering ? filteredBlogs.slice(1) : filteredBlogs;

	const clearFilters = () => { setSearchTerm(''); setSelectedTag(null); };

	return (
		<div className="min-h-screen">
			{/* ── Hero ── */}
			<section className="relative pt-32 pb-12 px-6 overflow-hidden">
				<div className="absolute inset-0 -z-10 pointer-events-none">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.18),transparent)]" />
					<div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] bg-[size:56px_56px]" />
				</div>

				<div className="max-w-4xl mx-auto text-center">
					<motion.p
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-sm font-bold text-primary uppercase tracking-widest mb-4"
					>
						Insights & Updates
					</motion.p>
					<motion.h1
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.05 }}
						className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5"
					>
						The AntiRaid{' '}
						<span className="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent">
							Blog
						</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
					>
						Discord security insights, moderation tips, and product updates.
					</motion.p>

					{/* Search */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						className="max-w-xl mx-auto"
					>
						<div className="relative">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search articles…"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-11 pr-10 py-3.5 bg-card border border-border rounded-2xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
							/>
							{searchTerm && (
								<button
									onClick={() => setSearchTerm('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>
					</motion.div>
				</div>
			</section>

			{/* ── Tag pills ── */}
			<AnimatePresence>
				{allTags.length > 0 && (
					<motion.section
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="max-w-6xl mx-auto px-6 pb-8"
					>
						<div className="flex flex-wrap items-center justify-center gap-2">
							<button
								onClick={() => setSelectedTag(null)}
								className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
									!selectedTag
										? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
										: 'bg-accent text-muted-foreground hover:text-foreground'
								}`}
							>
								All
							</button>
							{allTags.map((tag) => (
								<button
									key={tag}
									onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
									className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
										selectedTag === tag
											? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
											: 'bg-accent text-muted-foreground hover:text-foreground'
									}`}
								>
									<Tag className="w-3 h-3" />
									{tag}
								</button>
							))}
						</div>
					</motion.section>
				)}
			</AnimatePresence>

			{/* ── Content ── */}
			<section className="max-w-6xl mx-auto px-6 pb-24 space-y-8">
				{isLoading ? (
					/* Skeleton */
					<div className="space-y-8">
						{/* Featured skeleton */}
						<div className="rounded-3xl border border-border bg-card overflow-hidden animate-pulse">
							<div className="grid lg:grid-cols-2">
								<div className="aspect-[4/3] lg:aspect-auto min-h-[280px] bg-muted" />
								<div className="p-10 space-y-4">
									<div className="h-3 w-16 bg-muted rounded-full" />
									<div className="h-8 w-3/4 bg-muted rounded-xl" />
									<div className="space-y-2">
										<div className="h-4 w-full bg-muted rounded" />
										<div className="h-4 w-5/6 bg-muted rounded" />
									</div>
									<div className="h-10 w-32 bg-muted rounded-full mt-6" />
								</div>
							</div>
						</div>
						{/* Grid skeleton */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
									<div className="aspect-[16/9] bg-muted" />
									<div className="p-5 space-y-3">
										<div className="h-3 w-1/4 bg-muted rounded-full" />
										<div className="h-5 w-full bg-muted rounded" />
										<div className="h-4 w-2/3 bg-muted rounded" />
									</div>
								</div>
							))}
						</div>
					</div>
				) : filteredBlogs.length === 0 ? (
					/* Empty state */
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-28 flex flex-col items-center"
					>
						<div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
							<Search className="w-7 h-7 text-muted-foreground/50" />
						</div>
						<h3 className="text-xl font-bold text-foreground mb-2">No articles found</h3>
						<p className="text-muted-foreground mb-6 max-w-xs">
							Nothing matched your search. Try different keywords or clear your filters.
						</p>
						<button
							onClick={clearFilters}
							className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
						>
							<X className="w-4 h-4" />
							Clear filters
						</button>
					</motion.div>
				) : (
					<>
						{/* Filter result count */}
						{isFiltering && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex items-center justify-between"
							>
								<p className="text-sm text-muted-foreground">
									<span className="font-semibold text-foreground">{filteredBlogs.length}</span>{' '}
									article{filteredBlogs.length !== 1 ? 's' : ''} found
									{selectedTag && (
										<>
											{' '}tagged{' '}
											<span className="text-primary font-semibold">#{selectedTag}</span>
										</>
									)}
								</p>
								<button
									onClick={clearFilters}
									className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
								>
									<X className="w-3.5 h-3.5" />
									Clear
								</button>
							</motion.div>
						)}

						{/* Featured post */}
						{featuredPost && <FeaturedCard blog={featuredPost} />}

						{/* Grid */}
						{gridPosts.length > 0 && (
							<>
								{featuredPost && (
									<div className="flex items-center gap-4">
										<div className="h-px flex-1 bg-border" />
										<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
											More articles
										</p>
										<div className="h-px flex-1 bg-border" />
									</div>
								)}
								<motion.div
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
									initial="hidden"
									animate="show"
									variants={{
										show: { transition: { staggerChildren: 0.05 } }
									}}
								>
									{gridPosts.map((blog, index) => (
										<BlogCard key={blog.slug} blog={blog} index={index} />
									))}
								</motion.div>
							</>
						)}
					</>
				)}
			</section>
		</div>
	);
}
