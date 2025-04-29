import BlogLayout from '@/components/blogs/BlogLayout';
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import React, { Suspense } from 'react';
import { generateBlogsMetadata } from '@/lib/Metadata';

export const metadata: Metadata = generateBlogsMetadata({
	canonicalUrl: `${website_url}/blogs`,
});

/**
 * Renders the blog page with asynchronous loading using React Suspense.
 *
 * Wraps the {@link BlogLayout} component in a {@link Suspense} boundary to enable concurrent rendering and deferred loading of blog content.
 */
export default function BlogsPage() {
	return (
		<Suspense>
			<BlogLayout />
		</Suspense>
	);
}
