import BlogLayout from '@/components/blogs/BlogLayout';
import { Metadata } from 'next';
import { title, description } from '@/components/common';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Blog',
	description: `${description}`
};

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
