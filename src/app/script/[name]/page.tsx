'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SEO } from '@/components/SEO';
import { title, description, image, website_url } from '@/components/common';
import { ScriptLayout } from '@/components/scripts/scriptLayout';
import type { TemplateShopProps } from '@/types/script';

export const runtime = 'edge';

const mockScripts: Record<string, TemplateShopProps> = {
	'auto-slowdown': {
		id: '4',
		name: 'Auto Slowdown',
		version: '1.0.0',
		description: 'Automatically manages slowmode in your Discord server based on activity levels',
		owner_guild: 'Anti-Raid',
		created_at: '2023-06-15T10:30:00Z',
		created_by: 'Anti-Raid',
		last_updated_at: '2023-12-01T15:45:00Z',
		last_updated_by: 'Anti-Raid',
		tags: ['moderation', 'auto-mod', 'slowmode'],
		downloads: 3542,
		rating: 4.8
	}
};

export default function ScriptPage() {
	const params = useParams();
	const scriptName = params.name as string;

	const [script, setScript] = useState<TemplateShopProps | null>(null);
	const [files, setFiles] = useState<{ name: string; path: string; content: string }[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchScriptData = async () => {
			try {
				setIsLoading(true);

				// Use mock data if scriptName exists in mockScripts
				const scriptData = mockScripts[scriptName] || {
					id: scriptName,
					name: scriptName.charAt(0).toUpperCase() + scriptName.slice(1).replace(/-/g, ' '),
					version: '1.0.0',
					description: 'A script from the Anti-Raid repository',
					owner_guild: 'Anti-Raid',
					created_at: new Date().toISOString(),
					created_by: 'Anti-Raid',
					last_updated_at: new Date().toISOString(),
					last_updated_by: 'Anti-Raid',
					tags: ['discord', 'automation'],
					downloads: 1000,
					rating: 4.0
				};

				setScript(scriptData);

				// Fetch repository files
				const repoResponse = await fetch(
					`https://api.github.com/repos/Anti-Raid/auto-slowdown/contents`,
					{
						headers: {
							Accept: 'application/vnd.github.v3+json'
						}
					}
				);

				if (!repoResponse.ok) {
					throw new Error('GitHub API request failed');
				}

				const repoData = await repoResponse.json();

				// Filter relevant files
				const filePromises = repoData
					.filter(
						(item: any) =>
							item.type === 'file' &&
							(item.name.endsWith('.lua') ||
								item.name.endsWith('.luau') ||
								item.name.endsWith('.json')) &&
							!item.name.startsWith('README') &&
							!item.name.startsWith('LICENSE')
					)
					.slice(0, 5)
					.map(async (file: any) => {
						const fileResponse = await fetch(file.download_url);
						const content = await fileResponse.text();
						return { name: file.name, path: file.path, content };
					});

				const fileContents = await Promise.all(filePromises);
				setFiles(fileContents);
			} catch (err) {
				console.error('Error fetching script data:', err);
				setError('Failed to fetch script data. Please try again later.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchScriptData();
	}, [scriptName]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	if (error || !script) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center p-8 max-w-md">
					<h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Script</h2>
					<p className="text-muted-foreground">{error || 'Script not found'}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<SEO
				title={`${script.name} | ${title}`}
				description={script.description || description}
				canonical={`${website_url}/script/${scriptName}`}
				image={{
					url: image,
					width: 1920,
					height: 1080,
					alt: script.description || description
				}}
				robotsConfig={{
					index: true,
					follow: false,
					additional: ['noarchive']
				}}
				social={{
					og: {
						type: 'website',
						site_name: `${script.name} | AntiRaid`,
						locale: 'en_US'
					},
					twitter: {
						card: 'summary_large_image',
						site: `@${script.name} | AntiRaid`
					}
				}}
				structuredData={{
					'@context': 'https://schema.org',
					'@type': 'SoftwareApplication',
					name: script.name,
					description: script.description,
					applicationCategory: 'UtilitiesApplication',
					operatingSystem: 'Discord',
					offers: {
						'@type': 'Offer',
						price: '0',
						priceCurrency: 'USD'
					},
					aggregateRating: {
						'@type': 'AggregateRating',
						ratingValue: script.rating?.toString() || '4.5',
						ratingCount: script.downloads?.toString() || '100'
					}
				}}
				additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
			/>

			<ScriptLayout script={script} files={files} />
		</div>
	);
}
