import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { QueryClient } from '@tanstack/react-query';

export function createRouter() {
	const queryClient = new QueryClient();

	return createTanStackRouter({
		routeTree,
		context: {
			queryClient
		},
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		scrollRestoration: true
	});
}

export const getRouter = createRouter;

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
