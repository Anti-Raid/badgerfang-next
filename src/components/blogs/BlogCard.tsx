'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Blog } from '@/types/blogs/index';

interface BlogCardProps {
	blog: Blog;
	index: number;
}

export default function BlogCard({ blog, index }: BlogCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(cardRef, { once: true, margin: '-50px' });

	const calculateReadingTime = (content: string): string => {
		if (!content) return '1 min';
		const wordsPerMinute = 200;
		const wordCount = content.split(/\s+/).length;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return `${minutes} min`;
	};

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 10 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.3, delay: (index % 6) * 0.05 }}
		>
			<Link
				href={`/blogs/${blog.slug}`}
				className="group block h-full rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/30"
			>
				{/* Image */}
				<div className="relative aspect-video overflow-hidden bg-muted">
					{blog.slug ? (
						<Image
							src={`/api/get/og-image?slug=${blog.slug}`}
							alt={blog.title}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<div className="w-12 h-12 rounded-full bg-muted-foreground/10" />
						</div>
					)}
				</div>

				{/* Content */}
				<div className="p-5">
					{/* Tags */}
					{blog.tags && blog.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-3">
							{blog.tags.slice(0, 2).map((tag, i) => (
								<span
									key={i}
									className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					{/* Title */}
					<h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
						{blog.title}
					</h3>

					{/* Description */}
					<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
						{blog.description}
					</p>

					{/* Meta */}
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<div className="flex items-center gap-2">
							{blog.author?.avatar ? (
								<div className="relative w-6 h-6 rounded-full overflow-hidden">
									<Image
										src={`https://strapi.purrquinox.com${blog.author.avatar.url}`}
										alt={blog.author.name}
										fill
										className="object-cover"
									/>
								</div>
							) : (
								<div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
									<User size={12} />
								</div>
							)}
							<span>{blog.author?.name || 'Anonymous'}</span>
						</div>
						<div className="flex items-center gap-3">
							<span>{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>
							<span className="flex items-center gap-1">
								<Clock size={12} />
								{calculateReadingTime(blog.content)}
							</span>
						</div>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
