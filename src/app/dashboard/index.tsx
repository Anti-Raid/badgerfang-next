import { createFileRoute, redirect } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import Servers from '@/components/dashboard/all-servers';
import { authorizedSessionOptions, userServersOptions } from '@/lib/api';

export const Route = createFileRoute('/dashboard/')({
    beforeLoad: async ({ context: { queryClient } }) => {
        // Check authentication server-side
        const session = await queryClient.fetchQuery(authorizedSessionOptions);
        if (!session) {
            throw redirect({
                to: '/authorize',
                search: {
                    redirect: '/dashboard'
                }
            });
        }
    },
    loader: ({ context: { queryClient } }) => 
        queryClient.ensureQueryData(userServersOptions),
    component: Dashboard,
    // Disable SSR for dashboard (requires client-side auth state)
    ssr: false,
    pendingComponent: () => <div className="flex items-center justify-center h-screen">Loading dashboard...</div>
});

function Dashboard() {
	// Data is pre-loaded via loader
	return (
		<div className="min-h-screen pt-16">
			<Servers />
		</div>
	)
}
