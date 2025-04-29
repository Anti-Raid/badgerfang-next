import React from 'react';
import BlogSlugLayout from '@/components/blogs/BlogSlugLayout';
import type { Blog } from '@/types/blogs';
import { generateBlogMetadata } from '@/lib/Metadata';
import type { Metadata } from 'next';

/**
 * Generates dynamic metadata for a blog post page using the provided slug.
 *
 * If a blog post matching the slug exists, returns metadata with the post's title, description, tags as keywords, and image. If not found, returns fallback metadata indicating the post does not exist.
 *
 * @param params - Promise resolving to an object containing the blog post slug.
 * @returns Metadata for the blog post or fallback metadata if not found.
 */
export async function generateMetadata({
	params
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/get/blogs`, {
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
 * Renders the blog post page for the specified slug using a client-side layout component.
 *
 * Awaits the route parameters to obtain the blog post slug and passes it to {@link BlogSlugLayout} for rendering and data fetching.
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	return <BlogSlugLayout slug={slug} />;
}
