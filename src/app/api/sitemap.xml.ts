import { createFileRoute } from '@tanstack/react-router';
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

export const Route = createFileRoute('/api/sitemap/xml')({
	server: {
		handlers: {
			GET: async () => {
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
					const canonical = metadata.links.find((l) => l.rel === 'canonical')?.href;

					// Convert canonical to string properly
					let canonicalUrl: string;
					if (typeof canonical === 'string') {
						canonicalUrl = canonical;
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

				return new Response(sitemap, {
					status: 200,
					headers: {
						'Content-Type': 'application/xml',
						'Cache-Control': 'public, max-age=86400, s-max-age=86400' // Cache for 24 hours
					}
				});
			}
		}
	}
});
