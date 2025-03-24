'use client';

import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { TemplateShop } from '@/components/scripts/scriptShop';
import type { TemplateShopProps } from '@/types/script';
import { title, description, image, website_url } from '@/components/common';
import { motion } from 'framer-motion';

export const runtime = 'edge';

const mockData: TemplateShopProps[] = [
	{
		id: '3',
		name: 'Hoover Max Extract Pressure Pro model 60',
		version: '1.0.1',
		description: 'dommy mommy',
		owner_guild: 'RSEnterprises',
		created_at: '2025-12-01T14:20:00Z',
		created_by: 'RS',
		last_updated_at: '2025-12-05T09:30:00Z',
		last_updated_by: 'RS',
		tags: ['analytics', 'data', 'automation'],
		downloads: 2135,
		rating: 4.9
	}
];

export default function TemplateShopPage() {
	const [templates, setTemplates] = useState<TemplateShopProps[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('https://api.github.com/repos/Anti-Raid/auto-slowdown');
				if (!response.ok) throw new Error('Failed to fetch repository data');

				const repoData = await response.json();
				const repoTemplate: TemplateShopProps = {
					id: '4',
					name: repoData.name || 'Auto Slowdown',
					version: 'v1.0.0',
					description: repoData.description || 'Luau template for Discord server management',
					owner_guild: 'Anti-Raid',
					created_at: repoData.created_at || new Date().toISOString(),
					created_by: 'Anti-Raid',
					last_updated_at: repoData.updated_at || new Date().toISOString(),
					last_updated_by: 'Anti-Raid',
					tags: ['automation', 'discord', 'luau'],
					downloads: 8423,
					rating: 4.5
				};

				setTemplates([...mockData, repoTemplate]);
			} catch (err) {
				console.error('Error fetching repository:', err);
				setError('Failed to fetch repository data. Using fallback data.');
				setTemplates(mockData);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTemplates();
	}, []);

	return (
		<div className="min-h-screen">
			<SEO
				title={`Script Shop | ${title}`}
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
						site_name: 'Script Shop | AntiRaid',
						locale: 'en_US'
					},
					twitter: {
						card: 'summary_large_image',
						site: '@Script Shop | AntiRaid'
					}
				}}
				structuredData={{
					'@context': 'https://schema.org',
					'@type': 'WebPage',
					name: 'Script Shop | AntiRaid',
					description: description
				}}
				additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
			/>
			<div className="relative overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 to-transparent" />
					<div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary/5 to-transparent" />
					<motion.div
						className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
						animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
						transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
						animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
						transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
					/>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center h-96">
						<div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
					</div>
				) : (
					<TemplateShop data={templates} />
				)}

				{error && (
					<div className="mx-auto max-w-7xl px-4 mt-4">
						<p className="text-sm text-red-500">{error}</p>
					</div>
				)}
			</div>
		</div>
	);
}
