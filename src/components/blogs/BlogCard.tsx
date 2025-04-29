'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'next-view-transitions';
import { format } from 'date-fns';
import type { Blog } from '@/types/blogs/index';
import Image from 'next/image';

interface BlogCardProps {
	blog: Blog;
	index: number;
}

/**
 * Displays an animated blog preview card with 3D tilt, hover effects, and interactive tag filtering.
 *
 * Shows a blog post's image, tags, title, description, author details, publication date, and estimated reading time. The card animates into view with a staggered fade and slide, tilts in 3D based on mouse movement, and scales with a glowing gradient on hover. Clicking a tag updates the URL to filter blogs by that tag.
 *
 * @param blog - Blog post data to display in the card.
 * @param index - Position of the card in a list, used for animation delay.
 */
export default function BlogCard({ blog, index }: BlogCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const cardRef = useRef<HTMLDivElement>(null);

	const router = useRouter();
	const searchParams = useSearchParams();

	const rotateX = useTransform(mouseY, [-100, 100], [2, -2]);
	const rotateY = useTransform(mouseX, [-100, 100], [-2, 2]);

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

	const handleTagClick = (tag: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('sortBy', tag);
		router.push(`?${params.toString()}`);
	};

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 50 }}
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
			}}
			whileHover={{ scale: 1.02 }}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				mouseX.set(0);
				mouseY.set(0);
			}}
			className="group relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-md transition-all duration-300"
		>
			{/* Full-width Image Header */}
			{blog.image && (
				<div className="relative w-full h-48 md:h-56 lg:h-64 overflow-hidden">
					<Image
						src={`https://strapi.purrquinox.com${blog.image.url}`}
						alt={blog.image.alternativeText || blog.title}
						fill
						className="object-cover"
					/>

					{/* Tags overlay on image */}
					{blog.tags?.length > 0 && (
						<div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
							{blog.tags.map((tag) => (
								<motion.button
									type="button"
									onClick={() => handleTagClick(tag)}
									key={tag}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.3 }}
									className="bg-accent text-white px-2 py-1 rounded-full text-[10px] font-semibold flex items-center"
								>
									<Tag size={10} className="mr-1" />
									{tag}
								</motion.button>
							))}
						</div>
					)}
				</div>
			)}

			{/* Content */}
			<div className="p-5 space-y-4">
				{/* Title */}
				<h2 className="text-xl font-bold font-cabin leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
					<Link href={`/blogs/${blog.slug}`} className="transition-colors duration-300">
						{blog.title}
					</Link>
				</h2>

				{/* Description */}
				<p className="text-md text-muted-foreground line-clamp-3">{blog.description}</p>

				{/* Bottom section */}
				<div className="flex justify-between items-center pt-2">
					{/* Read more */}
					<Link
						href={`/blogs/${blog.slug}`}
						className="inline-flex items-center text-primary font-medium text-sm"
					>
						Read more
						<motion.span
							initial={{ x: 0 }}
							animate={{ x: isHovered ? 5 : 0 }}
							transition={{ duration: 0.3 }}
							className="ml-1"
						>
							<ArrowRight size={16} />
						</motion.span>
					</Link>

					{/* Author & Date */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						{/* Avatar */}
						{blog.author.avatar && (
							<Image
								src={`https://strapi.purrquinox.com${blog.author.avatar.url}`}
								alt={blog.author.name}
								width={20}
								height={20}
								className="rounded-full object-cover"
							/>
						)}
						<span>{blog.author.name}</span>
						<span>•</span>
						<div className="flex items-center gap-1">
							<Calendar size={12} />
							<span>{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>
						</div>
						<span>•</span>
						<span>{calculateReadingTime(blog.content)}</span>
					</div>
				</div>
			</div>

			{/* Bottom Glow */}
			<motion.div
				className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"
				initial={{ scaleX: 0 }}
				animate={{ scaleX: isHovered ? 1 : 0 }}
				transition={{ duration: 0.3 }}
				style={{ originX: 0 }}
			/>
		</motion.div>
	);
}
