import type { Metadata } from "next";
import { title, description, keywords } from '@/components/common';

export const metadata: Metadata = {
  title: {
    template: `%s | ${title}`,
    default: `${title} - ${description}`,
  },
  description: `${description}`,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://antiraid.xyz',
    title: `${title} - ${description}`,
    description: `${description}`,
    siteName: `${title} - ${description}`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} - ${description}`,
    description: `${description}`,
    site: '@heyantiraid',
    creator: '@heypurrquinox',
  },
  keywords: `${keywords}`,
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    title: `${title} - ${description}`,
    statusBarStyle: 'default',
  },
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/logo.webp',
    shortcut: '/logo.webp',
  },
};
