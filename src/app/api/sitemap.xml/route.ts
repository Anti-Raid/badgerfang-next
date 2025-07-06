import { NextResponse } from 'next/server';
import {
	generateHomeMetadata,
	generateScriptMetadata,
	generateCommandMetadata,
	generateAboutMetadata,
	generatePrivacyMetadata,
	generateTermsMetadata,
	generateStatusMetadata,
	generateDeveloperDashboardMetadata
} from '@/lib/Metadata';

const websiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://antiraid.xyz';

export async function GET() {
	const urls: string[] = [];

	// Static pages
	const staticPages = [
		{ path: '/', generator: generateHomeMetadata },
		{ path: '/about', generator: generateAboutMetadata },
		{ path: '/privacy', generator: generatePrivacyMetadata },
		{ path: '/terms', generator: generateTermsMetadata },
		{ path: '/status', generator: generateStatusMetadata },
		{ path: '/scripts', generator: generateScriptMetadata },
		{ path: '/commands', generator: generateCommandMetadata },
		{ path: '/developer', generator: generateDeveloperDashboardMetadata }
	];

	for (const { path, generator } of staticPages) {
		const metadata = generator();
		const canonical = metadata.alternates?.canonical;
		
		// Convert canonical to string properly
		let canonicalUrl: string;
		if (typeof canonical === 'string') {
			canonicalUrl = canonical;
		} else if (canonical instanceof URL) {
			canonicalUrl = canonical.toString();
		} else if (canonical && typeof canonical === 'object' && 'url' in canonical) {
			// Handle AlternateLinkDescriptor case
			const url = canonical.url;
			canonicalUrl = typeof url === 'string' ? url : url.toString();
		} else {
			canonicalUrl = `${websiteUrl}${path}`;
		}
		
		urls.push(canonicalUrl);
	}

	// Build the sitemap XML
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${urls
		.map(
			(url) => `
	<url>
		<loc>${url}</loc>
		<changefreq>weekly</changefreq>
		<priority>1.0</priority>
	</url>`
		)
		.join('\n')}
</urlset>`;

	return new NextResponse(sitemap, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=86400, s-max-age=86400', // Cache for 24 hours
		}
	});
}