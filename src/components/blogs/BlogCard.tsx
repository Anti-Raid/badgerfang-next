'use client';

import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from 'date-fns';
import { Blog, Author } from '@/types/blogs/index';

interface BlogCardProps {
	blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 20 },
				show: { opacity: 1, y: 0 }
			}}
			whileHover={{ y: -5, transition: { duration: 0.2 } }}
			className="group relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
		>
			<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			<div className="p-6 relative z-10">
				<div className="flex items-center text-sm text-muted-foreground mb-3">
					<div className="flex items-center mr-4">
						<User size={14} className="mr-1" />
						<span>{blog.author.name}</span>
					</div>
					<div className="flex items-center">
						<Calendar size={14} className="mr-1" />
						<span>{formatDate(blog.publishedAt, 'PPP')}</span>
					</div>
				</div>

				<h2 className="text-2xl font-bold font-lora mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
					{blog.title}
				</h2>

				<p className="text-muted-foreground line-clamp-3 mb-4">{blog.description}</p>

				<Link
					href={`/blogs/${blog.slug}`}
					className="inline-flex items-center text-primary font-medium"
				>
					Read more
					<motion.span
						initial={{ x: 0 }}
						animate={{ x: 0 }}
						className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
					>
						<ArrowRight size={16} />
					</motion.span>
				</Link>
			</div>

			<div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
		</motion.div>
	);
}
