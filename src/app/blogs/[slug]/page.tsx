import React, { Suspense } from 'react';
import BlogSlugLayout from '@/components/blogs/BlogSlugLayout';
import { Metadata } from 'next';
import { title, description } from '@/components/common';

export const metadata: Metadata = {
	title: 'Blog',
	description: `${description}`
};

/**
 * Renders the blog post page for a specific slug, displaying its content within a suspense boundary.
 *
 * @returns The blog post layout wrapped in a React Suspense component.
 */
export default function BlogSlugPage() {
	return (
		<Suspense>
			<BlogSlugLayout />
		</Suspense>
	);
}
