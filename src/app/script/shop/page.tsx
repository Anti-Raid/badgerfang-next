'use client';

import { useEffect, useState } from 'react';
import { TemplateShop } from '@/components/scripts/scriptShop';
import type { TemplateShopProps } from '@/types/script';
import { anonexecuteSettings } from '@/lib/api';
import { website_url } from '@/components/common';
import { Metadata } from 'next';
import { generateScriptMetadata } from '@/lib/Metadata';

/**
 * Renders the template shop page, fetching template data from the public settings API and displaying it.
 *
 * Shows a loading spinner while data is being fetched and displays an error message if the fetch fails.
 */

export default function TemplateShopPage() {
	const [templates, setTemplates] = useState<TemplateShopProps[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				setIsLoading(true);

				const payload = {
					operation: 'View',
					setting: 'template_shop_public_list',
					fields: {}
				};
				const settingsResponse = await anonexecuteSettings(payload);

				const templatesData = settingsResponse.fields;

				if (Array.isArray(templatesData)) {
					setTemplates(templatesData);
				} else {
					setError('Failed to fetch repository data. Using fallback data.');
				}
			} catch (err) {
				setError('Failed to fetch repository data. Using fallback data.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchTemplates();
	}, []);

	return (
		<div className="min-h-screen">
			<div className="relative overflow-hidden">
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
