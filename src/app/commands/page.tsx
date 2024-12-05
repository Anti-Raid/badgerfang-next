import CommandInterface from '@/components/Commands';
import { title, description, logo, image, website_url } from '@/components/common';
import { SEO } from '@/components/SEO';

const Commands = () => {
	return (
		<>
			<main>
				<SEO
					title="Commands | Anti Raid"
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
							site_name: `Commands | Anti Raid`,
							locale: 'en_US'
						},
						twitter: {
							card: 'summary_large_image',
							site: `@Commands | Anti Raid`
						}
					}}
					structuredData={{
						'@context': 'https://schema.org',
						'@type': 'WebPage',
						name: `Commands | Anti Raid`,
						description: `${description}`
					}}
					additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
				/>
				<CommandInterface />
			</main>
		</>
	);
};

export default Commands;
