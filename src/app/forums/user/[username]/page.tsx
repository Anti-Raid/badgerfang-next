import React from 'react';
import { notFound } from 'next/navigation';
import { getForumUser, listForumUserPosts } from '@/lib/api';
import type { posts as Post, users as User } from '@/types/forums/types';
import PostCard from '@/components/forums/components/PostCard';
import ProfileLayout from '@/components/forums/profileLayout';

async function getUser(username: string) {
	try {
		const user = await getForumUser(username);
		if (user instanceof Error) {
			console.error('Error fetching user:', user);
			return null;
		}
		return user;
	} catch (error) {
		console.error('Error in getUser:', error);
		return null;
	}
}

async function getUserPosts(username: string) {
	try {
		const posts = await listForumUserPosts(username);
		if (posts instanceof Error) {
			console.error('Error fetching user posts:', posts);
			return [];
		}
		return posts;
	} catch (error) {
		console.error('Error in getUserPosts:', error);
		return [];
	}
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
	const user = await getUser(params.username);

	if (!user) {
		notFound();
	}

	const posts = await getUserPosts(params.username);

	return (
		<ProfileLayout user={user}>
			{posts.length > 0 ? (
				posts.map((post) => <PostCard key={post.postid} {...post} />)
			) : (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<div className="rounded-full bg-primary/10 p-6 mb-4">
						<svg
							className="h-10 w-10 text-primary"
							fill="none"
							height="24"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							width="24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
							<polyline points="14 2 14 8 20 8" />
							<path d="M12 18v-6" />
							<path d="M8 18v-1" />
							<path d="M16 18v-3" />
						</svg>
					</div>
					<h3 className="text-xl font-bold">No posts yet</h3>
					<p className="text-muted-foreground mt-2 max-w-md">
						{user.name} hasn't posted anything yet.
					</p>
				</div>
			)}
		</ProfileLayout>
	);
}
