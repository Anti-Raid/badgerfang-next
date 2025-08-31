import { NextRequest } from 'next/server';
import { fetchStrapiBlogs, fetchStrapiBlogBySlug } from '@/lib/api';
import { generateBlogOGImage } from '@/lib/og-image';

export const runtime = 'edge';

// Simple in-memory cache for blog data (will reset on server restart)
const blogCache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - increased cache duration
let lastFetchTime = 0;

async function getCachedBlogs() {
  const now = Date.now();
  
  // If cache is fresh, return cached data
  if (now - lastFetchTime < CACHE_DURATION && blogCache.size > 0) {
    return Array.from(blogCache.values());
  }
  
  // If we have stale cache, return it immediately and refresh in background
  if (blogCache.size > 0) {
    console.log('Returning stale cache while refreshing in background');
    
    // Refresh in background (don't await)
    refreshCacheInBackground();
    
    return Array.from(blogCache.values());
  }
  
  // No cache available, must fetch
  return await fetchFreshBlogs();
}

async function fetchFreshBlogs() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout
    
    const response = await fetchStrapiBlogs();
    clearTimeout(timeoutId);
    
    const data = response.data;
    
    // Update cache
    blogCache.clear();
    data.forEach((blog: any) => {
      blogCache.set(blog.slug, blog);
    });
    lastFetchTime = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

async function refreshCacheInBackground() {
  try {
    const response = await fetchStrapiBlogs();
    const data = response.data;
    
    // Update cache
    blogCache.clear();
    data.forEach((blog: any) => {
      blogCache.set(blog.slug, blog);
    });
    lastFetchTime = Date.now();
    
    console.log('Background cache refresh successful');
  } catch (error) {
    console.error('Background cache refresh failed:', error);
    // Don't throw - this is background refresh
  }
}

async function getBlogBySlug(slug: string) {
  try {
    // First try to get from cache
    const cachedBlogs = Array.from(blogCache.values());
    const cachedBlog = cachedBlogs.find((b: any) => b.slug === slug);
    
    if (cachedBlog) {
      return cachedBlog;
    }
    
    // If not in cache, try to fetch single blog (more efficient)
    try {
      const singleBlog = await fetchStrapiBlogBySlug(slug);
      if (singleBlog) {
        // Add to cache
        blogCache.set(singleBlog.slug, singleBlog);
        return singleBlog;
      }
    } catch (singleFetchError) {
      console.log('Single blog fetch failed, falling back to full fetch:', singleFetchError);
    }
    
    // Fallback to fetching all blogs and caching them
    try {
      const blogs = await getCachedBlogs();
      return blogs.find((b: any) => b.slug === slug);
    } catch (fullFetchError) {
      console.log('Full fetch also failed, returning null:', fullFetchError);
      return null;
    }
  } catch (error) {
    console.error('Error getting blog by slug:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');


    // Set response headers for better caching
    const headers = {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=3600', // 10 minutes cache, 1 hour stale-while-revalidate
      'CDN-Cache-Control': 'public, max-age=600',
    };

    if (!slug) {
      const response = generateBlogOGImage({
        title: 'Blog Post',
        description: 'AntiRaid Blog - Read the latest news and updates',
        tags: ['Blog'],
        authorName: 'AntiRaid Team',
      });
      
      // Add headers to the response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    // Try to get the specific blog post
    const post = await getBlogBySlug(slug);

    if (!post) {
      const response = generateBlogOGImage({
        title: 'Blog Not Found',
        description: 'The blog post you are looking for does not exist.',
        tags: ['Not Found'],
        authorName: 'AntiRaid Team',
      });
      
      // Add headers to the response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    const response = generateBlogOGImage({
      title: post.title,
      description: post.description,
      tags: post.tags || [],
      slug: post.slug,
      authorName: post.author?.name || post.author?.username || 'AntiRaid Team',
      authorAvatar: post.author?.avatar?.url ? `https://strapi.purrquinox.com${post.author.avatar.url}` : undefined,
    });

    // Add headers to the response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add performance header
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    return response;

  } catch (error) {
    console.error('Error generating OG image:', error);
    
    const response = generateBlogOGImage({
      title: 'AntiRaid Blog',
      description: 'Read the latest news and updates',
      tags: ['Blog'],
      authorName: 'AntiRaid Team',
    });
    
    // Add headers to the response
    response.headers.set('Content-Type', 'image/png');
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300'); // 1 minute cache for errors, 5 minutes stale-while-revalidate
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    
    return response;
  }
}
