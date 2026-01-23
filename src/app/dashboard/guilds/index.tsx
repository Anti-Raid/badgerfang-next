import { createFileRoute, redirect } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import Settings from '@/components/settings/layout';
import { authorizedSessionOptions, baseGuildUserInfoOptions, settingsOptions } from '@/lib/api';
import { type } from 'arktype';

const searchSchema = type({
	'id?': 'string'
});

export const Route = createFileRoute('/dashboard/guilds/')({
	validateSearch: (search: Record<string, unknown>) => {
		const result = searchSchema(search) as { id?: string };
		if (result instanceof type.errors) {
			return {} as { id?: string };
		}
		// Sanitize ID - remove any quotes or spaces that might have leaked in
		if (result.id && typeof result.id === 'string') {
			result.id = result.id.replace(/["']/g, '').trim();
		}
		return result;
	},
	beforeLoad: async ({ context: { queryClient } }) => {
		// Check authentication server-side
		const session = await queryClient.fetchQuery(authorizedSessionOptions);
		if (!session) {
			throw redirect({
				to: '/authorize',
				search: {
					redirect: '/dashboard/guilds'
				}
			});
		}
	},
	loader: async ({ context: { queryClient }, search }: any) => {
		const searchParams = search as { id?: string };
		if (!searchParams?.id) {
			return;
		}
		// Pre-load guild data and settings
		await Promise.all([
			queryClient.ensureQueryData(baseGuildUserInfoOptions(searchParams.id)),
			queryClient.ensureQueryData(settingsOptions(searchParams.id))
		]);
	},
	component: Guild,
	// Disable SSR for settings (requires client-side state)
	ssr: false,
	pendingComponent: () => (
		<div className="flex items-center justify-center h-screen">Loading guild settings...</div>
	)
});

function Guild() {
	const { id } = Route.useSearch();

	if (!id) {
		return (
			<div className="min-h-screen pt-16 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Guild ID is missing</h2>
					<p className="text-muted-foreground">Please provide a guild ID in the URL</p>
				</div>
			</div>
		);
	}

	// Data is pre-loaded via loader
	return (
		<div className="min-h-screen pt-16">
			<Settings guildId={id} />
		</div>
	);
}
