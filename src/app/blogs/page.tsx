import BlogLayout from '@/components/blogs/BlogLayout';
import { Metadata } from 'next';
import { title, description } from '@/components/common';

export const metadata: Metadata = {
	title: 'Blog',
	description: `${description}`
};

export default function BlogsPage() {
	return <BlogLayout />;
}
