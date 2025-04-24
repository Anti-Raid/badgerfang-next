'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BlogCard from '@/components/blogs/BlogCard';
import { Blog } from '@/types/blogs/index';

export default function BlogLayout() {
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const response = await fetch('/api/get/blogs');
				const data = await response.json();
				setBlogs(data);
			} catch (error) {
				console.error('Error fetching blogs:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchBlogs();
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
		>
			<div className="mb-16 text-center">
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="font-monster text-primary font-bold text-4xl md:text-5xl lg:text-6xl mb-6"
				>
					AntiRaid Blogs
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto"
				>
					Insights, updates, and stories from our team
				</motion.p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
					{[1, 2].map((i) => (
						<div key={i} className="h-64 rounded-xl bg-card/50 animate-pulse"></div>
					))}
				</div>
			) : (
				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
					variants={{
						hidden: { opacity: 0 },
						show: {
							opacity: 1,
							transition: {
								staggerChildren: 0.2
							}
						}
					}}
					initial="hidden"
					animate="show"
				>
					{blogs.map((blog) => (
						<BlogCard key={blog.slug} blog={blog} />
					))}
				</motion.div>
			)}
		</motion.div>
	);
}
