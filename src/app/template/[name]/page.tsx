'use client';

import { SEO } from '@/components/SEO';
import type { TemplateShopProps } from '@/types/script';
import { title, description, image, website_url } from '@/components/common';

export default function TemplateShopPage() {
	return (
		<div className="min-h-screen">
			<SEO
				title={`Script | ${title}`}
				description={description}
				canonical={website_url}
				image={{
					url: image,
					width: 1920,
					height: 1080,
					alt: description
				}}
				robotsConfig={{
					index: true,
					follow: false,
					additional: ['noarchive']
				}}
				social={{
					og: {
						type: 'website',
						site_name: 'template | AntiRaid',
						locale: 'en_US'
					},
					twitter: {
						card: 'summary_large_image',
						site: '@template | AntiRaid'
					}
				}}
				structuredData={{
					'@context': 'https://schema.org',
					'@type': 'WebPage',
					name: 'Commands | AntiRaid',
					description: description
				}}
				additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
			/>
		</div>
	);
}
