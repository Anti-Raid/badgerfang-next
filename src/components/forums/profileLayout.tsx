'use client';

import type { users as User } from '@/types/forums/types';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUserPlus, FaUserCheck, FaLink, FaCalendarAlt } from 'react-icons/fa';
import { HiOutlineDotsHorizontal, HiSparkles, HiPhotograph, HiBookmark } from 'react-icons/hi';

interface ProfileLayoutProps {
	children: React.ReactNode;
	user: User;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, user }) => {
	const [isFollowing, setIsFollowing] = useState(false);
	const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'saved'>('posts');

	const toggleFollow = () => {
		setIsFollowing(!isFollowing);
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-6">
			<div className="relative mb-6">
				{/* Banner */}
				<div className="h-48 w-full rounded-xl bg-gradient-to-r from-primary/30 via-extra/20 to-primary/10 overflow-hidden">
					<motion.div
						className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] bg-cover bg-center opacity-30 mix-blend-overlay"
						initial={{ scale: 1.1 }}
						animate={{ scale: 1 }}
						transition={{ duration: 1.5 }}
					/>
				</div>

				{/* Profile Info */}
				<div className="relative px-6">
					<div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-12">
						{/* Avatar */}
						<motion.div
							className="relative h-32 w-32 rounded-full border-4 border-background overflow-hidden"
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							<Image
								src={user.avatar || '/placeholder.svg?height=128&width=128'}
								alt={`${user.name || user.usertag}'s avatar`}
								fill
								className="object-cover"
							/>
							<div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent mix-blend-overlay" />
						</motion.div>

						<div className="flex-1 pb-4">
							<motion.div
								className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<div>
									<h1 className="text-2xl font-bold flex items-center gap-2">
										{user.name || user.usertag}
										<HiSparkles className="text-primary h-5 w-5" />
									</h1>
									<p className="text-muted-foreground">@{user.usertag}</p>
								</div>

								<div className="flex gap-2">
									<motion.button
										className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${
											isFollowing
												? 'bg-card border border-border/50 text-foreground hover:bg-destructive hover:text-destructive-foreground'
												: 'bg-primary text-primary-foreground hover:bg-primary/90'
										}`}
										onClick={toggleFollow}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										{isFollowing ? (
											<>
												<FaUserCheck className="h-4 w-4" />
												Following
											</>
										) : (
											<>
												<FaUserPlus className="h-4 w-4" />
												Follow
											</>
										)}
									</motion.button>
									<button className="p-2 rounded-md bg-card/50 backdrop-blur-sm border border-border/30 text-muted-foreground hover:bg-card/80 transition-all">
										<HiOutlineDotsHorizontal className="h-5 w-5" />
									</button>
								</div>
							</motion.div>
						</div>
					</div>

					<motion.div
						className="mt-4 space-y-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<p className="text-foreground/90">{user.bio}</p>

						<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
							{user?.posts?.[0]?.createdat && (
								<div className="flex items-center gap-1.5">
									<FaCalendarAlt className="h-4 w-4" />
									<span>Joined {new Date(user.posts[0].createdat).toLocaleDateString()}</span>
								</div>
							)}
							<Link
								href="#"
								className="flex items-center gap-1.5 hover:text-primary transition-colors"
							>
								<FaLink className="h-4 w-4" />
								<span>antiraid.xyz</span>
							</Link>
						</div>

						<div className="flex gap-6 text-sm">
							<div className="font-medium">
								<span className="text-foreground">{user.following.length}</span>{' '}
								<span className="text-muted-foreground">Following</span>
							</div>
							<div className="font-medium">
								<span className="text-foreground">{user.followers.length}</span>{' '}
								<span className="text-muted-foreground">Followers</span>
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Tabs */}
			<div className="mb-6 border-b border-border/30">
				<div className="flex space-x-8">
					<button
						onClick={() => setActiveTab('posts')}
						className={`pb-3 text-sm font-medium transition-all border-b-2 ${
							activeTab === 'posts'
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/50'
						}`}
					>
						Posts
					</button>
					<button
						onClick={() => setActiveTab('media')}
						className={`flex items-center gap-1.5 pb-3 text-sm font-medium transition-all border-b-2 ${
							activeTab === 'media'
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/50'
						}`}
					>
						<HiPhotograph className="h-4 w-4" />
						Media
					</button>
					<button
						onClick={() => setActiveTab('saved')}
						className={`flex items-center gap-1.5 pb-3 text-sm font-medium transition-all border-b-2 ${
							activeTab === 'saved'
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/50'
						}`}
					>
						<HiBookmark className="h-4 w-4" />
						Saved
					</button>
				</div>
			</div>

			{/* Content */}
			<div className="space-y-6">{children}</div>
		</div>
	);
};

export default ProfileLayout;
