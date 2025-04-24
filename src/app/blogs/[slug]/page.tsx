import BlogSlugLayout from '@/components/blogs/BlogSlugLayout';
import { Metadata } from 'next';
import { title, description } from '@/components/common';

export const metadata: Metadata = {
	title: 'Blog',
	description: `${description}`
};

export default function BlogSlugPage() {
	return <BlogSlugLayout />;
}
