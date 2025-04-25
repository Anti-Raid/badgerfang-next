'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'next-view-transitions'
import { format } from 'date-fns';
import type { Blog } from '@/types/blogs/index';

interface BlogCardProps {
	blog: Blog;
	index: number;
}

/**
 * Renders an animated, interactive card displaying a blog post summary with 3D tilt and hover effects.
 *
 * The card presents blog metadata, tags, title, description, and a "Read more" link. Visual effects include animated entrance, 3D rotation based on mouse movement, scaling, glow, and gradient overlays. Tags and meta information are shown if available, and the card's appearance responds to hover state for enhanced interactivity.
 *
 * @param blog - The blog post data to display.
 * @param index - The card's position in a list, used to stagger entrance animations.
 */
export default function BlogCard({ blog, index }: BlogCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const cardRef = useRef<HTMLDivElement>(null);

	const rotateX = useTransform(mouseY, [-100, 100], [2, -2]);
	const rotateY = useTransform(mouseX, [-100, 100], [-2, 2]);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		mouseX.set(x);
		mouseY.set(y);
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
			className="group relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-lg transition-all duration-300"
		>
			{/* Gradient overlay */}
			<motion.div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			{/* Glow effect */}
			<motion.div
				className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl opacity-0 blur-xl"
				animate={{ opacity: isHovered ? 0.15 : 0 }}
				transition={{ duration: 0.3 }}
			/>

			<div className="p-6 relative z-10">
				{/* Tags */}
				{blog.tags?.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-3">
						{blog.tags.map((tag) => (
							<motion.span
								key={tag}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3 }}
								className="bg-accent text-white-bold px-2 py-1 rounded-full text-xs font-medium flex items-center"
							>
								<Tag size={12} className="mr-1" />
								{tag}
							</motion.span>
						))}
					</div>
				)}

				{/* Meta info */}
				<div className="flex items-center text-sm text-muted-foreground mb-3">
					<div className="flex items-center mr-4">
						<User size={14} className="mr-1" />
						<span className="font-medium">{blog.author.name}</span>
					</div>
					<div className="flex items-center">
						<Calendar size={14} className="mr-1" />
						<span>{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>
					</div>
				</div>

				{/* Title */}
				<h2 className="text-2xl font-bold font-lora mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
					{blog.title}
				</h2>

				{/* Description */}
				<p className="text-muted-foreground line-clamp-3 mb-4">{blog.description}</p>

				{/* Read more link */}
				<Link
					href={`/blogs/${blog.slug}`}
					className="inline-flex items-center text-primary font-medium"
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
			</div>

			{/* Bottom gradient line */}
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
