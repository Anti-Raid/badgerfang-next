import { createFileRoute, redirect } from '@tanstack/react-router';
import Dashboard from '@/components/dashboard/developers/session';
import { authorizedSessionOptions, userSessionsOptions } from '@/lib/api';
import { generateDeveloperDashboardMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';

export const Route = createFileRoute('/dashboard/developers/')({
    beforeLoad: async ({ context: { queryClient } }) => {
        // Check authentication server-side
        const session = await queryClient.fetchQuery(authorizedSessionOptions);
        if (!session) {
            throw redirect({
                to: '/authorize',
                search: {
                    redirect: '/dashboard/developers'
                }
            });
        }
    },
    loader: ({ context: { queryClient } }) => 
        queryClient.ensureQueryData(userSessionsOptions),
    component: Settings,
    head: () => generateDeveloperDashboardMetadata({
        canonicalUrl: `${website_url}/dashboard/developers`
    }),
    // Disable SSR for developers dashboard (requires client-side state)
    ssr: false,
    pendingComponent: () => <div className="flex items-center justify-center h-screen">Loading sessions...</div>
});

function Settings() {
	// Data is pre-loaded via loader
	return (
		<div className="min-h-screen pt-16">
			<Dashboard />
		</div>
	)
}
