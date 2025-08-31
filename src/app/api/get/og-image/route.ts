import { NextRequest } from 'next/server';
import { fetchStrapiBlogs } from '@/lib/api';
import { generateBlogOGImage } from '@/lib/og-image';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return generateBlogOGImage({
        title: 'Blog Post',
        description: 'AntiRaid Blog - Read the latest news and updates',
        tags: ['Blog'],
        authorName: 'AntiRaid Team',
      });
    }

    // Fetch blog data
    const response = await fetchStrapiBlogs();
    const data = response.data;
    const post = data.find((b: any) => b.slug === slug);

    if (!post) {
      return generateBlogOGImage({
        title: 'Blog Not Found',
        description: 'The blog post you are looking for does not exist.',
        tags: ['Not Found'],
        authorName: 'AntiRaid Team',
      });
    }

    return generateBlogOGImage({
      title: post.title,
      description: post.description,
      tags: post.tags || [],
      slug: post.slug,
      authorName: post.author?.name || post.author?.username || 'AntiRaid Team',
      authorAvatar: post.author?.avatar?.url ? `https://strapi.purrquinox.com${post.author.avatar.url}` : undefined,
    });

  } catch (error) {
    console.error('Error generating OG image:', error);
    
    return generateBlogOGImage({
      title: 'AntiRaid Blog',
      description: 'Read the latest news and updates',
      tags: ['Blog'],
      authorName: 'AntiRaid Team',
    });
  }
}
