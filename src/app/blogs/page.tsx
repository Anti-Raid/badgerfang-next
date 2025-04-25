import BlogLayout from '@/components/blogs/BlogLayout';
import { Metadata } from 'next';
import { title, description } from '@/components/common';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Blog',
	description: `${description}`
};

export default function BlogsPage() {
	return (
		<Suspense>
			<BlogLayout />
		</Suspense>
	);
}
