'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Search, BookOpen, Sparkles, Tag, TrendingUp, Clock, Eye } from 'lucide-react';
import BlogCard from '@/components/blogs/BlogCard';
import type { Blog } from '@/types/blogs/index';
import { fetchStrapiBlogs } from '@/lib/api';

/**
 * Render the blog listing page with an animated header, search, tag filtering, and newsletter subscription.
 *
 * Fetches blog data on mount, maintains search and tag filter state, and displays loading skeletons, filtered blog cards, or an empty state as appropriate.
 *
 * @returns A React element representing the blog listing page.
 */
export default function BlogLayout() {
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [allTags, setAllTags] = useState<string[]>([]);

	const headerRef = useRef<HTMLDivElement>(null);
	const isHeaderInView = useInView(headerRef, { once: false, amount: 0.5 });

	const { scrollY } = useScroll();
	const headerY = useTransform(scrollY, [0, 300], [0, -50]);
	const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const data = await fetchStrapiBlogs();
				setBlogs(data.data);
				setFilteredBlogs(data.data);

				// Extract all unique tags
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

		// Filter by search term
		if (searchTerm) {
			result = result.filter(
				(blog) =>
					(blog.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
					(blog.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
					(blog.content?.toLowerCase() || '').includes(searchTerm.toLowerCase())
			);
		}

		// Filter by selected tag
		if (selectedTag) {
			result = result.filter((blog) => blog.tags?.includes(selectedTag));
		}

		setFilteredBlogs(result);
	}, [searchTerm, selectedTag, blogs]);

	const handleTagClick = (tag: string) => {
		setSelectedTag(selectedTag === tag ? null : tag);
	};

	const featuredBlog = blogs[0]; // First blog is featured

	return (
		<div className="min-h-screen bg-background relative overflow-hidden">
			{/* Animated Background */}
			<div className="fixed inset-0 pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: '2s' }}
				/>
			</div>

			{/* Hero Section */}
			<motion.div
				ref={headerRef}
				style={{ y: headerY, opacity: headerOpacity }}
				className="relative"
			>
				{/* Gradient Overlay */}
				<div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
						transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
						className="text-center"
					>
						{/* Badge */}
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={isHeaderInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="inline-flex items-center justify-center mb-8 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-sm border border-primary/20 px-6 py-3 rounded-full shadow-lg shadow-primary/10"
						>
							<BookOpen size={20} className="mr-2 text-primary" />
							<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-monster font-semibold tracking-wide">
								Our Latest Insights
							</span>
							<Sparkles size={16} className="ml-2 text-accent" />
						</motion.div>

						{/* Title */}
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
							transition={{ duration: 0.7, delay: 0.3 }}
							className="font-monster text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
						>
							<span className="relative inline-block">
								<span className="absolute -inset-2 blur-2xl bg-gradient-to-r from-primary to-accent opacity-30 rounded-lg" />
								<span className="relative bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
									AntiRaid Blog
								</span>
							</span>
						</motion.h1>

						{/* Subtitle */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
							transition={{ duration: 0.7, delay: 0.4 }}
							className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
						>
							Discover insights, updates, and stories about Discord security, moderation, and
							community management
						</motion.p>

						{/* Search Bar */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
							transition={{ duration: 0.7, delay: 0.5 }}
							className="relative max-w-2xl mx-auto"
						>
							<div className="relative group">
								<div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
								<div className="relative flex items-center">
									<Search
										className="absolute left-5 text-muted-foreground group-focus-within:text-primary transition-colors"
										size={22}
									/>
									<input
										type="text"
										placeholder="Search articles, topics, or keywords..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full pl-14 pr-6 py-4 rounded-full bg-card/80 backdrop-blur-md border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-lg"
									/>
								</div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>

			{/* Tags Section */}
			{allTags.length > 0 && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="flex flex-wrap items-center gap-3 justify-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
					>
						<div className="flex items-center gap-2 mr-4">
							<Tag size={18} className="text-primary" />
							<span className="text-foreground font-medium">Filter by:</span>
						</div>
						{allTags.map((tag) => (
							<motion.button
								key={tag}
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => handleTagClick(tag)}
								className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
									selectedTag === tag
										? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
										: 'bg-background/80 hover:bg-background text-foreground border border-border/50 hover:border-primary/50'
								}`}
							>
								{tag}
							</motion.button>
						))}
						{selectedTag && (
							<motion.button
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								whileHover={{ scale: 1.05 }}
								className="px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-300 border border-destructive/20"
								onClick={() => setSelectedTag(null)}
							>
								✕ Clear filter
							</motion.button>
						)}
					</motion.div>
				</div>
			)}

			{/* Featured Blog */}
			{!isLoading && !searchTerm && !selectedTag && featuredBlog && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
						viewport={{ once: true }}
					>
						<div className="flex items-center gap-3 mb-6">
							<TrendingUp className="text-primary" size={24} />
							<h2 className="text-3xl font-bold font-monster">Featured Article</h2>
						</div>
						<BlogCard blog={featuredBlog} index={0} isFeatured />
					</motion.div>
				</div>
			)}

			{/* Blog Cards Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
				{!isLoading && filteredBlogs.length > 1 && !searchTerm && !selectedTag && (
					<div className="flex items-center gap-3 mb-8">
						<Clock className="text-accent" size={24} />
						<h2 className="text-3xl font-bold font-monster">Recent Articles</h2>
					</div>
				)}

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="h-[400px] rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 animate-pulse overflow-hidden"
							>
								<div className="h-48 bg-muted/50" />
								<div className="p-6 space-y-4">
									<div className="w-1/3 h-4 bg-muted/50 rounded-full" />
									<div className="w-full h-6 bg-muted/50 rounded-full" />
									<div className="w-full h-4 bg-muted/50 rounded-full" />
									<div className="w-2/3 h-4 bg-muted/50 rounded-full" />
								</div>
							</div>
						))}
					</div>
				) : filteredBlogs.length > 0 ? (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
						initial="hidden"
						animate="show"
					>
						{filteredBlogs.slice(searchTerm || selectedTag ? 0 : 1).map((blog, index) => (
							<BlogCard key={blog.slug} blog={blog} index={index} />
						))}
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="text-center py-20"
					>
						<div className="inline-block p-6 bg-accent/10 rounded-full mb-6">
							<Search size={48} className="text-accent" />
						</div>
						<h3 className="text-3xl font-bold mb-3 font-monster">No articles found</h3>
						<p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
							We couldn't find any blogs matching your search criteria. Try different keywords or
							clear your filters.
						</p>
						<button
							onClick={() => {
								setSearchTerm('');
								setSelectedTag(null);
							}}
							className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
						>
							Clear all filters
						</button>
					</motion.div>
				)}
			</div>

			{/* Newsletter Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					viewport={{ once: true, amount: 0.3 }}
					className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 p-12 md:p-16 border border-primary/20"
				>
					{/* Glassmorphism overlay */}
					<div className="absolute inset-0 bg-card/60 backdrop-blur-xl" />

					{/* Animated background blobs */}
					<motion.div
						className="absolute -top-20 -right-20 w-64 h-64 bg-primary/30 rounded-full blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.3, 0.5, 0.3]
						}}
						transition={{
							duration: 8,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: 'reverse'
						}}
					/>
					<motion.div
						className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl"
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.3, 0.5, 0.3]
						}}
						transition={{
							duration: 10,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: 'reverse',
							delay: 1
						}}
					/>

					<div className="relative z-10 text-center max-w-3xl mx-auto">
						<div className="flex items-center justify-center mb-6">
							<Sparkles className="text-primary mr-3" size={28} />
							<span className="text-primary font-semibold text-lg tracking-wide">
								Stay in the Loop
							</span>
						</div>
						<h3 className="text-4xl md:text-5xl font-bold mb-4 font-monster">
							Never Miss an Update
						</h3>
						<p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
							Get the latest articles, security tips, and AntiRaid updates delivered straight to
							your inbox. Join our community of Discord server owners.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
							<input
								type="email"
								placeholder="Enter your email address"
								className="flex-1 px-6 py-4 rounded-full bg-background/80 backdrop-blur-sm border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
							/>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 whitespace-nowrap"
							>
								Subscribe Now
							</motion.button>
						</div>

						<p className="text-xs text-muted-foreground mt-6">
							No spam, ever. Unsubscribe anytime. We respect your privacy.
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
