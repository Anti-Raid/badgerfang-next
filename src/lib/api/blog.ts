import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';

const IMAGE_PROXY_URL = 'https://bytepurr.purrquinox.com';

const fixImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  const fixed = url.replace(/https:\/\/strapi\.purrquinox\.com/g, IMAGE_PROXY_URL);
  if (fixed.startsWith('/uploads')) {
    return `${IMAGE_PROXY_URL}${fixed}`;
  }
  if (fixed.startsWith('https://purrquinox.com/uploads')) {
    return fixed.replace('https://purrquinox.com/uploads', `${IMAGE_PROXY_URL}/uploads`);
  }
  return fixed;
};

export const fetchStrapiBlogs = async (): Promise<any> => {
  try {
    const response = await fetch('https://purrquinox.com/api/data/blog/list', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.statusText}`);
    }

    const blogs = await response.json();

    const fixedBlogs = (blogs || []).map((blog: any) => ({
      ...blog,
      image: fixImageUrl(blog.image),
      author: blog.author
        ? {
            ...blog.author,
            avatar: fixImageUrl(blog.author.avatar)
          }
        : { name: 'Unknown', avatar: '' }
    }));

    return { data: fixedBlogs };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

export const fetchStrapiBlogBySlug = async (slug: string): Promise<any | null> => {
  const response = await fetchStrapiBlogs();
  const data = response?.data;

  if (!Array.isArray(data)) {
    return null;
  }

  return data.find((blog: any) => blog.slug === slug) || null;
};

export const getStrapiBlogsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await fetchStrapiBlogs();
});

export const getStrapiBlogBySlugFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await fetchStrapiBlogBySlug(slug);
  });

export const strapiBlogsOptions = queryOptions({
  queryKey: ['strapiBlogs'],
  queryFn: () => getStrapiBlogsFn()
});

export const strapiBlogBySlugOptions = (slug: string) =>
  queryOptions({
    queryKey: ['strapiBlog', slug],
    queryFn: () => getStrapiBlogBySlugFn({ data: slug })
  });
