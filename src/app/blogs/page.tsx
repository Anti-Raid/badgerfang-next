import BlogLayout from '@/components/blogs/BlogLayout';
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import React, { Suspense } from 'react';
import { generateBlogsMetadata } from '@/lib/Metadata';

export const metadata: Metadata = generateBlogsMetadata({
	canonicalUrl: `${website_url}/blogs`,
});

/**
 * Displays the blog page, enabling asynchronous loading of its content with React Suspense.
 *
 * Wraps the {@link BlogLayout} component in a {@link Suspense} boundary to support concurrent rendering.
 */
export default function BlogsPage() {
	return (
		<Suspense>
			<BlogLayout />
		</Suspense>
	);
}
