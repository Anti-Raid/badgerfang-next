'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';

/**
 * Wraps child components with a themed context using NextThemesProvider.
 *
 * This component configures NextThemesProvider to apply a theme based on the user's system preference by default.
 * It sets the "class" attribute for DOM theme management, enables system theme detection, and supplies the following themes:
 * 'dark', 'blue-theme', 'dark-blue-theme', 'dark-red-theme', 'green-theme', 'dark-green-theme', 'electric-purple-theme',
 * 'arctic-frost-theme', and 'sunset-amber-theme'.
 * Any additional props are forwarded to the NextThemesProvider.
 *
 * @param children - The child components that receive the theme context.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={[
        'dark', 'blue-theme', 'dark-blue-theme', 'dark-red-theme',
        'green-theme', 'dark-green-theme', 'electric-purple-theme',
        'arctic-frost-theme', 'sunset-amber-theme'
      ]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}