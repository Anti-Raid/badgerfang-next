'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ScriptLayout } from '@/components/scripts/scriptLayout';
import type { TemplateShopProps } from '@/types/script';
import { TemplateShopTemplate } from '@/types/gosdk/types';
import { getTemplateShop } from '@/lib/api';

export default function ScriptPage() {
	const params = useParams();
	const scriptName = params.name as string;

	const [script, setScript] = useState<TemplateShopTemplate | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchScriptData = async () => {
			try {
				setIsLoading(true);

				let resp = await getTemplateShop(scriptName);
				if (!resp) {
					setError('Script not found');
					setIsLoading(false);
					return;
				}

				setScript(resp);
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
			<ScriptLayout script={script} files={script.content} />
		</div>
	);
}
