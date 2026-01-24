import { createFileRoute } from '@tanstack/react-router';
import { generateStatusMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';
import { botStatsOptions } from '@/lib/api';
import React from 'react';

const Status = React.lazy(() => import('@/components/status/Layout'));

export const Route = createFileRoute('/status/')({
	loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(botStatsOptions),
	component: BotStatusPage,
	head: () =>
		generateStatusMetadata({
			canonicalUrl: `${website_url}/status`
		}),
	// Enable SSR for better SEO and initial load performance
	ssr: true
});

function BotStatusPage() {
	return (
		<main>
			<React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Status...</div>}>
				<Status />
			</React.Suspense>
		</main>
	);
}
