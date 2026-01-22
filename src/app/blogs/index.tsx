import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import BlogLayout from '@/components/blogs/BlogLayout';
import { website_url } from '@/components/common';
import { generateBlogsMetadata } from '@/lib/Metadata';
import { strapiBlogsOptions } from '@/lib/api';

export const Route = createFileRoute('/blogs/')({
	loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(strapiBlogsOptions),
	component: BlogsPage,
	head: () =>
		generateBlogsMetadata({
			canonicalUrl: `${website_url}/blogs`
		}),
	// Enable SSR for better SEO
	ssr: true
});

function BlogsPage() {
	const { data } = useSuspenseQuery(strapiBlogsOptions);
	return <BlogLayout blogs={data.data} />;
}
