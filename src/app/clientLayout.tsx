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
 * Renders a client-side layout for protected pages with accessibility features.
 * Includes skip link, semantic structure, and smooth loading transitions.
 *
 * @param children - The content to display within the main area of the layout.
 * @returns The composed layout as a JSX element.
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
								{/* Skip link for keyboard navigation - WCAG 2.1 AA */}
								<a href="#main-content" className="skip-link">
									Skip to main content
								</a>
								<Header />
								<div className="min-h-screen flex flex-col overflow-x-hidden">
									<main
										id="main-content"
										className="flex-1 mt-20 md:mt-24 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto"
										role="main"
									>
										{children}
									</main>
									<Footer />
								</div>
							</>
						)}
					</ToastProvider>
				</SWRConfig>
			</ThemeProvider>
		</FFlagProvider>
	);
}
