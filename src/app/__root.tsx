import { Outlet, createRootRouteWithContext, HeadContent, Scripts, ErrorComponent } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import appCss from './globals.css?url';
import ClientLayout from './-clientLayout';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { website_url, title, logo, twitter, owner } from '@/components/common';
import ErrorPageComponent from './-error';
import NotFoundPage from './not-found';

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	errorComponent: ErrorPageComponent,
	notFoundComponent: NotFoundPage,
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1, maximum-scale=5'
			},
			{ title: 'AntiRaid' },
			{ name: 'theme-color', content: '#8c45f4', media: '(prefers-color-scheme: light)' },
			{ name: 'theme-color', content: '#0f0f12', media: '(prefers-color-scheme: dark)' }
		],
		links: [
			{ rel: 'stylesheet', href: appCss },
			{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
			{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
			{
				href: 'https://fonts.googleapis.com/css2?family=Borel&display=swap',
				rel: 'stylesheet'
			},
			{
				href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
				rel: 'stylesheet'
			},
			{
				href: 'https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap',
				rel: 'stylesheet'
			}
		],
		scripts: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebSite',
					name: title,
					url: website_url,
					publisher: {
						'@type': 'Organization',
						name: owner,
						url: website_url,
						logo: {
							'@type': 'ImageObject',
							url: logo ? `${website_url}${logo}` : `${website_url}/logo.webp`
						},
						sameAs: [
							`https://twitter.com/${twitter.replace('@', '')}`,
							'https://github.com/Anti-Raid'
						]
					}
				})
			}
		]
	}),
	component: RootComponent
});

function RootComponent() {
	const { queryClient } = Route.useRouteContext();
	return (
		<RootDocument>
			<QueryClientProvider client={queryClient}>
				<ClientLayout>
					<Outlet />
				</ClientLayout>
				<ReactQueryDevtools buttonPosition="bottom-right" />
			</QueryClientProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-background">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
