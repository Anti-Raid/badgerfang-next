'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getForumUser, listForumUserPosts } from '@/lib/api';
import type { users, posts } from '@/types/forums/types';
import ProfileLayout from '@/components/forums/profileLayout';

/**
 * Displays a forum user's profile page, including their information and posts.
 *
 * Fetches user data and posts based on the username from the URL, handling loading and error states. If the user does not exist or an error occurs, a 404 page is shown.
 */
export default function UserProfilePage() {
	const { username } = useParams();
	const [user, setUser] = useState<users | null>(null);
	const [posts, setPosts] = useState<posts[]>([]);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (typeof username !== 'string') {
			setError(true);
			return;
		}

		const cleanedUsername = username.startsWith('@') ? username.slice(1) : username;

		const fetchData = async () => {
			try {
				const userRes = await getForumUser(cleanedUsername);
				if (userRes instanceof Error) {
					setError(true);
					return;
				}
				setUser(userRes);

				const postsRes = await listForumUserPosts(cleanedUsername);
				setPosts(postsRes instanceof Error ? [] : postsRes);
			} catch (err) {
				console.error('Error fetching user profile:', err);
				setError(true);
			}
		};

		fetchData();
	}, [username]);

	if (error) {
		notFound();
	}

	if (!user) {
		return <div className="text-center py-8">Loading profile...</div>;
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<ProfileLayout user={user} posts={posts} />
		</main>
	);
}
