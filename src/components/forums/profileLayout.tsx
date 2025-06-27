'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { users, posts } from '@/types/forums/types';
import Image from 'next/image';
import PostCard from './components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Link2, ExternalLink, Shield, Award, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileLayoutProps {
	user: users;
	posts: posts[];
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ user, posts }) => {
	const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
	const [isFollowing, setIsFollowing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [glitchEffect, setGlitchEffect] = useState(false);

	useEffect(() => {
		// Simulate loading
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 800);

		// Trigger glitch effect periodically
		const glitchInterval = setInterval(() => {
			setGlitchEffect(true);
			setTimeout(() => setGlitchEffect(false), 200);
		}, 8000);

		return () => {
			clearTimeout(timer);
			clearInterval(glitchInterval);
		};
	}, []);

	const formatDate = (date: Date) => {
		return formatDistanceToNow(new Date(date), { addSuffix: true });
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.3 }
		}
	};

	const handleFollowToggle = () => {
		setIsFollowing(!isFollowing);
	};

	return (
		<div className="w-full max-w-4xl mx-auto">
			{/* Profile Header */}
			<motion.div
				className="relative mb-8 overflow-hidden rounded-xl border border-accent/20 bg-card/80 backdrop-blur-sm"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				{/* Background Elements */}
				<div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
				<div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
					<div className="absolute top-0 left-0 w-1/2 h-1 bg-primary/30 animate-pulse" />
					<div
						className="absolute top-0 right-0 w-1/3 h-1 bg-accent/30 animate-pulse"
						style={{ animationDelay: '1s' }}
					/>
				</div>

				{/* Cover Image */}
				<div className="h-48 w-full bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 relative overflow-hidden">
					{/* Animated grid lines */}
					<div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-20">
						{Array.from({ length: 12 }).map((_, i) => (
							<div key={i} className="h-full w-px bg-white/30" />
						))}
					</div>
					<div className="absolute inset-0 grid grid-rows-6 gap-4 opacity-20">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-px w-full bg-white/30" />
						))}
					</div>
				</div>

				{/* Profile Info */}
				<div className="relative px-6 pb-6">
					{/* Avatar */}
					<div className="absolute -top-20 left-6 h-36 w-36 overflow-hidden rounded-xl border-4 border-card bg-muted/20 shadow-lg">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						<Image
							src={user.avatar || '/logo.webp?height=144&width=144'}
							alt={`${user.name}'s Avatar`}
							width={144}
							height={144}
							className="h-full w-full object-cover"
						/>
					</div>

					{/* Follow Button */}
					<div className="flex justify-end pt-4">
						<motion.button
							className={`relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
								isFollowing
									? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground'
									: 'bg-primary text-primary-foreground hover:bg-primary/90'
							}`}
							onClick={handleFollowToggle}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<span className="relative z-10">{isFollowing ? 'Unfollow' : 'Follow'}</span>
							{!isFollowing && (
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-primary via-accent/80 to-primary"
									animate={{
										x: ['0%', '100%', '0%']
									}}
									transition={{
										duration: 3,
										ease: 'linear',
										repeat: Number.POSITIVE_INFINITY,
										repeatType: 'loop'
									}}
									style={{ opacity: 0.3 }}
								/>
							)}
						</motion.button>
					</div>

					{/* User Info */}
					<div className="mt-16">
						<h1 className={`text-2xl font-bold text-foreground ${glitchEffect ? 'relative' : ''}`}>
							{glitchEffect && (
								<>
									<span
										className="absolute top-0 left-0 text-primary/80"
										style={{ clipPath: 'inset(0 0 50% 0)', transform: 'translate(-2px, -2px)' }}
									>
										{user.name || user.usertag}
									</span>
									<span
										className="absolute top-0 left-0 text-accent/80"
										style={{ clipPath: 'inset(50% 0 0 0)', transform: 'translate(2px, 2px)' }}
									>
										{user.name || user.usertag}
									</span>
								</>
							)}
							{user.name || user.usertag}
						</h1>
						<p className="text-muted-foreground">@{user.usertag}</p>

						{user.bio && (
							<motion.p
								className="mt-4 text-foreground/90"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
							>
								{user.bio}
							</motion.p>
						)}

						{/* Stats */}
						<motion.div
							className="mt-6 flex flex-wrap gap-6"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<div className="flex items-center gap-2 text-muted-foreground group">
								<Users className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
								<span className="text-sm">
									<span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
										{user.followers?.length || 0}
									</span>{' '}
									followers
								</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground group">
								<Users className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
								<span className="text-sm">
									<span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
										{user.following?.length || 0}
									</span>{' '}
									following
								</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground group">
								<MessageSquare className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
								<span className="text-sm">
									<span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
										{posts.length}
									</span>{' '}
									posts
								</span>
							</div>
							{user.discord_id && (
								<div className="flex items-center gap-2 text-muted-foreground group">
									<Link2 className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
									<span className="text-sm group-hover:text-primary transition-colors duration-300">
										Discord linked
									</span>
								</div>
							)}
						</motion.div>
					</div>
				</div>
			</motion.div>

			{/* Tabs */}
			<div className="mb-6 border-b border-border/30">
				<div className="flex gap-4">
					<button
						onClick={() => setActiveTab('posts')}
						className={`relative border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-300 ${
							activeTab === 'posts'
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
						}`}
					>
						Posts
						{activeTab === 'posts' && (
							<motion.div
								className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary"
								layoutId="activeTabIndicator"
								transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							/>
						)}
					</button>
					<button
						onClick={() => setActiveTab('about')}
						className={`relative border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-300 ${
							activeTab === 'about'
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
						}`}
					>
						About
						{activeTab === 'about' && (
							<motion.div
								className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary"
								layoutId="activeTabIndicator"
								transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							/>
						)}
					</button>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-20">
					<Loader2 className="h-12 w-12 text-primary animate-spin" />
					<p className="mt-4 text-muted-foreground">Loading profile data...</p>
				</div>
			) : (
				<AnimatePresence mode="wait">
					{activeTab === 'posts' ? (
						<motion.div
							key="posts"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
						>
							{posts.length > 0 ? (
								<motion.div
									className="space-y-8"
									variants={containerVariants}
									initial="hidden"
									animate="visible"
								>
									{posts.map((post) => (
										<motion.div key={post.postid} variants={itemVariants}>
											<PostCard {...post} />
										</motion.div>
									))}
								</motion.div>
							) : (
								<motion.div
									className="flex flex-col items-center justify-center py-12 text-center"
									variants={itemVariants}
								>
									<div className="mb-6 rounded-full bg-muted/20 p-6 relative overflow-hidden group">
										<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
										<MessageSquare className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
									</div>
									<h3 className="mb-2 text-2xl font-bold">No posts yet</h3>
									<p className="text-muted-foreground">
										{user.name || user.usertag} hasn't posted anything yet
									</p>
								</motion.div>
							)}
						</motion.div>
					) : (
						<motion.div
							key="about"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
							className="space-y-6"
						>
							<div className="rounded-lg border border-border/30 bg-card/50 p-6 backdrop-blur-sm">
								<h3 className="mb-6 text-xl font-medium">About {user.name || user.usertag}</h3>

								<div className="space-y-6">
									{user.bio && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.1 }}
										>
											<h4 className="mb-2 text-sm font-medium text-muted-foreground">Bio</h4>
											<p className="text-foreground rounded-md bg-muted/10 p-3 border border-border/20">
												{user.bio}
											</p>
										</motion.div>
									)}

									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 }}
									>
										<h4 className="mb-2 text-sm font-medium text-muted-foreground">Badges</h4>
										{user.badges && user.badges.length > 0 ? (
											<div className="flex flex-wrap gap-2">
												{user.badges.map((badge, index) => (
													<motion.span
														key={index}
														className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-foreground border border-accent/20"
														whileHover={{
															scale: 1.05,
															backgroundColor: 'hsla(var(--primary)/0.2)'
														}}
														transition={{ type: 'spring', stiffness: 400, damping: 10 }}
													>
														<Award className="h-3.5 w-3.5 text-primary" />
														{badge}
													</motion.span>
												))}
											</div>
										) : (
											<p className="text-muted-foreground rounded-md bg-muted/10 p-3 border border-border/20">
												No badges yet
											</p>
										)}
									</motion.div>

									{user.discord_id && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.3 }}
										>
											<h4 className="mb-2 text-sm font-medium text-muted-foreground">
												Connected Accounts
											</h4>
											<div className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/10 p-3 transition-all duration-300 hover:bg-muted/20 hover:border-primary/30 group">
												<div className="mr-2 rounded-full bg-[#5865F2]/20 p-1.5">
													<svg
														className="h-4 w-4 text-[#5865F2] group-hover:text-[#5865F2]/80 transition-colors duration-300"
														viewBox="0 0 24 24"
														fill="currentColor"
													>
														<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
													</svg>
												</div>
												<span className="text-sm group-hover:text-primary transition-colors duration-300">
													Discord
												</span>
												<ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
											</div>
										</motion.div>
									)}

									{user.staff_perms && user.staff_perms.length > 0 && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.4 }}
										>
											<h4 className="mb-2 text-sm font-medium text-muted-foreground">
												Staff Permissions
											</h4>
											<div className="flex flex-wrap gap-2">
												{user.staff_perms.map((perm, index) => (
													<motion.span
														key={index}
														className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-foreground border border-primary/20"
														whileHover={{
															scale: 1.05,
															backgroundColor: 'hsla(var(--primary)/0.2)'
														}}
														transition={{ type: 'spring', stiffness: 400, damping: 10 }}
													>
														<Shield className="h-3.5 w-3.5 text-primary" />
														{perm}
													</motion.span>
												))}
											</div>
										</motion.div>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</div>
	);
};

export default ProfileLayout;
