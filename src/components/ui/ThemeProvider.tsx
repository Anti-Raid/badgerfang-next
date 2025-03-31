'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			themes={['light', 'dark', 'blue-theme', 'dark-red-theme']}
			{...props}
		>
			{children}
		</NextThemesProvider>
	);
}
