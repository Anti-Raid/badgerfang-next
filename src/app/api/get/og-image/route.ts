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
 *
 * Returns cached entries immediately when available; if the cache is stale it returns the cached entries
 * while triggering an asynchronous background refresh; if no cache exists it fetches fresh data before returning.
 *
 * @returns An array of blog entries from the cache or from a fresh fetch if no cached data exists
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
 * Fetches the latest blogs from the Strapi source and refreshes the in-memory cache.
 *
 * This function requests all blogs, updates `blogCache` keyed by each blog's `slug`, and sets `lastFetchTime` to the current time. The request is aborted if it does not complete within 6 seconds. Errors encountered while fetching are logged and rethrown.
 *
 * @returns The array of blog entries returned by the Strapi API (`response.data`).
 */
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

/**
 * Refreshes the in-memory blog cache in the background.
 *
 * Fetches the latest blog list from the Strapi source, replaces the in-memory cache entries keyed by slug, and updates the cache timestamp. Errors are caught and logged; failures do not throw.
 */
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

/**
 * Retrieve a blog post by its slug, preferring the in-memory cache and falling back to API fetches.
 *
 * If the blog is found in cache it is returned immediately; otherwise the function attempts a single-item
 * fetch and then a full fetch as a last resort. A blog successfully fetched from the API is added to the
 * in-memory cache.
 *
 * @param slug - The blog post's slug identifier
 * @returns The blog object if found, `null` otherwise
 */
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

/**
 * Serve an Open Graph PNG image for the blog index or for a specific post identified by the `slug` query parameter.
 *
 * Generates:
 * - a generic "Blog Post" image when no `slug` is provided;
 * - a post-specific image when a matching blog post is found;
 * - a "Blog Not Found" image when a `slug` is provided but no post exists;
 * - a fallback generic image on error.
 *
 * Responses include caching headers (10 minute max-age for successful responses; reduced caching on error) and an `X-Response-Time` header indicating request handling time.
 */
export async function GET(request: NextRequest) {
	const startTime = Date.now();

	try {
		const { searchParams } = new URL(request.url);
		const slug = searchParams.get('slug');

		// Set response headers for better caching
		const headers = {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=3600', // 10 minutes cache, 1 hour stale-while-revalidate
			'CDN-Cache-Control': 'public, max-age=600'
		};

		if (!slug) {
			const response = generateBlogOGImage({
				title: 'Blog Post',
				description: 'AntiRaid Blog - Read the latest news and updates',
				tags: ['Blog'],
				authorName: 'AntiRaid Team'
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
				authorName: 'AntiRaid Team'
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
			authorAvatar: post.author?.avatar?.url
				? `https://strapi.purrquinox.com${post.author.avatar.url}`
				: undefined
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
			authorName: 'AntiRaid Team'
		});

		// Add headers to the response
		response.headers.set('Content-Type', 'image/png');
		response.headers.set(
			'Cache-Control',
			'public, max-age=60, s-maxage=60, stale-while-revalidate=300'
		); // 1 minute cache for errors, 5 minutes stale-while-revalidate
		response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

		return response;
	}
}