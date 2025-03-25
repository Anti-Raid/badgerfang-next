'use client';

import Servers from '@/components/dashboard/all-servers';
import { SEO } from '@/components/SEO';
import { title, description, image, website_url } from '@/components/common';

export const runtime = 'edge';

export default function Dashboard() {
	return (
		<div className="min-h-screen">
			<SEO
				title={`Dashboard | ${title}`}
				description={description}
				canonical={website_url}
				image={{
					url: `${image}`,
					width: 1920,
					height: 1080,
					alt: `${description}`
				}}
				robotsConfig={{
					index: true,
					follow: false,
					additional: ['noarchive']
				}}
				social={{
					og: {
						type: 'website',
						site_name: `Dashboard | AntiRaid`,
						locale: 'en_US'
					},
					twitter: {
						card: 'summary_large_image',
						site: `@Dashboard | AntiRaid`
					}
				}}
				structuredData={{
					'@context': 'https://schema.org',
					'@type': 'WebPage',
					name: `Commands | AntiRaid`,
					description: `${description}`
				}}
				additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
			/>
			<Servers />
		</div>
	);
}
