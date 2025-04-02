'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={[
        'light', 'dark', 'blue-theme', 'dark-blue-theme', 'dark-red-theme',
        'green-theme', 'dark-green-theme', 'electric-purple-theme',
        'arctic-frost-theme', 'sunset-amber-theme'
      ]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}