import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import CommandInterface from '@/components/commands/layout';
import { website_url } from '@/components/common';
import { generateCommandMetadata } from '@/lib/Metadata';
import { botCommandsOptions } from '@/lib/api';

export const Route = createFileRoute('/commands/')({
	loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(botCommandsOptions),
	component: Commands,
	head: () =>
		generateCommandMetadata({
			canonicalUrl: `${website_url}/commands`
		}),
	// Enable SSR for better SEO
	ssr: true
});

function Commands() {
	return (
		<>
			<main>
				<CommandInterface />
			</main>
		</>
	);
}
