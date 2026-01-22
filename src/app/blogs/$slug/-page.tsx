import React from 'react';
import BlogSlugLayout from '@/components/blogs/BlogSlugLayout';
import type { Blog } from '@/types/blogs';
import { generateBlogMetadata } from '@/lib/Metadata';
import type { Metadata } from 'next';
import { fetchStrapiBlogs } from '@/lib/api';

/**
 * Generates metadata for a blog post page based on the provided slug.
 *
 * Fetches blog data and returns metadata for the matching post, or fallback metadata if the post does not exist.
 *
 * @param params - Promise resolving to an object containing the blog post slug.
 * @returns Metadata for the specified blog post, or fallback metadata if not found.
 */
export async function generateMetadata({
	params
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;

	try {
		const response = await fetchStrapiBlogs();
		const data = response.data;
		const post = data.find((b: any) => b.slug === slug);

		if (!post) {
			// Handle the case where post is undefined
			return generateBlogMetadata({
				title: 'Not Found',
				description: 'The blog post you are looking for does not exist.',
				imageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://antiraid.xyz'}/api/get/og-image?slug=${slug}`,
				keywords: [],
				canonicalUrl: `https://antiraid.xyz/blogs/${slug}`
			});
		}

		return generateBlogMetadata({
			title: post.title,
			description: post.description,
			imageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://antiraid.xyz'}/api/get/og-image?slug=${post.slug}`,
			keywords: post.tags || [],
			canonicalUrl: `https://antiraid.xyz/blogs/${post.slug}`
		});
	} catch (error) {
		console.error('Error fetching blog metadata:', error);
		// Return fallback metadata if API call fails
		return generateBlogMetadata({
			title: 'Blog Post',
			description: 'Loading blog post...',
			imageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://antiraid.xyz'}/api/get/og-image?slug=${slug}`,
			keywords: [],
			canonicalUrl: `https://antiraid.xyz/blogs/${slug}`
		});
	}
}

/**
 * Renders the blog post page for a given slug using the client-side blog layout.
 *
 * Awaits the route parameters to extract the blog post slug and passes it to {@link BlogSlugLayout} for client-side rendering and data fetching.
 *
 * @param params - A promise resolving to an object containing the blog post slug.
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	return <BlogSlugLayout slug={slug} />;
}
