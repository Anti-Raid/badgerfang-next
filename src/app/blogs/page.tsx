import BlogLayout from '@/components/blogs/BlogLayout';
import { Metadata } from 'next';
import { title, description } from '@/components/common';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Blog',
	description: `${description}`
};

/**
 * Renders the blog page with concurrent loading support using React Suspense.
 *
 * Wraps the {@link BlogLayout} component in a {@link Suspense} boundary to enable asynchronous rendering.
 */
export default function BlogsPage() {
	return (
		<Suspense>
			<BlogLayout />
		</Suspense>
	);
}
