'use client';
import './globals.css';
import Loading from '@/components/Loading';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import React, { useEffect, useState } from 'react';
import ToastProvider from '@/components/ToastProvider';

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

			<body className="min-h-screen bg-background">
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
				</ThemeProvider>
			</body>
		</html>
	);
}
