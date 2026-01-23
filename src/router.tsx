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
		scrollRestoration: true,
		parseSearch: (search) => {
			const params = new URLSearchParams(search);
			const result: Record<string, any> = {};
			params.forEach((value, key) => {
				try {
					// Try to parse as JSON first (for complex objects)
					result[key] = JSON.parse(value);
				} catch {
					// If it fails, treat as plain string
					result[key] = value;
				}
			});
			return result;
		},
		stringifySearch: (search) => {
			const params = new URLSearchParams();
			Object.entries(search).forEach(([key, value]) => {
				if (value === undefined || value === null) return;
				// Always convert to string to avoid JSON stringification that causes encoding issues
				params.set(key, String(value));
			});
			const str = params.toString();
			return str ? `?${str}` : '';
		}
	});
}

export const getRouter = createRouter;

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
