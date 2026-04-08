'use client';

import { useRef, useState, useEffect } from 'react';
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
	const ref = useRef<HTMLDivElement>(null);
	const [show, setShow] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => { if (e.isIntersecting) { setShow(true); obs.disconnect(); } },
			{ rootMargin: '-40px' }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
			style={{ transitionDelay: `${Math.min(index * 50, 300)}ms` }}
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
		</div>
	);
}
