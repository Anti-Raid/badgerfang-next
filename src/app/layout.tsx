"use client";

import './globals.css';
import Loading from '@/components/Loading';
import Header from '@/components/static/Header';
import  { metadata } from './metadata'
import Footer from '@/components/static/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import React, { useEffect, useState } from 'react';
import ToastProvider from '@/components/ui/ToastProvider';
import { HelmetProvider } from 'react-helmet-async';
import { SWRConfig } from 'swr';

export const runtime = "edge";

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
      <Metadata />
      <HelmetProvider>
        <body className="min-h-screen bg-background">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
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
        </body>
      </HelmetProvider>
    </html>
  );
}
