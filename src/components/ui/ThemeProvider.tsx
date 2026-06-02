'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface ThemeContextType {
	theme: string;
	setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
	theme: 'dark',
	setTheme: () => {}
});

export function useTheme() {
	return useContext(ThemeContext);
}

const LIGHT_THEMES = [
	'arctic-frost-theme',
	'sunbeam-theme',
	'crisp-theme',
	'float-theme',
	'puzzlebloom-theme',
	'cotton-candy-theme'
];

export function ThemeProvider({
	children,
	defaultTheme = 'dark'
}: {
	children: ReactNode;
	defaultTheme?: string;
}) {
	// Initialize state with defaultTheme, then update from localStorage on mount
	const [theme, setThemeState] = useState(defaultTheme);
	const [mounted, setMounted] = useState(false);

	// Effect to apply theme whenever it changes
	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;
		root.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		
		const isDark = !LIGHT_THEMES.includes(theme);
		if (isDark) {
			root.classList.add('dark');
			root.style.colorScheme = 'dark';
		} else {
			root.classList.remove('dark');
			root.style.colorScheme = 'light';
		}
		
		console.log(`[ThemeProvider] Theme applied: ${theme} (isDark: ${isDark})`);
	}, [theme, mounted]);

	// Initialize theme from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem('theme');
		if (saved) {
			setThemeState(saved);
		}
		setMounted(true);
	}, []);

	const setTheme = useCallback((newTheme: string) => {
		setThemeState(newTheme);
	}, []);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
