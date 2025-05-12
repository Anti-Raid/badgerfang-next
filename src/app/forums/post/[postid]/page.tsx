'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getForumPost } from '@/lib/api';
import type { posts } from '@/types/forums/types';
import PostDetail from '@/components/forums/postsLayout';

/**
 * Displays a forum post based on the dynamic `postid` route parameter.
 *
 * Fetches post data using the `postid` from the URL, handles loading and error states, and renders the post details. If the post is not found or an error occurs, triggers a 404 page.
 */
export default function PostPage() {
	const { postid } = useParams();
	const [post, setPost] = useState<posts | null>(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (typeof postid !== 'string') {
			setError(true);
			return;
		}

		const fetchPost = async () => {
			try {
				const result = await getForumPost(postid);

				if (!result || typeof result !== 'object' || Array.isArray(result)) {
					setError(true);
				} else {
					setPost(result as unknown as posts);
				}
			} catch (err) {
				console.error('Error fetching post:', err);
				setError(true);
			}
		};

		fetchPost();
	}, [postid]);

	if (error) {
		notFound();
	}

	if (!post) {
		return <div className="text-center py-8">Loading...</div>;
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<PostDetail post={post} />
		</main>
	);
}
