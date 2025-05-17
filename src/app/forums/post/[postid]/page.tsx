'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getForumPost } from '@/lib/api';
import type { posts } from '@/types/forums/types';
import PostDetail from '@/components/forums/postsLayout';

/**
 * Renders a forum post page based on the dynamic `postid` route parameter.
 *
 * Fetches the post data using the `postid` from the URL, manages loading and error states, and displays the post details. If the post is not found or an error occurs, a 404 page is triggered.
 *
 * @remark Triggers Next.js's 404 page if the `postid` is invalid or the post cannot be fetched.
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
