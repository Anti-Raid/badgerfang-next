'use client';
import './globals.css';
import Loading from '@/components/Loading';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import React, { useEffect, useState } from 'react';
import ToastProvider from '@/components/ToastProvider';
import { HelmetProvider } from 'react-helmet-async';
import { SWRConfig } from 'swr';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';
import { logoutUser } from '@/lib/auth/logoutUser';

const fetcher = async (url: string, onRetryAfter: (retryAfter: number) => {} | null) => {
	let authData = getAuthCreds();

	let res: Response;
	if (authData) {
		res = await fetch(url, {
			headers: {
				'Authorization': authData.token
			}
		})
	} else {
		res = await fetch(url);
	}

	if (res.status == 401) {
		logoutUser();
		setTimeout(() => window.location.reload(), 1000);
		throw new Error("Your session has expired. Re-login to continue.");
	}

	if ([408, 502, 503, 504].includes(res.status)) {
		throw new Error('Server currently undergoing maintenance');
	}

	if (res.headers.get("Retry-After")) {
		let retryAfter = parseFloat(res.headers.get("Retry-After") || "0");
		onRetryAfter(retryAfter);

		// Wait for the retry after time
		await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

		// Retry the request
		return await fetcher(url, onRetryAfter);
	}

	return await res.json();
}

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
