'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { title, description, image, website_url } from '@/components/common';
import { ScriptLayout } from '@/components/scripts/scriptLayout';
import type { TemplateShopProps } from '@/types/script';

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
	const [files, setFiles] = useState<
		{ name: string; path: string; content: string; type: 'file' | 'dir' }[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchDirectoryContents = async (path: string = '') => {
		const response = await fetch(
			`https://api.github.com/repos/anti-raid/auto-slowdown/contents/${path}`,
			{
				headers: {
					Accept: 'application/vnd.github.v3+json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch contents for path: ${path}`);
		}

		return await response.json();
	};

	const isAllowedFile = (name: string) => {
		const allowedExtensions = [
			'.lua',
			'.luau',
			'.json',
			'.luaurc',
			'.md',
			'LICENSE',
			'.gitignore',
			'.gitmodules'
		];

		return allowedExtensions.some((ext) => name.endsWith(ext));
	};

	useEffect(() => {
		const fetchScriptData = async () => {
			// Check if the scriptName is 'auto-slowdown'
			if (scriptName !== 'auto-slowdown') {
				setError('Script not found');
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);

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

				const directoryQueue: string[] = [''];
				const processedFiles: {
					name: string;
					path: string;
					content: string;
					type: 'file' | 'dir';
				}[] = [];

				while (directoryQueue.length > 0) {
					const currentPath = directoryQueue.shift()!;
					const contents = await fetchDirectoryContents(currentPath);

					for (const item of contents) {
						if (item.type === 'dir') {
							directoryQueue.push(item.path);
							processedFiles.push({
								name: item.name,
								path: item.path,
								type: 'dir',
								content: ''
							});
						} else if (item.type === 'file' && isAllowedFile(item.name)) {
							try {
								const fileResponse = await fetch(item.download_url);
								if (!fileResponse.ok) throw new Error('Failed to fetch file content');
								const content = await fileResponse.text();
								processedFiles.push({
									name: item.name,
									path: item.path,
									content: content,
									type: 'file'
								});
							} catch (err) {
								console.error(`Error fetching ${item.name}:`, err);
							}
						}
					}
				}

				setFiles(processedFiles);
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
			<ScriptLayout script={script} files={files} />
		</div>
	);
}
