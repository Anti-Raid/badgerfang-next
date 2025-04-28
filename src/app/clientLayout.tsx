'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Header from '@/components/static/Header';
import Footer from '@/components/static/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import ToastProvider from '@/components/ui/ToastProvider';
import { HelmetProvider } from 'react-helmet-async';
import { SWRConfig } from 'swr';
import { ViewTransitions } from 'next-view-transitions';

/**
 * Provides a client-side layout that manages loading and authentication states for rendering protected pages.
 *
 * This component checks for valid user session data and authorization. If the current route is the home page,
 * it temporarily displays a loading spinner before rendering the main layout. If no valid session is found or the user
 * is unauthorized, it clears session-related local storage entries and redirects to the home page.
 * The layout wraps its children with providers for document head management, theming, data fetching, and toast notifications,
 * and includes a header and footer.
 *
 * @param children - The content to be rendered within the layout.
 * @returns The rendered layout as a JSX element.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') setIsLoading(window.location.pathname === '/');
		const timer = setTimeout(() => setIsLoading(false), 2000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<HelmetProvider>
			<ThemeProvider defaultTheme="dark" attribute="class">
				<SWRConfig>
					<ToastProvider>
						<ViewTransitions>
							{isLoading ? (
								<Loading onClose={() => setIsLoading(false)} />
							) : (
								<>
									<Header />
									<article className="min-h-screen flex-col justify-between overflow-x-hidden">
										<main className="mt-9 p-1 w-full md:max-w-7xl mx-auto h-full min-h-screen">
											{children}
										</main>
										<Footer />
									</article>
								</>
							)}
						</ViewTransitions>
					</ToastProvider>
				</SWRConfig>
			</ThemeProvider>
		</HelmetProvider>
	);
}