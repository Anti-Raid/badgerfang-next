import { NextRequest, NextResponse } from 'next/server';
import { fetchStrapiBlogs, fetchStrapiBlogBySlug } from '@/lib/api';
import { generateBlogOGImage } from '@/lib/og-image';

export const runtime = 'edge';

// Simple in-memory cache for blog data (will reset on server restart)
const blogCache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
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
		const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

		const response = await fetchStrapiBlogs();
		clearTimeout(timeoutId);

		// Access the 'data' property from the response
		const data = response.data;

		// Ensure 'data' is an array before proceeding
		if (!Array.isArray(data)) {
			console.error('Expected an array of blogs, got:', typeof data);
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
async function getBlogBySlug(slug: string): Promise<any | null> {
	try {
		// Try cache first
		if (blogCache.has(slug)) {
			console.log(`Found blog in cache: ${slug}`);
			return blogCache.get(slug);
		}

		// Try single fetch with timeout
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

			const singleBlog = await fetchStrapiBlogBySlug(slug);
			clearTimeout(timeoutId);

			if (singleBlog) {
				blogCache.set(singleBlog.slug, singleBlog);
				return singleBlog;
			}
		} catch (singleFetchError) {
			console.log('Single blog fetch failed, falling back to full fetch:', singleFetchError);
		}

		// Fallback to fetching all blogs with timeout
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

			const blogs = await getCachedBlogs();
			clearTimeout(timeoutId);

			const foundBlog = blogs.find((b: any) => b.slug === slug);
			if (foundBlog) {
				blogCache.set(foundBlog.slug, foundBlog);
			}
			return foundBlog || null;
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

		// Common headers for all responses
		const commonHeaders = {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
			'CDN-Cache-Control': 'public, max-age=3600',
			'X-Content-Type-Options': 'nosniff',
		};

		// If no slug provided, return default blog image
		if (!slug) {
			const imageResponse = generateBlogOGImage({
				title: 'AntiRaid Blog',
				description: 'Read the latest news and updates from the AntiRaid team',
				tags: ['Blog', 'Updates'],
				authorName: 'AntiRaid Team'
			});

			// Ensure we return an ImageResponse properly
			const response = new NextResponse(imageResponse.body, {
				status: 200,
				headers: {
					...commonHeaders,
					'X-Response-Time': `${Date.now() - startTime}ms`,
				}
			});

			return response;
		}

		// Fetch blog post by slug with timeout protection
		const post = await Promise.race([
			getBlogBySlug(slug),
			new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Blog fetch timeout')), 10000)
			)
		]) as any;

		// If blog post not found, return 404 image
		if (!post) {
			const imageResponse = generateBlogOGImage({
				title: 'Blog Post Not Found',
				description: 'The blog post you are looking for does not exist or has been removed.',
				tags: ['404', 'Not Found'],
				authorName: 'AntiRaid Team'
			});

			const response = new NextResponse(imageResponse.body, {
				status: 404,
				headers: {
					...commonHeaders,
					'X-Response-Time': `${Date.now() - startTime}ms`,
				}
			});

			return response;
		}
		
		const imageResponse = generateBlogOGImage({
			title: post.title || 'Untitled Blog Post',
			description: post.description || 'Read more on AntiRaid blog',
			tags: Array.isArray(post.tags) ? post.tags : [],
			slug: post.slug,
			authorName: post.author?.name || post.author?.username || 'AntiRaid Team',
			authorAvatar: post.author?.avatar?.url
				? `https://strapi.purrquinox.com${post.author.avatar.url}`
				: undefined
		});

		const response = new NextResponse(imageResponse.body, {
			status: 200,
			headers: {
				...commonHeaders,
				'X-Response-Time': `${Date.now() - startTime}ms`,
			}
		});

		return response;

	} catch (error) {
		console.error('Error generating OG image:', error);

		// Return fallback image on any error
		const fallbackImage = generateBlogOGImage({
			title: 'AntiRaid Blog',
			description: 'Read the latest news and updates',
			tags: ['Blog'],
			authorName: 'AntiRaid Team'
		});

		const response = new NextResponse(fallbackImage.body, {
			status: 500,
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
				'X-Response-Time': `${Date.now() - startTime}ms`,
				'X-Error': 'OG image generation failed',
			}
		});

		return response;
	}
}