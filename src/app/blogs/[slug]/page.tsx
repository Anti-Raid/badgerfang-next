import React from 'react';
import BlogSlugLayout from '@/components/blogs/BlogSlugLayout';
import type { Blog } from '@/types/blogs';
import { generateBlogMetadata } from '@/lib/Metadata';
import type { Metadata } from 'next';

/**
 * Generate dynamic metadata for each blog post based on its slug.
 * Fetches all blogs, finds the one matching the slug,
 * then uses the shared metadata util from @/lib/metadata.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/get/blogs`, { cache: 'no-store' });
  const data: Blog[] = await res.json();
  const post = data.find((b) => b.slug === slug);

  if (!post) {
    // Handle the case where post is undefined
    return generateBlogMetadata({
      title: 'Not Found',
      description: 'The blog post you are looking for does not exist.',
      imageUrl: undefined,
      keywords: [],
      canonicalUrl: `https://antiraid.xyz/blogs/${slug}`,
    });
  }

  return generateBlogMetadata({
    title: post.title,
    description: post.description,
    imageUrl: post.image ? `https://strapi.purrquinox.com${post.image.url}` : undefined,
    keywords: post.tags || [],
    canonicalUrl: `https://antiraid.xyz/blogs/${post.slug}`,
  });
}

/**
 * Server component wrapper that renders the client-only BlogPostLayout.
 * Passes the slug down as a prop so the client component can fetch its data.
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogSlugLayout slug={slug} />;
}
