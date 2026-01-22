'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Header from '@/components/static/Header';
import Footer from '@/components/static/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import ToastProvider from '@/components/ui/ToastProvider';
import { SWRConfig } from 'swr';
import { FFlagProvider } from '@/components/ui/FFlagProvider';
import Snowfall from '@/components/effects/Snowfall';

/**
 * Renders a client-side layout for protected pages, showing a loading spinner on the home route before displaying the main content.
 *
 * The layout includes theming, document head management, data fetching configuration, toast notifications, and page transition animations, along with a header and footer.
 *
 * @param children - The content to display within the main area of the layout.
 * @returns The composed layout as a JSX element.
 *
 * @remark The loading spinner appears for 2 seconds only when the current route is the home page.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') setIsLoading(window.location.pathname === '/');
		const timer = setTimeout(() => setIsLoading(false), 2000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<FFlagProvider>
			<ThemeProvider defaultTheme="dark" attribute="class">
				<SWRConfig>
					<ToastProvider>
						{isLoading ? (
							<Loading onClose={() => setIsLoading(false)} />
						) : (
							<>
								<Snowfall />
								<Header />
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
		</FFlagProvider>
	);
}
