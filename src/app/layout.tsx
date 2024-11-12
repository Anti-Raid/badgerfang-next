import type { Metadata } from 'next';
import { title, description, logo } from '@/components/common';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import React from 'react';

export const metadata: Metadata = {
	title: title,
	description: description,
	icons: [logo, '/favicon.ico']
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
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
			{/* <body className="min-h-screen bg-gradient-to-b from-purple-800 to-purple-400/85"> */}
			<body className="min-h-screen bg-gradient-to-b from-purple-950 to-background/85">
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<Header></Header>
					<article className="min-h-screen flex-col justify-between overflow-x-hidden">
						<main className="mt-9 p-1 w-full md:max-w-7xl mx-auto h-full min-h-screen">
							{children}
						</main>

						<Footer />
					</article>
				</ThemeProvider>
			</body>
		</html>
	);
}
