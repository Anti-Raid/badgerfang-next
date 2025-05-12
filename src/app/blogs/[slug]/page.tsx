import React from 'react';
import BlogSlugLayout from '@/components/blogs/BlogSlugLayout';
import type { Blog } from '@/types/blogs';
import { generateBlogMetadata } from '@/lib/Metadata';
import type { Metadata } from 'next';
import { website_url } from '@/components/common';

/**
 * Generates metadata for a blog post page using the provided slug.
 *
 * If a blog post matching the slug exists, returns metadata including the post's title, description, tags as keywords, image URL if present, and a canonical URL. If no matching post is found, returns fallback metadata indicating the post was not found.
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
	const res = await fetch(`${website_url}/api/get/blogs`, {
		cache: 'no-store'
	});
	const data: Blog[] = await res.json();
	const post = data.find((b) => b.slug === slug);

	if (!post) {
		// Handle the case where post is undefined
		return generateBlogMetadata({
			title: 'Not Found',
			description: 'The blog post you are looking for does not exist.',
			imageUrl: undefined,
			keywords: [],
			canonicalUrl: `https://antiraid.xyz/blogs/${slug}`
		});
	}

	return generateBlogMetadata({
		title: post.title,
		description: post.description,
		imageUrl: post.image ? `https://strapi.purrquinox.com${post.image.url}` : undefined,
		keywords: post.tags || [],
		canonicalUrl: `https://antiraid.xyz/blogs/${post.slug}`
	});
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
