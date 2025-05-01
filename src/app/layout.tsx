import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './clientLayout';
import { generateMetadata } from '@/lib/Metadata';
export const metadata: Metadata = generateMetadata({});

/**
 * Defines the root layout for the application, setting up the global HTML structure, loading custom fonts, and wrapping all page content with the client layout.
 *
 * @param children - The React nodes to render within the layout.
 */
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
			<body className="min-h-screen bg-background">
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
