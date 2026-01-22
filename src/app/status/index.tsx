import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import Status from '@/components/status/Layout';
import { generateStatusMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';
import { botStatsOptions } from '@/lib/api';

export const Route = createFileRoute('/status/')({
    loader: ({ context: { queryClient } }) => 
        queryClient.ensureQueryData(botStatsOptions),
    component: BotStatusPage,
    head: () => generateStatusMetadata({
        canonicalUrl: `${website_url}/status`
    }),
    // Enable SSR for better SEO and initial load performance
    ssr: true
});

function BotStatusPage() {
	// Data is already loaded via loader, but component still uses useQuery for polling
	// This allows the loader to SSR the initial data, then client takes over for polling
	return (
		<main>
			<Status />
		</main>
	)
}
