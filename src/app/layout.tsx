'use client';
import './globals.css';
import Loading from '@/components/Loading';
import Header from '@/components/static/Header';
import Footer from '@/components/static/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import React, { useEffect, useState } from 'react';
import ToastProvider from '@/components/ui/ToastProvider';
import { HelmetProvider } from 'react-helmet-async';
import { SWRConfig } from 'swr';
import { logoutUser } from '@/lib/auth/logoutUser';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';
import type { Metadata } from "next";
import { title, description, keywords } from '@/components/common';

export const metadata: Metadata = {
  title: {
    template: `%s | ${title}`,
    default: `${title} - ${description}`,
  },
  description:
    `${description}`,
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://antiraid.xyz',
		title: `${title} - ${description}`,
		description: `${description}`,
		siteName: `${title} - ${description}`,
	},
	twitter: {
		card: 'summary_large_image',
		title: `${title} - ${description}`,
		description: `${description}`,
		site: '@heyantiraid',
		creator: '@heypurrquinox',
	},
	keywords: `${keywords}`,
	robots: {
		index: true,
		follow: true,
	},
	appleWebApp: {
		title: `${title} - ${description}`,
		statusBarStyle: 'default',
	},
	viewport: 'width=device-width, initial-scale=1',
	icons: {
		icon: '/logo.webp',
		shortcut: '/logo.webp',
	},

};

const fetcher = async (url: string, onRetryAfter: (retryAfter: number) => {} | null) => {
	let authData = getAuthCreds();

	let res: Response;
	if (authData) {
		res = await fetch(url, {
			headers: {
				Authorization: authData.token
			}
		});
	} else {
		res = await fetch(url);
	}

	if (res.status == 401) {
		logoutUser();
		setTimeout(() => window.location.reload(), 1000);
		throw new Error('Your session has expired. Re-login to continue.');
	}

	if ([408, 502, 503, 504].includes(res.status)) {
		throw new Error('Server currently undergoing maintenance');
	}

	if (res.headers.get('Retry-After')) {
		let retryAfter = parseFloat(res.headers.get('Retry-After') || '0');
		onRetryAfter(retryAfter);

		// Wait for the retry after time
		await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

		// Retry the request
		return await fetcher(url, onRetryAfter);
	}

	return await res.json();
};

export const runtime = "edge";


export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [isLoading, setIsLoading] = useState(false);
	const handleLoadingClose = () => setIsLoading(false);

	useEffect(() => {
		if (typeof window !== 'undefined') setIsLoading(window.location.pathname === '/');
		const timer = setTimeout(() => setIsLoading(false), 2000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Borel&display=swap" rel="stylesheet" />
				<link
					href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<HelmetProvider>
				<body className="min-h-screen bg-background">
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						forcedTheme="dark"
						enableSystem={false}
						disableTransitionOnChange
					>
						<SWRConfig
							value={{
								fetcher
							}}
						>
							<ToastProvider>
								{isLoading ? (
									<Loading onClose={handleLoadingClose} />
								) : (
									<>
										<Header></Header>
										<article className="min-h-screen flex-col justify-between overflow-x-hidden">
											<main className="mt-9 p-1 w-full md:max-w-7xl mx-auto h-full min-h-screen">
												{children}
											</main>

											<Footer />
										</article>
									</>
								)}
							</ToastProvider>
						</SWRConfig>
					</ThemeProvider>
				</body>
			</HelmetProvider>
		</html>
	);
}
