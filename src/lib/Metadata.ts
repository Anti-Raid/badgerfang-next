import {
	title as siteTitle,
	description_short,
	description as siteDescription,
	keywords as siteKeywords,
	owner,
	logo,
	image as defaultImage,
	twitter,
	website_url
} from '@/components/common';

interface MainMetaDataParam {
	title?: string;
	description?: string;
	image?: string;
	keywords?: string[];
	Url?: string; // Canonical
	metadata?: string; // Base URL override
}

interface GenerateMetadataParams {
	title?: string;
	description?: string;
	imageUrl?: string;
	keywords?: string[];
	canonicalUrl?: string;
	// LLMO optimizations
	robots?: 'index, follow' | 'noindex, nofollow' | 'index, nofollow' | 'noindex, follow';
	ogType?: 'website' | 'article' | 'profile';
	articleAuthor?: string;
	articlePublishedTime?: string;
	articleTags?: string[];
	structuredData?: Record<string, unknown>;
}

export const siteViewport = {
	// This is handled in __root.tsx usually, but we can export constants if needed.
	// TanStack Start handles viewport in meta tags.
};

export function generateMetadata(
	params: MainMetaDataParam & {
		robots?: 'index, follow' | 'noindex, nofollow' | 'index, nofollow' | 'noindex, follow';
		ogType?: 'website' | 'article' | 'profile';
		articleAuthor?: string;
		articlePublishedTime?: string;
		articleTags?: string[];
	}
) {
	const {
		title,
		description,
		image,
		keywords = [],
		Url,
		metadata,
		robots = 'index, follow',
		ogType = 'website',
		articleAuthor,
		articlePublishedTime,
		articleTags = []
	} = params;

	const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - ${description_short}`;
	const desc = description ?? siteDescription;
	const previewImage = image ?? defaultImage;
	const canonicalBase = metadata ?? process.env.NEXT_PUBLIC_APP_URL ?? website_url;

	const metaKeywords = [
		...new Set([...keywords, 'AntiRaid', 'Discord Bot', 'Security', ...siteKeywords])
	].join(', ');

	const meta: Array<{ title?: string; name?: string; property?: string; content: string }> = [
		{ title: fullTitle },
		{ name: 'description', content: desc },
		{ name: 'application-name', content: siteTitle },
		{ name: 'author', content: owner },
		{ name: 'keywords', content: metaKeywords },
		{ name: 'referrer', content: 'origin-when-cross-origin' },
		{ name: 'apple-mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-title', content: siteTitle },
		{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
		// Robots - LLMO optimized
		{ name: 'robots', content: robots },

		// Open Graph - LLMO optimized
		{ property: 'og:title', content: fullTitle },
		{ property: 'og:description', content: desc },
		{ property: 'og:site_name', content: siteTitle },
		{ property: 'og:url', content: Url ?? canonicalBase },
		{ property: 'og:image', content: previewImage },
		{ property: 'og:locale', content: 'en_US' },
		{ property: 'og:type', content: ogType },

		// Twitter
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: fullTitle },
		{ name: 'twitter:description', content: desc },
		{ name: 'twitter:image', content: previewImage },
		{ name: 'twitter:creator', content: twitter },
		{ name: 'twitter:site', content: twitter }
	];

	// Add article-specific meta tags for LLMO
	if (ogType === 'article') {
		if (articleAuthor) {
			meta.push({ property: 'article:author', content: articleAuthor });
		}
		if (articlePublishedTime) {
			meta.push({ property: 'article:published_time', content: articlePublishedTime });
		}
		if (articleTags.length > 0) {
			articleTags.forEach((tag) => {
				meta.push({ property: 'article:tag', content: tag });
			});
		}
	}

	const links: Array<{ rel: string; href: string }> = [];
	if (Url) {
		links.push({ rel: 'canonical', href: Url });
	}
	// Icons
	links.push({ rel: 'icon', href: logo ?? '/logo.webp' });
	links.push({ rel: 'shortcut icon', href: logo ?? '/logo.webp' });
	links.push({ rel: 'apple-touch-icon', href: logo ?? '/logo.webp' });

	return { meta, links };
}

export function generateBlogMetadata(params: GenerateMetadataParams) {
	const {
		title,
		description,
		imageUrl,
		keywords = [],
		canonicalUrl,
		robots = 'index, follow',
		articleAuthor,
		articlePublishedTime,
		articleTags = []
	} = params;

	const blogDefaults = {
		title: title || 'Blog',
		description: description || 'Read the latest news and updates.',
		image: imageUrl,
		keywords: ['Blog', ...keywords],
		Url: canonicalUrl,
		robots,
		ogType: 'article' as const,
		articleAuthor,
		articlePublishedTime,
		articleTags: articleTags.length > 0 ? articleTags : keywords
	};

	return generateMetadata(blogDefaults);
}

export function generateAboutMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'About',
		description: 'Learn more about us.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['About', 'Team', 'Mission'],
		Url: params.canonicalUrl
	});
}

export function generateStatusMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Status',
		description: 'Check the status of our services and monitor uptime in real-time.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length
			? params.keywords
			: ['Status', 'Uptime', 'Service', 'Monitoring', 'System Health'],
		Url: params.canonicalUrl,
		robots: params.robots ?? 'index, follow',
		ogType: 'website'
	});
}

export function generatePrivacyMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Privacy Policy | Legal',
		description: 'Learn about our privacy practices.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Privacy', 'Policy', 'Data'],
		Url: params.canonicalUrl
	});
}

export function generateTermsMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Terms of Service | Legal',
		description: 'Read our terms and conditions.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Terms', 'Service', 'Agreement'],
		Url: params.canonicalUrl
	});
}

export function generateScriptMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Scripts Shop',
		description:
			'Explore our collection of powerful scripts and templates for AntiRaid bot customization.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length
			? params.keywords
			: ['Scripts', 'Code', 'luau', 'templating', 'Tools', 'Customization', 'Discord Bot'],
		Url: params.canonicalUrl,
		robots: params.robots ?? 'index, follow',
		ogType: 'website'
	});
}

export function generateCommandMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Commands',
		description:
			'Browse and explore all available AntiRaid bot commands with detailed documentation and examples.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length
			? params.keywords
			: ['Commands', 'Code', 'luau', 'Discord Bot', 'API', 'Documentation'],
		Url: params.canonicalUrl,
		robots: params.robots ?? 'index, follow',
		ogType: 'website'
	});
}

export function generateBlogsMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Blogs',
		description: 'Read the latest news, updates, and insights from the AntiRaid team.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length
			? params.keywords
			: ['Blogs', 'News', 'Updates', 'Discord', 'Security', 'AntiRaid'],
		Url: params.canonicalUrl,
		robots: params.robots ?? 'index, follow',
		ogType: 'website'
	});
}

export function generateDeveloperDashboardMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Developer Dashboard',
		description: 'Manage your Sessions and API Keys',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Developer', 'Dashboard', 'Settings'],
		Url: params.canonicalUrl
	});
}

export function generateHomeMetadata(params: GenerateMetadataParams = {}) {
	return generateMetadata({
		title: 'Home',
		description:
			'AntiRaid - Advanced Discord bot protection and moderation. Secure your server with powerful anti-raid features, automated moderation, and comprehensive security tools.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length
			? params.keywords
			: ['Home', 'AntiRaid', 'Discord Bot', 'Security', 'Moderation', 'Protection'],
		Url: params.canonicalUrl,
		robots: params.robots ?? 'index, follow',
		ogType: 'website'
	});
}

// Structured Data (JSON-LD) helpers for LLMO
export interface ArticleStructuredData {
	title: string;
	description: string;
	image?: string;
	author?: {
		name: string;
		url?: string;
		avatar?: string;
	};
	publisher?: {
		name: string;
		logo?: string;
	};
	datePublished?: string;
	dateModified?: string;
	url?: string;
	tags?: string[];
}

export function generateArticleStructuredData(data: ArticleStructuredData) {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || website_url;

	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: data.title,
		description: data.description,
		image: data.image
			? data.image.startsWith('http')
				? data.image
				: `${appUrl}${data.image}`
			: `${appUrl}${defaultImage}`,
		author: data.author
			? {
					'@type': 'Person',
					name: data.author.name,
					...(data.author.url && { url: data.author.url }),
					...(data.author.avatar && { image: data.author.avatar })
				}
			: {
					'@type': 'Person',
					name: owner
				},
		publisher: {
			'@type': 'Organization',
			name: data.publisher?.name || title,
			logo: {
				'@type': 'ImageObject',
				url: data.publisher?.logo
					? data.publisher.logo.startsWith('http')
						? data.publisher.logo
						: `${appUrl}${data.publisher.logo}`
					: `${appUrl}${logo || '/logo.webp'}`
			}
		},
		...(data.datePublished && { datePublished: data.datePublished }),
		...(data.dateModified && { dateModified: data.dateModified }),
		...(data.url && { mainEntityOfPage: { '@type': 'WebPage', '@id': data.url } }),
		...(data.tags && data.tags.length > 0 && { keywords: data.tags.join(', ') })
	};
}

export interface OrganizationStructuredData {
	name: string;
	url: string;
	logo?: string;
	sameAs?: string[];
	description?: string;
}

export function generateOrganizationStructuredData(data: OrganizationStructuredData) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: data.name,
		url: data.url,
		...(data.logo && {
			logo: {
				'@type': 'ImageObject',
				url: data.logo.startsWith('http') ? data.logo : `${data.url}${data.logo}`
			}
		}),
		...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
		...(data.description && { description: data.description })
	};
}

export interface WebSiteStructuredData {
	name: string;
	url: string;
	publisher?: OrganizationStructuredData;
	potentialAction?: {
		'@type': 'SearchAction';
		target: {
			'@type': 'EntryPoint';
			urlTemplate: string;
		};
		'query-input': string;
	};
}

export function generateWebSiteStructuredData(data: WebSiteStructuredData) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: data.name,
		url: data.url,
		...(data.publisher && { publisher: generateOrganizationStructuredData(data.publisher) }),
		...(data.potentialAction && { potentialAction: data.potentialAction })
	};
}
