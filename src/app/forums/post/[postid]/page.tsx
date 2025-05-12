import { getForumPost } from '@/lib/api';
import type { posts } from '@/types/forums/types';
import PostDetail from '@/components/forums/postsLayout';
import { notFound } from 'next/navigation';
import { website_url } from '@/components/common';
import { generateForumPostMetadata } from '@/lib/Metadata';
import { Metadata } from 'next';

type Params = {
  params: {
    postid: string;
  };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getForumPost(params.postid);

  if (post instanceof Error || !post || typeof post !== 'object' || Array.isArray(post)) {
    return {
      title: 'Post Not Found',
      description: 'This forum post does not exist.',
    };
  }

  const typedPost = post as posts;

  return generateForumPostMetadata({
    title: typedPost.caption,
    description: typedPost.caption.slice(0, 160),
    imageUrl: typedPost.image || undefined,
    keywords: ['Forum', 'Antiraid', 'Post'],
    canonicalUrl: `${website_url}/forums/post/${params.postid}`,
  });
}

export default async function PostPage({ params }: Params) {
  try {
    const post = await getForumPost(params.postid);

    if (post instanceof Error || !post || typeof post !== 'object' || Array.isArray(post)) {
      notFound();
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <PostDetail post={post as posts} />
      </main>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}
