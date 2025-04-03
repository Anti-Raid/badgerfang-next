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
