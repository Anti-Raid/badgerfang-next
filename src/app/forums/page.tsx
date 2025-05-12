import { listForumPosts } from '@/lib/api';
import FeedLayout from '@/components/forums/feedLayout';
import type { posts } from "@/types/forums/types"
import { generateFourmsMetadata } from "@/lib/Metadata"
import { Metadata } from 'next';
import { website_url } from '@/components/common';

export const metadata: Metadata = generateFourmsMetadata({
	canonicalUrl: `${website_url}/forums`
});

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
