import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '@/components/Hero/index';
import { botStatsOptions } from '@/lib/api';
import { generateHomeMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';

export const Route = createFileRoute('/')({
	loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(botStatsOptions),
	component: Home,
	head: () =>
		generateHomeMetadata({
			canonicalUrl: website_url
		}),
	// Enable SSR for better SEO and initial load
	ssr: true
});

function Home() {
	return (
		<main>
			<Hero />
		</main>
	);
}
