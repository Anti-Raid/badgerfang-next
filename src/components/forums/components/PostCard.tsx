'use client';
import React, { useState } from 'react';
import { posts } from '@/types/forums/types';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown, FaCommentAlt } from 'react-icons/fa';
import Particle from '../../ui/Particle';

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
			setVoted(null);
			type === 'up' ? setUpvotes((prev) => prev - 1) : setDownvotes((prev) => prev - 1);
		} else {
			if (voted) {
				type === 'up'
					? (setDownvotes((prev) => prev - 1), setUpvotes((prev) => prev + 1))
					: (setUpvotes((prev) => prev - 1), setDownvotes((prev) => prev + 1));
			} else {
				type === 'up' ? setUpvotes((prev) => prev + 1) : setDownvotes((prev) => prev + 1);
			}
			setVoted(type);
		}
	};

	const createParticles = (
		e: React.MouseEvent,
		type: 'up' | 'down'
	) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const color = type === 'up' ? '#22c55e' : '#ef4444';
		const setter = type === 'up' ? setUpvoteParticles : setDownvoteParticles;

		const particles = Array.from({ length: 20 }, (_, i) => ({
			id: Date.now() + i,
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			color,
		}));

		setter((prev) => [...prev, ...particles]);
		setTimeout(() => {
			setter((prev) => prev.filter((p) => !particles.some((newP) => newP.id === p.id)));
		}, 1000);
	};

	const isSmallImage = (src: string) => {
		return (
			src.includes('5d1ab941') ||
			src.includes('46f23dcb') ||
			src.includes('b5cb157c') ||
			src.includes('d490f890')
		);
	};

	const isGif = (src: string) => src.endsWith('.gif');

	return (
		<div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10">
			{/* User Info */}
			<Link
				href={`/forums/@${post.user.usertag}`}
				className="flex items-center gap-3 p-4 border-b border-white/10"
			>
				<Image
					src={post.user.avatar as string}
					alt={`${post.user.name}'s Avatar`}
					width={32}
					height={32}
					className="h-8 w-8 rounded-full"
					onError={(e) => {
						(e.target as HTMLImageElement).src = '/logo.webp';
					}}
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

				{post.image && (
					<Image
						src={post.image}
						alt="Post content"
						className="w-full rounded-md"
						width={200}
						height={200}
						unoptimized={isGif(post.image)}
					/>
				)}

				{post.plugins.map((item, idx) => {
					if (item.type === 'tenor') {
						return (
							<Image
								key={`tenor-${idx}`}
								src={item.href as string}
								alt="GIF"
								className="mt-4 w-full rounded-md"
								width={200}
								height={200}
								unoptimized
							/>
						);
					}

					if (item.type === 'url') {
						const iconTooSmall = item.jsonData.favicon && isSmallImage(item.jsonData.favicon);

						return (
							<div
								key={idx}
								className="mt-4 rounded-md border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
							>
								<div className="flex items-center gap-2">
									{item.jsonData.favicon && (
										<Image
											src={item.jsonData.favicon}
											alt={item.jsonData.sitename}
											width={16}
											height={16}
											className="h-4 w-4 rounded-full"
											{...(iconTooSmall ? {} : { placeholder: 'empty' })}
										/>
									)}
									<span className="text-xs text-white/60">{item.jsonData.sitename}</span>
								</div>
								<h3 className="mt-2 text-sm font-medium text-white/90">{item.jsonData.title}</h3>
								<p className="mt-1 text-xs text-white/70">{item.jsonData.description}</p>
								{item.jsonData.image && (
									<Image
										src={item.jsonData.image}
										alt={item.jsonData.title}
										className="mt-3 w-full rounded-md"
										width={120}
										height={120}
										unoptimized={isGif(item.jsonData.image)}
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
							createParticles(e, 'up');
						}}
						className={`group relative flex items-center gap-1 transition-all ${
							voted === 'up' ? 'text-green-500' : 'text-white/60 hover:text-green-500'
						}`}
					>
						{upvoteParticles.map((p) => (
							<Particle key={p.id} {...p} />
						))}
						<FaArrowUp className={`h-5 w-5 ${voted === 'up' ? 'scale-110' : 'group-hover:scale-110'}`} />
						<span className="text-sm">{upvotes}</span>
					</button>

					{/* Downvote */}
					<button
						onClick={(e) => {
							handleVote('down');
							createParticles(e, 'down');
						}}
						className={`group relative flex items-center gap-1 transition-all ${
							voted === 'down' ? 'text-red-500' : 'text-white/60 hover:text-red-500'
						}`}
					>
						{downvoteParticles.map((p) => (
							<Particle key={p.id} {...p} />
						))}
						<FaArrowDown className={`h-5 w-5 ${voted === 'down' ? 'scale-110' : 'group-hover:scale-110'}`} />
						<span className="text-sm">{downvotes}</span>
					</button>

					{/* Comment */}
					<button
						onClick={() => setIsCommenting(!isCommenting)}
						className="group flex items-center gap-1 text-white/60 hover:text-primary transition-all"
					>
						<FaCommentAlt className="h-5 w-5 group-hover:scale-110 transition-transform" />
						<span className="text-sm">{post.comments?.length || 0}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default PostCard;
