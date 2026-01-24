'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { useRouter, useSearch, Link } from '@tanstack/react-router';
import { motion, useMotionValue, useTransform } from '@/components/ui/motion';
import { Calendar, ArrowRight, Tag, Clock, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { Blog } from '@/types/blogs/index';
import { Image } from '@unpic/react';

interface BlogCardProps {
	blog: Blog;
	index: number;
	isFeatured?: boolean;
}

/**
 * Renders an animated blog preview card with 3D tilt, hover effects, and interactive tag filtering.
 *
 * Displays a blog post's image, tags, title, description, author information, publication date, and estimated reading time. The card animates into view with a staggered fade and slide, tilts in 3D based on mouse movement, and scales with a glowing gradient on hover. Clicking a tag updates the URL to filter blogs by that tag.
 *
 * @param blog - The blog post data to display.
 * @param index - The card's position in a list, used to stagger animation.
 */
export default function BlogCard({ blog, index, isFeatured = false }: BlogCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const cardRef = useRef<HTMLDivElement>(null);

	const router = useRouter();
	const searchParams = useSearch({ strict: false });

	const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
	const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

	const calculateReadingTime = (content: string): string => {
		const wordsPerMinute = 200;
		const wordCount = content.split(/\s+/).length;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return `${minutes} min read`;
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		mouseX.set(x);
		mouseY.set(y);
	};

	const handleTagClick = (e: React.MouseEvent, tag: string) => {
		e.preventDefault();
		e.stopPropagation();
		router.navigate({
			search: (prev: any) => ({ ...prev, sortBy: tag })
		} as any);
	};

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.6,
				delay: index * 0.1,
				ease: [0.22, 1, 0.36, 1]
			}}
			style={{
				rotateX,
				rotateY,
				perspective: 1000
			} as any}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				mouseX.set(0);
				mouseY.set(0);
			}}
			className="group relative h-full flex flex-col"
		>
			<Link to="/blogs/$slug" params={{ slug: blog.slug }} className="flex flex-col h-full">
				<div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 shadow-lg">
					{/* Glow Effect */}
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div className={`flex flex-col ${isFeatured ? 'md:flex-row h-full' : 'h-full'}`}>
						{/* Image Container */}
						<div
							className={`relative overflow-hidden ${isFeatured ? 'w-full md:w-3/5 h-64 md:h-auto aspect-video' : 'w-full h-56'}`}
						>
							{blog.image ? (
								<Image
									src={blog.image}
									alt={blog.title}
									layout="fullWidth"
									className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							) : blog.slug ? (
								<Image
									src={`/api/get/og-image?slug=${blog.slug}`}
									alt={blog.title}
									layout="fullWidth"
									className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							) : (
								<div className="w-full h-full bg-secondary/50 flex items-center justify-center">
									<BookOpen size={48} className="text-muted-foreground/20" />
								</div>
							)}


							{/* Image Overlay Gradient */}
							<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

							{/* Tags & Badges on Image */}
							<div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
								{blog.badges?.map((badge, i) => (
									<span
										key={`badge-${i}`}
										className="px-3 py-1 bg-accent text-white text-[10px] font-bold rounded-full shadow-lg border border-white/10"
									>
										{badge}
									</span>
								))}
								{blog.tags?.slice(0, 3).map((tag, i) => (
									<button
										key={i}
										onClick={(e) => handleTagClick(e, tag)}
										className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
									>
										{tag}
									</button>
								))}
							</div>

						</div>

						{/* Content Section */}
						<div
							className={`p-6 flex flex-col justify-between flex-grow ${isFeatured ? 'md:w-2/5 md:p-10' : ''}`}
						>
							<div className="space-y-4">
								<h3
									className={`font-monster font-bold group-hover:text-primary transition-colors leading-tight ${isFeatured ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl'}`}
								>
									{blog.title}
								</h3>
								<p
									className={`text-muted-foreground line-clamp-3 leading-relaxed ${isFeatured ? 'text-base lg:text-lg' : 'text-sm'}`}
								>
									{blog.description}
								</p>
							</div>

							<div
								className={`mt-8 flex items-center justify-between ${isFeatured ? 'border-t border-border/10 pt-8' : ''}`}
							>
								<div className="flex items-center gap-3">
									{blog.author.avatar ? (
										<div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-border/50">
											<Image
												src={blog.author.avatar}
												alt={blog.author.name}
												layout="fullWidth"
												className="absolute inset-0 w-full h-full object-cover"
											/>
										</div>
									) : (
										<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
											<User size={18} className="text-primary" />
										</div>
									)}
									<div className="flex flex-col">
										<span className="text-sm font-bold text-foreground">{blog.author.name}</span>
										<span className="text-xs text-muted-foreground">
											{format(new Date(blog.publishedAt), 'MMM d, yyyy')}
										</span>
									</div>
								</div>

								<div className="flex items-center text-xs text-muted-foreground space-x-2 bg-secondary/40 px-3 py-1 rounded-full border border-border/10">
									<Clock size={12} className="text-primary" />
									<span>{calculateReadingTime(blog.content)}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom Animation Bar */}
					<div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
				</div>
			</Link>
		</motion.div>
	);
}
