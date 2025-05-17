import { listForumPosts } from '@/lib/api';
import FeedLayout from '@/components/forums/feedLayout';
import type { posts } from '@/types/forums/types';
import { generateFourmsMetadata } from '@/lib/Metadata';
import { Metadata } from 'next';
import { website_url } from '@/components/common';

export const metadata: Metadata = generateFourmsMetadata({
	canonicalUrl: `${website_url}/forums`
});

/**
 * Fetches forum posts, returning an empty array if fetching fails or an error is encountered.
 *
 * @returns An array of forum posts, or an empty array on failure.
 */
async function getPosts() {
	try {
		const posts = await listForumPosts();
		if (posts instanceof Error) {
			console.error('Error fetching posts:', posts);
			return [];
		}
		return posts;
	} catch (error) {
		console.error('Error in getPosts:', error);
		return [];
	}
}

/**
 * Displays the community forums feed page with the latest posts.
 *
 * Retrieves forum posts and renders them in the {@link FeedLayout} component with a title and description.
 */
export default async function ForumsPage() {
	const posts = await getPosts();

	return (
		<main className="container mx-auto px-4 py-8">
			<FeedLayout
				posts={posts as posts[]}
				title="Community Feed"
				description="Check out the latest posts from the community"
			/>
		</main>
	);
}
