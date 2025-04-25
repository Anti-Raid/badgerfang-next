'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Search, BookOpen, Sparkles, Tag } from 'lucide-react';
import BlogCard from '@/components/blogs/BlogCard';
import type { Blog } from '@/types/blogs/index';
import { ViewTransitions } from 'next-view-transitions';
import { Link } from 'next-view-transitions'

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
	const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);
	const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const response = await fetch('/api/get/blogs');
				const data = await response.json();
				setBlogs(data);
				setFilteredBlogs(data);

				// Extract all unique tags
				const tags = data.reduce((acc: string[], blog: Blog) => {
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
					blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
					blog.content.toLowerCase().includes(searchTerm.toLowerCase())
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

	return (
		<div className="min-h-screen bg-background">
			{/* Header Section */}
			<ViewTransitions>
				<motion.div
					ref={headerRef}
					style={{ opacity: headerOpacity, scale: headerScale }}
					className="relative overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-accent/5 pointer-events-none" />

					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
							transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
							className="text-center"
						>
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={isHeaderInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className="inline-flex items-center justify-center mb-6 bg-accent/20 text-accent px-4 py-2 rounded-full"
							>
								<BookOpen size={18} className="mr-2" />
								<span className="bg-primary bg-clip-text">Our Latest Insights</span>
							</motion.div>

							<motion.h1
								initial={{ opacity: 0, y: 20 }}
								animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={{ duration: 0.7, delay: 0.3 }}
								className="font-monster text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
							>
								<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
									AntiRaid Blogs
								</span>
							</motion.h1>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={{ duration: 0.7, delay: 0.4 }}
								className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
							>
								Insights, updates, and stories from our team
							</motion.p>

							{/* Search Bar */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={{ duration: 0.7, delay: 0.5 }}
								className="relative max-w-xl mx-auto"
							>
								<div className="relative">
									<Search
										className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
										size={20}
									/>
									<input
										type="text"
										placeholder="Search articles..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full pl-10 pr-4 py-3 rounded-full bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
									/>
								</div>
							</motion.div>
						</motion.div>
					</div>

					{/* Decorative elements */}
					<motion.div
						className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.5, 0.7, 0.5]
						}}
						transition={{
							duration: 8,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: 'reverse'
						}}
					/>
					<motion.div
						className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl"
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.5, 0.7, 0.5]
						}}
						transition={{
							duration: 10,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: 'reverse',
							delay: 1
						}}
					/>
				</motion.div>
			</ViewTransitions>

			{/* Tags Section */}
			{allTags.length > 0 && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex flex-wrap items-center gap-3 justify-center">
						<span className="text-muted-foreground mr-2 flex items-center">
							<Tag size={16} className="mr-1" />
							Filter by:
						</span>
						{allTags.map((tag) => (
							<motion.button
								key={tag}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => handleTagClick(tag)}
								className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
									selectedTag === tag
										? 'bg-primary text-primary-foreground'
										: 'bg-card hover:bg-card/80 text-foreground'
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
								className="px-3 py-1.5 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200"
								onClick={() => setSelectedTag(null)}
							>
								Clear filter
							</motion.button>
						)}
					</div>
				</div>
			)}

			{/* Blog Cards Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-[320px] rounded-xl bg-card/50 animate-pulse">
								<div className="h-full w-full flex flex-col p-6">
									<div className="w-1/3 h-4 bg-muted rounded-full mb-4"></div>
									<div className="w-3/4 h-8 bg-muted rounded-full mb-4"></div>
									<div className="w-full h-4 bg-muted rounded-full mb-2"></div>
									<div className="w-full h-4 bg-muted rounded-full mb-2"></div>
									<div className="w-2/3 h-4 bg-muted rounded-full mb-4"></div>
									<div className="mt-auto w-1/4 h-4 bg-muted rounded-full"></div>
								</div>
							</div>
						))}
					</div>
				) : filteredBlogs.length > 0 ? (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 gap-8"
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
						transition={{ duration: 0.5 }}
						className="text-center py-16"
					>
						<div className="inline-block p-4 bg-accent/10 rounded-full mb-4">
							<Search size={32} className="text-accent" />
						</div>
						<h3 className="text-2xl font-bold mb-2">No results found</h3>
						<p className="text-muted-foreground mb-6">
							We couldn't find any blogs matching your search criteria.
						</p>
						<button
							onClick={() => {
								setSearchTerm('');
								setSelectedTag(null);
							}}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
						>
							Clear filters
						</button>
					</motion.div>
				)}
			</div>

			{/* Newsletter Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					viewport={{ once: true, amount: 0.3 }}
					className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 p-8 md:p-12"
				>
					<div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />

					<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
						<div className="text-center md:text-left">
							<div className="flex items-center justify-center md:justify-start mb-4">
								<Sparkles className="text-primary mr-2" size={20} />
								<span className="text-primary font-medium">Stay Updated</span>
							</div>
							<h3 className="text-2xl md:text-3xl font-bold mb-2">Subscribe to our newsletter</h3>
							<p className="text-muted-foreground max-w-md">
								Get the latest articles, updates and resources delivered straight to your inbox.
							</p>
						</div>

						<div className="w-full md:w-auto">
							<div className="flex flex-col sm:flex-row gap-3">
								<input
									type="email"
									placeholder="Enter your email"
									className="px-4 py-3 rounded-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none min-w-[240px]"
								/>
								<motion.button
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.97 }}
									className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
								>
									Subscribe
								</motion.button>
							</div>
						</div>
					</div>

					{/* Decorative elements */}
					<motion.div
						className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
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
				</motion.div>
			</div>
		</div>
	);
}
