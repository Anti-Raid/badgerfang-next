import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './clientLayout';
import { generateMetadata, siteViewport } from '@/lib/Metadata';
import { title, description, website_url, owner } from '@/components/common';
export const metadata: Metadata = generateMetadata({});
export const viewport = siteViewport;

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			'@id': `${website_url}/#organization`,
			name: title,
			url: website_url,
			logo: {
				'@type': 'ImageObject',
				url: `${website_url}/logo.webp`,
				width: 512,
				height: 512
			},
			sameAs: ['https://discord.gg/antiraid', 'https://twitter.com/heypurrquinox'],
			founder: { '@type': 'Person', name: owner }
		},
		{
			'@type': 'SoftwareApplication',
			'@id': `${website_url}/#app`,
			name: title,
			url: website_url,
			description: description,
			applicationCategory: 'SecurityApplication',
			operatingSystem: 'Discord',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'USD'
			},
			author: { '@id': `${website_url}/#organization` }
		},
		{
			'@type': 'WebSite',
			'@id': `${website_url}/#website`,
			url: website_url,
			name: title,
			description: description,
			publisher: { '@id': `${website_url}/#organization` }
		}
	]
};

/**
 * Defines the root layout for the application, setting up the global HTML structure, loading custom fonts, and wrapping all page content with the client layout.
 *
 * @param children - The React nodes to render within the layout.
 */
export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
					rel="stylesheet"
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body className="min-h-screen bg-background font-sans antialiased">
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
