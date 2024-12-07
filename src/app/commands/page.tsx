import CommandInterface from '@/components/Commands';
import { title, description, image, website_url } from '@/components/common';
import { SEO } from '@/components/SEO';

const Commands = () => {
	return (
		<>
			<main>
				<SEO
					title="Commands | AntiRaid"
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
							site_name: `Commands | AntiRaid`,
							locale: 'en_US'
						},
						twitter: {
							card: 'summary_large_image',
							site: `@Commands | AntiRaid`
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
				<CommandInterface />
			</main>
		</>
	);
};

export default Commands;
