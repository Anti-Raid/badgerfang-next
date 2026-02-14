'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import BlogCard from '@/components/blogs/BlogCard';
import type { Blog } from '@/types/blogs/index';
import { fetchStrapiBlogs } from '@/lib/api';

// Animation variants
const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }
	}
};

export default function BlogLayout() {
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [allTags, setAllTags] = useState<string[]>([]);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const data = await fetchStrapiBlogs();
				setBlogs(data.data);
				setFilteredBlogs(data.data);

				const tags = data.data.reduce((acc: string[], blog: Blog) => {
					if (blog.tags) {
						blog.tags.forEach((tag) => {
							if (!acc.includes(tag)) {
								acc.push(tag);
							}
						});
					}
					return acc;
				}, []);

				setAllTags(tags);
			} catch (error) {
				console.error('Error fetching blogs:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchBlogs();
	}, []);

	useEffect(() => {
		let result = blogs;

		if (searchTerm) {
			result = result.filter(
				(blog) =>
					(blog.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
					(blog.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
			);
		}

		if (selectedTag) {
			result = result.filter((blog) => blog.tags?.includes(selectedTag));
		}

		setFilteredBlogs(result);
	}, [searchTerm, selectedTag, blogs]);

	const handleTagClick = (tag: string) => {
		setSelectedTag(selectedTag === tag ? null : tag);
	};

	const clearFilters = () => {
		setSearchTerm('');
		setSelectedTag(null);
	};

	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="pt-32 pb-16 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<motion.p
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						className="text-sm font-medium text-primary mb-4"
					>
						Insights & Updates
					</motion.p>
					<motion.h1
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.1 }}
						className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
					>
						Blog
					</motion.h1>
					<motion.p
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.2 }}
						className="text-lg text-muted-foreground max-w-2xl mx-auto"
					>
						Discover insights about Discord security, moderation best practices, and community
						management.
					</motion.p>

					{/* Search */}
					<motion.div
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.3 }}
						className="mt-10 max-w-xl mx-auto"
					>
						<div className="relative">
							<Search
								size={18}
								className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<input
								type="text"
								placeholder="Search articles..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
							/>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Tags */}
			{allTags.length > 0 && (
				<section className="max-w-4xl mx-auto px-6 pb-8">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="flex flex-wrap items-center justify-center gap-2"
					>
						{allTags.map((tag) => (
							<button
								key={tag}
								onClick={() => handleTagClick(tag)}
								className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
									selectedTag === tag
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
								}`}
							>
								{tag}
							</button>
						))}
						{selectedTag && (
							<button
								onClick={clearFilters}
								className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								Clear
							</button>
						)}
					</motion.div>
				</section>
			)}

			{/* Content */}
			<section className="max-w-6xl mx-auto px-6 pb-24">
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="rounded-xl border border-border bg-card overflow-hidden animate-pulse"
							>
								<div className="aspect-video bg-muted" />
								<div className="p-5 space-y-3">
									<div className="h-4 w-1/3 bg-muted rounded" />
									<div className="h-5 w-full bg-muted rounded" />
									<div className="h-4 w-2/3 bg-muted rounded" />
								</div>
							</div>
						))}
					</div>
				) : filteredBlogs.length > 0 ? (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
						initial="hidden"
						animate="show"
					>
						{filteredBlogs.map((blog, index) => (
							<BlogCard key={blog.slug} blog={blog} index={index} />
						))}
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-24"
					>
						<Search size={32} className="mx-auto text-muted-foreground/50 mb-4" />
						<h3 className="text-xl font-semibold mb-2">No articles found</h3>
						<p className="text-muted-foreground mb-6">
							Try adjusting your search or filter criteria.
						</p>
						<button
							onClick={clearFilters}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
						>
							Clear filters
						</button>
					</motion.div>
				)}
			</section>

			{/* Newsletter */}
			<section className="max-w-4xl mx-auto px-6 pb-24">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
					className="text-center p-12 rounded-2xl bg-muted/50 border border-border"
				>
					<h3 className="text-2xl font-semibold mb-3">Stay updated</h3>
					<p className="text-muted-foreground mb-8 max-w-md mx-auto">
						Get the latest articles and updates delivered to your inbox.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
						/>
						<button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
							Subscribe
						</button>
					</div>
					<p className="text-xs text-muted-foreground mt-4">No spam. Unsubscribe anytime.</p>
				</motion.div>
			</section>
		</div>
	);
}
