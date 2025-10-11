import { NextRequest } from 'next/server';
import { fetchStrapiBlogs, fetchStrapiBlogBySlug } from '@/lib/api';
import { generateBlogOGImage } from '@/lib/og-image';

export const runtime = 'edge';

// Simple in-memory cache for blog data (will reset on server restart)
const blogCache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - increased cache duration
let lastFetchTime = 0;

/**
 * Retrieve blog entries using the in-memory cache, falling back to a fresh fetch when necessary.
 */
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

/**
 * Fetches the latest blogs from Strapi and refreshes the in-memory cache.
 */
async function fetchFreshBlogs() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout

    const response = await fetchStrapiBlogs();
    clearTimeout(timeoutId);

    // Access the 'data' property from the response
    const data = response.data;

    // Ensure 'data' is an array before proceeding
    if (!Array.isArray(data)) {
      throw new Error('Expected an array of blogs');
    }

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

/**
 * Refreshes the in-memory blog cache in the background.
 */
async function refreshCacheInBackground() {
	try {
		// Corrected: fetchStrapiBlogs returns the array directly
		const data = await fetchStrapiBlogs();

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

/**
 * Retrieve a blog post by its slug.
 */
async function getBlogBySlug(slug: string) {
	try {
		// Try cache first
		const cachedBlogs = Array.from(blogCache.values());
		const cachedBlog = cachedBlogs.find((b: any) => b.slug === slug);

		if (cachedBlog) return cachedBlog;

		// Try single fetch
		try {
			const singleBlog = await fetchStrapiBlogBySlug(slug);
			if (singleBlog) {
				blogCache.set(singleBlog.slug, singleBlog);
				return singleBlog;
			}
		} catch (singleFetchError) {
			console.log('Single blog fetch failed, falling back to full fetch:', singleFetchError);
		}

		// Fallback to fetching all blogs
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

/**
 * Serve an Open Graph PNG image for the blog index or a specific post.
 */
export async function GET(request: NextRequest) {
	const startTime = Date.now();

	try {
		const { searchParams } = new URL(request.url);
		const slug = searchParams.get('slug');

		const headers = {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=3600',
			'CDN-Cache-Control': 'public, max-age=600'
		};

		if (!slug) {
			const response = generateBlogOGImage({
				title: 'Blog Post',
				description: 'AntiRaid Blog - Read the latest news and updates',
				tags: ['Blog'],
				authorName: 'AntiRaid Team'
			});

			Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
			return response;
		}

		const post = await getBlogBySlug(slug);

		if (!post) {
			const response = generateBlogOGImage({
				title: 'Blog Not Found',
				description: 'The blog post you are looking for does not exist.',
				tags: ['Not Found'],
				authorName: 'AntiRaid Team'
			});

			Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
			return response;
		}

		const response = generateBlogOGImage({
			title: post.title,
			description: post.description,
			tags: post.tags || [],
			slug: post.slug,
			authorName: post.author?.name || post.author?.username || 'AntiRaid Team',
			authorAvatar: post.author?.avatar?.url
				? `https://strapi.purrquinox.com${post.author.avatar.url}`
				: undefined
		});

		Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
		response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

		return response;
	} catch (error) {
		console.error('Error generating OG image:', error);

		const response = generateBlogOGImage({
			title: 'AntiRaid Blog',
			description: 'Read the latest news and updates',
			tags: ['Blog'],
			authorName: 'AntiRaid Team'
		});

		response.headers.set('Content-Type', 'image/png');
		response.headers.set(
			'Cache-Control',
			'public, max-age=60, s-maxage=60, stale-while-revalidate=300'
		);
		response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

		return response;
	}
}
