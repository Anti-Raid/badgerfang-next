import { Metadata } from "next";
import {
  title as siteTitle,
  description_short,
  description as siteDescription,
  keywords as siteKeywords,
  owner,
  logo,
  image as defaultImage,
  twitter,
  website_url,
} from "@/components/common";

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
 * Generates standardized Metadata for any page.
 *
 * Constructs title, description, Open Graph, and Twitter card
 * metadata based on provided parameters and site defaults.
 *
 * @param {MainMetaDataParam} params - Options to customize metadata.
 * @returns {Metadata} Next.js Metadata object.
 */
export function generateMetadata(params: MainMetaDataParam): Metadata {
  const {
    title,
    description,
    image,
    keywords = [],
    Url,
    metadata,
  } = params;

  const fullTitle = title
    ? `${title} | ${siteTitle}`
    : `${siteTitle} - ${description_short}`;
  const desc = description ?? description_short;
  const previewImage = image ?? defaultImage;
  const canonicalBase = metadata ?? process.env.NEXT_PUBLIC_APP_URL ?? website_url;

  const meta: Metadata = {
    metadataBase: new URL(canonicalBase),
    title: fullTitle,
    description: desc,
    keywords: keywords.length ? keywords : [description_short],
    icons: {
      icon: logo ?? "/logo.webp",
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
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [previewImage],
      site: twitter || undefined,
    },
  };

  if (Url) {
    meta.alternates = {
      canonical: Url,
    };
  }

  return meta;
}

/**
 * Generates Metadata specifically for blog posts.
 *
 * Extends common metadata with blog-specific defaults,
 * such as default description and keywords prefix.
 *
 * @param {GenerateMetadataParams} params - Blog post metadata options.
 * @param {string} [params.title] - Blog post title.
 * @param {string} [params.description] - Blog post description or excerpt.
 * @param {string} [params.imageUrl] - URL for social card image.
 * @param {string[]} [params.keywords] - Additional keywords for the post.
 * @param {string} [params.canonicalUrl] - Canonical URL of the blog post.
 * @returns {Metadata} Metadata object tailored for a blog post.
 */
export function generateBlogMetadata(params: GenerateMetadataParams): Metadata {
  const {
    title,
    description,
    imageUrl,
    keywords = [],
    canonicalUrl,
  } = params;

  const blogDefaults = {
    title: title || "Blog",
    description: description || "Read the latest news and updates.",
    image: imageUrl,
    keywords: ["Blog", ...keywords],
    Url: canonicalUrl,
  };

  return generateMetadata(blogDefaults);
}
