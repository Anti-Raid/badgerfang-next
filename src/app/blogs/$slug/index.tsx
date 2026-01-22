import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import BlogSlugLayout from '@/components/blogs/BlogSlugLayout';
import { generateBlogMetadata, generateArticleStructuredData } from '@/lib/Metadata';
import { strapiBlogBySlugOptions } from '@/lib/api';

export const Route = createFileRoute('/blogs/$slug/')({
    loader: async ({ context: { queryClient }, params }) => {
        return queryClient.ensureQueryData(strapiBlogBySlugOptions(params.slug));
    },
    head: ({ loaderData, params }) => {
        const post = loaderData;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://antiraid.xyz';
        
        if (!post) {
            return generateBlogMetadata({
                title: 'Not Found',
                description: 'The blog post you are looking for does not exist.',
                imageUrl: `${appUrl}/api/get/og-image?slug=${params.slug}`,
                keywords: [],
                canonicalUrl: `https://antiraid.xyz/blogs/${params.slug}`,
                robots: 'noindex, nofollow'
            });
        }
        
        const metadata = generateBlogMetadata({
            title: post.title,
            description: post.description,
            imageUrl: `${appUrl}/api/get/og-image?slug=${post.slug}`,
            keywords: post.tags || [],
            canonicalUrl: `https://antiraid.xyz/blogs/${post.slug}`,
            ogType: 'article',
            articleAuthor: post.author?.name || 'AntiRaid Team',
            articlePublishedTime: post.publishedAt,
            articleTags: post.tags || []
        });

        // Add Article structured data for LLMO
        const articleStructuredData = generateArticleStructuredData({
            title: post.title,
            description: post.description,
            image: post.image?.url || post.og?.url || `${appUrl}/api/get/og-image?slug=${post.slug}`,
            author: {
                name: post.author?.name || 'AntiRaid Team',
                avatar: post.author?.avatar?.url,
                url: post.author?.socials?.find((s: any) => s.platform === 'website')?.url
            },
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            url: `https://antiraid.xyz/blogs/${post.slug}`,
            tags: post.tags || []
        });

        return {
            ...metadata,
            scripts: [
                ...(metadata.scripts || []),
                {
                    type: 'application/ld+json',
                    children: JSON.stringify(articleStructuredData)
                }
            ]
        };
    },
	component:  Page,
    // Enable SSR for better SEO
    ssr: true
});

function Page() {
    const params = Route.useParams();
    const { data: post } = useSuspenseQuery(strapiBlogBySlugOptions(params.slug));
	return <BlogSlugLayout slug={params.slug} initialPost={post} />;
}
