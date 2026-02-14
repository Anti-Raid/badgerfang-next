import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './clientLayout';
import { generateMetadata, siteViewport } from '@/lib/Metadata';
export const metadata: Metadata = generateMetadata({});
export const viewport = siteViewport;

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
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="min-h-screen bg-background font-sans antialiased">
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
