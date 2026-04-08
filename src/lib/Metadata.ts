import { Metadata, Viewport } from 'next';
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

/**
 * Parameters for generating common page metadata.
 *
 * @interface MainMetaDataParam
 * @property {string} [title] - Custom title for the page. Will be combined with site title.
 * @property {string} [description] - Custom description for the page. Defaults to short site description.
 * @property {string} [image] - URL of the image to use for OpenGraph and Twitter cards.
 * @property {string[]} [keywords] - Array of keywords for SEO. Falls back to site default if empty.
 * @property {string} [Url] - Canonical URL for the page.
 * @property {string} [metadata] - Base URL override for metadata (e.g., `process.env.NEXT_PUBLIC_APP_URL`).
 */
interface MainMetaDataParam {
	title?: string;
	description?: string;
	image?: string;
	keywords?: string[];
	Url?: string;
	metadata?: string;
}

/**
 * Parameters specific to generating blog post metadata.
 *
 * @interface GenerateMetadataParams
 * @property {string} [title] - Title of the blog post.
 * @property {string} [description] - Description or excerpt of the blog post.
 * @property {string} [imageUrl] - URL of the feature image for social cards.
 * @property {string[]} [keywords] - Array of blog-specific keywords.
 * @property {string} [canonicalUrl] - Canonical URL for the blog post.
 */
interface GenerateMetadataParams {
	title?: string;
	description?: string;
	imageUrl?: string;
	keywords?: string[];
	canonicalUrl?: string;
}

/**
 * Creates a Next.js Metadata object for a page by combining site-wide defaults with optional overrides.
 *
 * Merges provided and default values to set the page's title, description, keywords, icons, Open Graph, and Twitter card metadata. Adds a canonical URL if specified and determines the metadata base URL from parameters, environment variables, or site defaults.
 *
 * @param params - Optional overrides for the page's metadata, such as title, description, image, keywords, canonical URL, or base URL.
 * @returns The constructed Metadata object for Next.js page configuration.
 */

/**
 * Standard Viewport configuration for the application.
 * Defines theme colors for light/dark modes and scaling behavior.
 */
export const siteViewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#8c45f4' }, // Brand Purple (Light)
		{ media: '(prefers-color-scheme: dark)', color: '#0f0f12' } // Dark Background
	],
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	colorScheme: 'dark light'
};

/**
 * Creates a Next.js Metadata object for a page by combining site-wide defaults with optional overrides.
 *
 * Merges provided and default values to set the page's title, description, keywords, icons, Open Graph, and Twitter card metadata. Adds a canonical URL if specified and determines the metadata base URL from parameters, environment variables, or site defaults.
 *
 * @param params - Optional overrides for the page's metadata, such as title, description, image, keywords, canonical URL, or base URL.
 * @returns The constructed Metadata object for Next.js page configuration.
 */
