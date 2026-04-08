import { NextResponse } from 'next/server';
import { website_url } from '@/components/common';
import { fetchBlogs } from '@/lib/api';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || website_url;

interface SitemapEntry {
	loc: string;
	changefreq: string;
	priority: string;
	lastmod?: string;
}

export async function GET() {
	const entries: SitemapEntry[] = [
		{ loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0' },
		{ loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8' },
		{ loc: `${baseUrl}/commands`, changefreq: 'weekly', priority: '0.8' },
		{ loc: `${baseUrl}/status`, changefreq: 'always', priority: '0.7' },
		{ loc: `${baseUrl}/blogs`, changefreq: 'daily', priority: '0.8' },
		{ loc: `${baseUrl}/script/shop`, changefreq: 'weekly', priority: '0.7' },
		{ loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.4' },
		{ loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.4' }
	];

	// Add dynamic blog posts
	try {
		const blogs = await fetchBlogs();
		for (const blog of blogs) {
			entries.push({
				loc: `${baseUrl}/blogs/${blog.slug}`,
				changefreq: 'monthly',
				priority: '0.6',
				lastmod: blog.updatedAt ? blog.updatedAt.split('T')[0] : undefined
			});
		}
	} catch {
		// Blog fetch failed — continue with static pages only
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map((entry) => {
		const lastmodTag = entry.lastmod ? `\n\t\t<lastmod>${entry.lastmod}</lastmod>` : '';
		return `\t<url>
\t\t<loc>${entry.loc}</loc>${lastmodTag}
\t\t<changefreq>${entry.changefreq}</changefreq>
\t\t<priority>${entry.priority}</priority>
\t</url>`;
	})
	.join('\n')}
</urlset>`;

	return new NextResponse(sitemap, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
}
