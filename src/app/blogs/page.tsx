import BlogLayout from '@/components/blogs/BlogLayout';
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import React, { Suspense } from 'react';
import { generateBlogsMetadata } from '@/lib/Metadata';

export const metadata: Metadata = generateBlogsMetadata({
	canonicalUrl: `${website_url}/blogs`,
});

/**
 * Displays the blog listing page with deferred loading via React Suspense.
 *
 * Wraps {@link BlogLayout} in a {@link Suspense} boundary to enable concurrent rendering of blog content.
 */
export default function BlogsPage() {
	return (
		<Suspense>
			<BlogLayout />
		</Suspense>
	);
}
