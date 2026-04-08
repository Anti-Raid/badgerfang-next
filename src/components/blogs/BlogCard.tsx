'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, User, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { BlogPost } from '@/types/blogs/index';

interface BlogCardProps {
	blog: BlogPost;
	index: number;
}

const calculateReadingTime = (content: string): string => {
	if (!content) return '1 min';
	const mins = Math.ceil(content.split(/\s+/).length / 200);
	return `${mins} min`;
};

export default function BlogCard({ blog, index }: BlogCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(cardRef, { once: true, margin: '-40px' });

	return (
		<motion.div
			ref={cardRef}
			variants={{
				hidden: { opacity: 0, y: 16 },
				show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
			}}
			initial="hidden"
			animate={isInView ? 'show' : 'hidden'}
		>
			<Link
				href={`/blogs/${blog.slug}`}
				className="group flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
			>
				{/* Image */}
				<div className="relative aspect-[16/9] overflow-hidden bg-muted flex-shrink-0">
					{blog.slug ? (
						<Image
							src={`/api/get/og-image?slug=${blog.slug}`}
							alt={blog.title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-accent">
							<div className="w-10 h-10 rounded-full bg-muted" />
						</div>
					)}

					{/* Reading time badge */}
					<span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-black/60 backdrop-blur-sm text-white">
						<Clock className="w-3 h-3" />
						{calculateReadingTime(blog.content)}
					</span>
				</div>

				{/* Content */}
				<div className="flex flex-col flex-1 p-5">
					{/* Tags */}
					{blog.tags?.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mb-3">
							{blog.tags.slice(0, 2).map((tag) => (
								<span
									key={tag}
									className="px-2 py-0.5 text-[11px] font-bold text-primary bg-primary/10 rounded-full border border-primary/15"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					{/* Title */}
					<h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2 flex-1">
						{blog.title}
					</h3>

					{/* Description */}
					<p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
						{blog.description}
					</p>

					{/* Meta */}
					<div className="flex items-center justify-between pt-4 border-t border-border">
						<div className="flex items-center gap-2 min-w-0">
							{blog.author?.avatar ? (
								<div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
									<Image
										src={blog.author.avatar}
										alt={blog.author.name}
										fill
										className="object-cover"
									/>
								</div>
							) : (
								<div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
									<User className="w-3 h-3" />
								</div>
							)}
							<span className="text-xs text-muted-foreground font-medium truncate">
								{blog.author?.name ?? 'AntiRaid Team'}
							</span>
						</div>

						<div className="flex items-center gap-2 flex-shrink-0">
							<span className="text-xs text-muted-foreground">
								{format(new Date(blog.createdAt), 'MMM d, yyyy')}
							</span>
							<ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
						</div>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