export function generateMetadata(params: MainMetaDataParam): Metadata {
	const { title, description, image, keywords = [], Url, metadata } = params;

	const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - ${description_short}`;
	// Use provided description or fallback to site-wide description
	const desc = description ?? siteDescription;
	const previewImage = image ?? defaultImage;
	const canonicalBase = metadata ?? process.env.NEXT_PUBLIC_APP_URL ?? website_url;

	// Merge page-specific keywords with site-wide keywords, ensuring 'AntiRaid' and 'Discord Bot' are always present first
	const metaKeywords = [
		...new Set([...keywords, 'AntiRaid', 'Discord Bot', 'Security', ...siteKeywords])
	];

	const meta: Metadata = {
		metadataBase: new URL(canonicalBase),
		title: fullTitle,
		description: desc,
		applicationName: siteTitle,
		authors: [{ name: owner, url: website_url }],
		creator: owner,
		publisher: owner,
		category: 'Technology',
		keywords: metaKeywords,
		manifest: '/manifest.json',
		referrer: 'origin-when-cross-origin',
		formatDetection: {
			email: false,
			address: false,
			telephone: false
		},
		appleWebApp: {
			capable: true,
			title: siteTitle,
			statusBarStyle: 'black-translucent'
		},
		robots: {
			index: true,
			follow: true,
			nocache: false,
			googleBot: {
				index: true,
				follow: true,
				noimageindex: false,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1
			}
		},
		verification: {
			// Add verification codes here (google, yandex, etc.)
		},
		icons: {
			icon: logo ?? '/logo.webp',
			shortcut: logo ?? '/logo.webp',
			apple: logo ?? '/logo.webp'
		},
		openGraph: {
			title: fullTitle,
			description: desc,
			siteName: siteTitle,
			url: Url ?? canonicalBase,
			images: [
				{
					url: previewImage,
					width: 1200,
					height: 630,
					alt: fullTitle
				}
			],
			locale: 'en_US',
			type: 'website'
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description: desc,
			images: [previewImage],
			creator: twitter || undefined,
			site: twitter || undefined
		}
	};

	if (Url) {
		meta.alternates = {
			canonical: Url,
			languages: {
				'en-US': Url
			}
		};
	}

	return meta;
}

/**
 * Generates metadata for a blog post page using blog-specific defaults and optional overrides.
 *
 * Sets the title to "Blog" if not provided, applies a default blog description, and ensures "Blog" is included in the keywords. Uses the provided image and canonical URL if available.
 *
 * @returns A Next.js Metadata object for a blog post page.
 */
export function generateBlogMetadata(params: GenerateMetadataParams): Metadata {
	const { title, description, imageUrl, keywords = [], canonicalUrl } = params;

	const blogDefaults = {
		title: title || 'Blog',
		description: description || 'Read the latest news and updates.',
		image: imageUrl,
		keywords: ['Blog', ...keywords],
		Url: canonicalUrl
	};

	return generateMetadata(blogDefaults);
}

/**
 * Generates a Metadata object for the About page with default or overridden title, description, image, keywords, and canonical URL.
 *
 * @param params - Optional overrides for title, description, imageUrl, keywords, and canonicalUrl.
 * @returns Metadata configured for the About page.
 */
export function generateAboutMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'About',
		description:
			'Meet the team behind AntiRaid — the developers and contributors building automated Discord security tools to protect communities from raids and spam.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['About', 'Team', 'Mission'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates a Metadata object for the Status page with default title, description, image, and keywords.
 *
 * Applies Status page-specific defaults, allowing optional overrides for image, keywords, and canonical URL.
 *
 * @returns Metadata for the Status page.
 */
export function generateStatusMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Status',
		description:
			'View real-time uptime and operational status for all AntiRaid services, APIs, and infrastructure.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Status', 'Uptime', 'Service'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates a Metadata object for the Privacy Policy page, applying default or overridden title, description, image, keywords, and canonical URL.
 *
 * @returns Metadata for the Privacy Policy page.
 */
export function generatePrivacyMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Privacy Policy | Legal',
		description: 'Learn about our privacy practices.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Privacy', 'Policy', 'Data'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates a Metadata object for the Terms of Service page, applying default values for title, description, image, and keywords, with optional overrides.
 *
 * @returns Metadata for the Terms of Service page.
 */
export function generateTermsMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Terms of Service | Legal',
		description: 'Read our terms and conditions.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Terms', 'Service', 'Agreement'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates a Metadata object for the Scripts Shop page, applying default titles, descriptions, images, and keywords, with optional overrides.
 *
 * @param params - Optional overrides for the page title, description, image URL, keywords, or canonical URL.
 * @returns A Metadata object configured for the Scripts Shop section.
 */
export function generateScriptMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: params.title ?? 'Scripts Shop',
		description:
			'Browse and install Luau script templates for AntiRaid — customize your Discord server moderation with community-built automation scripts.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length
			? params.keywords
			: ['Scripts', 'Code', 'luau', 'templating', 'Tools'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates a Metadata object for the Commands page with default or overridden values.
 *
 * Applies a default title, description, image, and keywords for the Commands section, allowing optional overrides via {@link params}.
 *
 * @param params - Optional overrides for title, description, image, keywords, or canonical URL.
 * @returns A Metadata object configured for the Commands page.
 */
export function generateCommandMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Commands',
		description:
			'Browse the full list of AntiRaid slash commands — moderation, security, backups, and Luau scripting tools for your Discord server.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Commands', 'Code', 'luau'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates a Metadata object for the Blogs page, applying default title, description, image, and keywords, with support for optional overrides.
 *
 * @param params - Optional overrides for the image, keywords, or canonical URL.
 * @returns A Metadata object configured for the Blogs section.
 */
export function generateBlogsMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Blogs',
		description:
			'Read the latest AntiRaid news, updates, and guides on Discord server security, moderation best practices, and new feature announcements.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Blogs', 'News', 'Updates'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates metadata for the Developer Dashboard page with optional custom title, description, image, keywords, and canonical URL.
 *
 * @returns A Metadata object tailored for the Developer Dashboard section.
 */
export function generateDeveloperDashboardMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Developer Dashboard',
		description:
			'Manage your AntiRaid API keys, developer sessions, and integration settings to build on top of AntiRaid.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Developer', 'Dashboard', 'Settings'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates Next.js metadata for the home page with default values and optional overrides.
 *
 * Applies default title, description, image, and keywords for the home page, allowing customization through the provided parameters.
 *
 * @returns A Metadata object for the home page.
 */
export function generateHomeMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Home',
		description: siteDescription,
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Home', 'Antiraid'],
		Url: params.canonicalUrl
	});
}
