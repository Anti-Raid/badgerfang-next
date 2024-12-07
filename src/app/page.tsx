'use client';
import { Hero } from '@/components/Hero';
import { title, description, image, website_url } from '@/components/common';
import { SEO } from '@/components/SEO';

export default function Home() {
	return (
		<>
			<SEO
				title={title}
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
						site_name: `${title}`,
						locale: 'en_US'
					},
					twitter: {
						card: 'summary_large_image',
						site: `@${title}`
					}
				}}
				structuredData={{
					'@context': 'https://schema.org',
					'@type': 'WebPage',
					name: `${title}`,
					description: `${description}`
				}}
				additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
			/>
			<main>
				<Hero />
			</main>
		</>
	);
}
