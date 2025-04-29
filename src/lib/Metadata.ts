import { Metadata } from 'next';
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
 * Generates a standardized Next.js Metadata object for a page using provided and site-wide defaults.
 *
 * Merges custom and default values to configure the page's title, description, keywords, icons, Open Graph, and Twitter card metadata. Includes a canonical URL if specified and sets the metadata base URL from parameters, environment variables, or site defaults.
 *
 * @param params - Optional overrides for page metadata, including title, description, image, keywords, canonical URL, or base URL.
 * @returns A Metadata object for Next.js page configuration.
 */
export function generateMetadata(params: MainMetaDataParam): Metadata {
	const { title, description, image, keywords = [], Url, metadata } = params;

	const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - ${description_short}`;
	const desc = siteDescription;
	const previewImage = image ?? defaultImage;
	const canonicalBase = metadata ?? process.env.NEXT_PUBLIC_APP_URL ?? website_url;

	const meta: Metadata = {
		metadataBase: new URL(canonicalBase),
		title: fullTitle,
		description: desc,
		keywords: keywords.length ? keywords : [description_short],
		icons: {
			icon: logo ?? '/logo.webp'
		},
		openGraph: {
			title: fullTitle,
			description: desc,
			siteName: siteTitle,
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
			site: twitter || undefined
		}
	};

	if (Url) {
		meta.alternates = {
			canonical: Url
		};
	}

	return meta;
}

/**
 * Generates standardized metadata for a blog post page with blog-specific defaults.
 *
 * Sets the title to "Blog" if not provided, applies a default blog description, and ensures "Blog" is included in the keywords. Delegates to {@link generateMetadata} for final metadata construction.
 *
 * @returns Metadata for a Next.js blog post page.
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
 * Generates standardized metadata for the About page, allowing optional overrides for keywords and canonical URL.
 *
 * @param params - Optional parameters to override keywords and canonical URL.
 * @returns Metadata configured for the About page with default or overridden values.
 */
export function generateAboutMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'About',
		description: 'Learn more about us.',
		image: defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['About', 'Team', 'Mission'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates metadata for the Status page with defaults for title, description, image, and keywords.
 *
 * Optionally overrides the image, keywords, and canonical URL.
 *
 * @returns Metadata configured for the Status page.
 */
export function generateStatusMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Status',
		description: 'Check the status of our services.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Status', 'Uptime', 'Service'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates metadata for the Privacy Policy page with default or overridden values.
 *
 * Uses "Privacy Policy" as the default title, a standard privacy description, and keywords related to privacy unless custom values are provided.
 *
 * @returns Metadata configured for the Privacy Policy page.
 */
export function generatePrivacyMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Privacy Policy',
		description: 'Learn about our privacy practices.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Privacy', 'Policy', 'Data'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates metadata for the Terms of Service page with default or overridden values.
 *
 * Uses default title, description, image, and keywords for the Terms of Service page, allowing optional overrides for image, keywords, and canonical URL.
 *
 * @returns Metadata configured for the Terms of Service page.
 */
export function generateTermsMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Terms of Service',
		description: 'Read our terms and conditions.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Terms', 'Service', 'Agreement'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates metadata for the Scripts Shop page with default or overridden values.
 *
 * @param params - Optional values to override the default image, keywords, or canonical URL.
 * @returns Metadata configured for the Scripts Shop section.
 */
export function generateScriptMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Scripts Shop',
		description: 'Explore our collection of scripts.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length
			? params.keywords
			: ['Scripts', 'Code', 'luau', 'templating', 'Tools'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates standardized metadata for the Commands page, applying default title, description, image, and keywords unless overridden.
 *
 * @param params - Optional values to override the default image, keywords, description, title, or canonical URL.
 * @returns Metadata configured for the Commands section.
 */
export function generateCommandMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Commands',
		description: 'Browse all available commands',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Commands', 'Code', 'luau'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates metadata for the Blogs page with defaults for title, description, image, and keywords, allowing optional overrides.
 *
 * @param params - Optional values to override the default image, keywords, or canonical URL.
 * @returns Metadata configured for the Blogs section.
 */
export function generateBlogsMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Blogs',
		description: 'Read the latest news and updates.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Blogs', 'News', 'Updates'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates standardized metadata for the Developer Dashboard page, allowing optional overrides for image, keywords, and canonical URL.
 *
 * @returns A Next.js {@link Metadata} object configured for the Developer Dashboard.
 */
export function generateDeveloperDashboardMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Developer Dashboard',
		description: 'Manage your Sessions and API Keys',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Developer', 'Dashboard', 'Settings'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates standardized metadata for the Settings Validator page, allowing optional overrides for image, keywords, and canonical URL.
 *
 * @returns A Next.js {@link Metadata} object configured for the Settings Validator page.
 */
export function generateSettingsValidatorMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Settings Validator',
		description: 'Validate the current settings with the ones from the API side',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Settings', 'Validator'],
		Url: params.canonicalUrl
	});
}