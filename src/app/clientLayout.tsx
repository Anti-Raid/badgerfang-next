'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Header from '@/components/static/Header';
import Footer from '@/components/static/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import ToastProvider from '@/components/ui/ToastProvider';
import { HelmetProvider } from 'react-helmet-async';
import { SWRConfig } from 'swr';
import { useAuthCheck } from '@/lib/auth/checkAuthCreds';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';

/**
 * Provides a consistent client-side layout with integrated loading and authentication management.
 *
 * This component wraps its children with several context providers including theming, data fetching, and notifications,
 * along with header and footer components. It briefly displays a loading indicator when the application starts at the
 * root path, and it clears stale authentication data from localStorage if the user becomes unauthorized.
 *
 * @param children - The content to be rendered within the layout.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);
	const handleLoadingClose = () => setIsLoading(false);
  const sessionData = getAuthCreds();
  const { isAuthorized, mutateAuth } = useAuthCheck(sessionData);

	useEffect(() => {
		if (typeof window !== 'undefined') setIsLoading(window.location.pathname === '/');
		const timer = setTimeout(() => setIsLoading(false), 2000);
		return () => clearTimeout(timer);
	}, []);

  useEffect(() => {
    if (!isAuthorized) {
      localStorage.removeItem('winstala');
      localStorage.removeItem('authUser');
    }
  }, [isAuthorized]);

	return (
		<HelmetProvider>
			<ThemeProvider>
				<SWRConfig>
					<ToastProvider>
						{isLoading ? (
							<Loading onClose={handleLoadingClose} />
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
					</ToastProvider>
				</SWRConfig>
			</ThemeProvider>
		</HelmetProvider>
	);
}
