'use client';
import React, { useState } from 'react';
import { posts } from '@/types/forums/types';
import Image from 'next/image';
import Link from 'next/link';

import OptimizedImage from '../OptimizedImage';
import Particle from '../ui/Particle';
const PostCard: React.FC<posts> = (post: posts) => {
	const [upvotes, setUpvotes] = useState(0);
	const [downvotes, setDownvotes] = useState(0);
	const [voted, setVoted] = useState<'up' | 'down' | null>(null);
	const [isCommenting, setIsCommenting] = useState(false);
	const [upvoteParticles, setUpvoteParticles] = useState<
		Array<{ id: number; x: number; y: number; color: string }>
	>([]);
	const [downvoteParticles, setDownvoteParticles] = useState<
		Array<{ id: number; x: number; y: number; color: string }>
	>([]);

	const handleVote = (type: 'up' | 'down') => {
		if (voted === type) {
			// Remove vote
			setVoted(null);
			if (type === 'up') {
				setUpvotes((prev) => prev - 1);
			} else {
				setDownvotes((prev) => prev - 1);
			}
		} else {
			if (voted) {
				if (type === 'up') {
					setDownvotes((prev) => prev - 1);
					setUpvotes((prev) => prev + 1);
				} else {
					setUpvotes((prev) => prev - 1);
					setDownvotes((prev) => prev + 1);
				}
			} else {
				// New vote
				if (type === 'up') {
					setUpvotes((prev) => prev + 1);
				} else {
					setDownvotes((prev) => prev + 1);
				}
			}
			setVoted(type);
		}
	};

	const ImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = '/logo.webp';
	};

	const createUpvoteParticles = (e: React.MouseEvent) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const particles = Array.from({ length: 20 }, (_, index) => ({
			id: Date.now() + index,
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			color: '#22c55e'
		}));
		setUpvoteParticles((prev) => [...prev, ...particles]);
		setTimeout(() => {
			setUpvoteParticles((prev) => prev.filter((p) => !particles.some((newP) => newP.id === p.id)));
		}, 1000);
	};

	const createDownvoteParticles = (e: React.MouseEvent) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const particles = Array.from({ length: 20 }, (_, index) => ({
			id: Date.now() + index,
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			color: '#ef4444'
		}));
		setDownvoteParticles((prev) => [...prev, ...particles]);
		setTimeout(() => {
			setDownvoteParticles((prev) =>
				prev.filter((p) => !particles.some((newP) => newP.id === p.id))
			);
		}, 1000);
	};

	return (
		<div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10">
			{/* User Info */}
			<Link
				href={`/forums/@${post.user.usertag}`}
				className="flex items-center gap-3 p-4 border-b border-white/10"
			>
				<OptimizedImage
					src={post.user.avatar as string}
					alt={`${post.user.name}'s Avatar`}
					width={32}
					height={32}
					className="h-8 w-8 rounded-full"
					fallbackSrc="/logo.webp"
				/>
				<div className="flex flex-col">
					<span className="text-sm font-medium text-white/90">
						{post.user.name !== post.user.usertag ? post.user.name : post.user.usertag}
					</span>
					{post.user.name !== post.user.usertag && (
						<span className="text-xs text-white/60">@{post.user.usertag}</span>
					)}
				</div>
			</Link>

			{/* Post Content */}
			<Link href={`/forums/post/${post.postid}`} className="block p-4">
				<p className="mb-4 text-sm text-white/80">{post.caption}</p>

				{/* Post Image */}
				{post.image && (
					<OptimizedImage
						src={post.image}
						alt="Post content"
						className="w-full rounded-md"
						height={200}
						width={200}
						fallbackSrc="/logo.webp"
					/>
				)}

				{/* Post Plugins */}
				{post.plugins.map((item, idx) => {
					if (item.type === 'tenor') {
						return (
							<OptimizedImage
								key={`tenor-${idx}`}
								src={item.href as string}
								alt="GIF"
								className="mt-4 w-full rounded-md"
								height={200}
								width={200}
								fallbackSrc="/logo.webp"
							/>
						);
					}

					if (item.type === 'url') {
						return (
							<div
								key={idx}
								className="mt-4 rounded-md border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
							>
								<div className="flex items-center gap-2">
									{item.jsonData.favicon && (
										<OptimizedImage
											src={item.jsonData.favicon}
											alt={item.jsonData.sitename}
											width={16}
											height={16}
											className="h-4 w-4 rounded-full"
											fallbackSrc="/logo.webp"
										/>
									)}
									<span className="text-xs text-white/60">{item.jsonData.sitename}</span>
								</div>
								<h3 className="mt-2 text-sm font-medium text-white/90">{item.jsonData.title}</h3>
								<p className="mt-1 text-xs text-white/70">{item.jsonData.description}</p>
								{item.jsonData.image && (
									<OptimizedImage
										src={item.jsonData.image}
										alt={item.jsonData.title}
										className="mt-3 w-full rounded-md"
										height={120}
										width={120}
										fallbackSrc="/logo.webp"
									/>
								)}
							</div>
						);
					}
					return null;
				})}
			</Link>

			{/* Vote Buttons */}
			<div className="border-t border-white/10 px-4 py-2">
				<div className="flex items-center gap-4">
					{/* Upvote */}
					<button
						onClick={(e) => {
							handleVote('up');
							createUpvoteParticles(e);
						}}
						className={`group relative flex items-center gap-1 transition-all ${
							voted === 'up' ? 'text-green-500' : 'text-white/60 hover:text-green-500'
						}`}
					>
						{upvoteParticles.map((particle) => (
							<Particle key={particle.id} {...particle} />
						))}
						<svg
							className={`h-5 w-5 transition-transform ${
								voted === 'up' ? 'scale-110' : 'group-hover:scale-110'
							}`}
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 4L3 15h6v5h6v-5h6L12 4z" />
						</svg>
						<span className="text-sm">{upvotes}</span>
					</button>

					{/* Downvote */}
					<button
						onClick={(e) => {
							handleVote('down');
							createDownvoteParticles(e);
						}}
						className={`group relative flex items-center gap-1 transition-all ${
							voted === 'down' ? 'text-red-500' : 'text-white/60 hover:text-red-500'
						}`}
					>
						{downvoteParticles.map((particle) => (
							<Particle key={particle.id} {...particle} />
						))}
						<svg
							className={`h-5 w-5 transition-transform ${
								voted === 'down' ? 'scale-110' : 'group-hover:scale-110'
							}`}
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 20l9-11h-6V4H9v5H3l9 11z" />
						</svg>
						<span className="text-sm">{downvotes}</span>
					</button>

					{/* Comment */}
					<button
						onClick={() => setIsCommenting(!isCommenting)}
						className="group flex items-center gap-1 text-white/60 hover:text-primary transition-all"
					>
						<svg
							className="h-5 w-5 transition-transform group-hover:scale-110"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
						</svg>
						<span className="text-sm">{post.comments?.length || 0}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default PostCard;
