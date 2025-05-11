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
		description: 'Learn more about us.',
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
		description: 'Check the status of our services.',
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
		description: 'Browse all available commands',
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
		description: 'Read the latest news and updates.',
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
		description: 'Manage your Sessions and API Keys',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Developer', 'Dashboard', 'Settings'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates a Next.js Metadata object for the Settings Validator page with default or overridden title, description, image, keywords, and canonical URL.
 *
 * @param params - Optional overrides for title, description, imageUrl, keywords, and canonicalUrl.
 * @returns The constructed Metadata object for the Settings Validator page.
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

/**
 * Generates metadata for the home page with default title, description, image, and keywords.
 *
 * @returns A Next.js Metadata object for the home page.
 */
export function generateHomeMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Home',
		description: 'Welcome to Antiraids Homepage!',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Home', 'Antiraid'],
		Url: params.canonicalUrl
	});
}

/**
 * Generates metadata for the Forums page with default title, description, image, and keywords.
 *
 * @returns A Next.js Metadata object for the Forums page.
 */
export function generateFourmsMetadata(params: GenerateMetadataParams = {}): Metadata {
	return generateMetadata({
		title: 'Forums',
		description: 'Welcome to Antiraids Forums! Where you can ask support questions and get help from the community.',
		image: params.imageUrl ?? defaultImage,
		keywords: params.keywords?.length ? params.keywords : ['Forums', 'Antiraid'],
		Url: params.canonicalUrl
	});
}
