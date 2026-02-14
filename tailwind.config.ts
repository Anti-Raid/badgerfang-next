import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

export default {
	darkMode: 'class',
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}'
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
				inter: ['"Inter"', 'sans-serif'],
				mono: ['"Monocraft"', 'ui-monospace', 'monospace'],
				// Legacy aliases for backward compatibility
				monocraft: ['"Monocraft"', 'monospace'],
				cabin: ['"Inter"', 'sans-serif'],
				monster: ['"Inter"', 'sans-serif'],
				cursive: ['"Inter"', 'sans-serif'],
				lora: ['"Inter"', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)',
				xl: 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				full: 'var(--radius-full)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				extra: {
					DEFAULT: 'hsl(var(--extra))',
					foreground: 'hsl(var(--extra-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			spacing: {
				'4.5': '1.125rem',
				'18': '4.5rem',
				'112': '28rem',
				'128': '32rem'
			},
			transitionDuration: {
				fast: 'var(--duration-fast)',
				normal: 'var(--duration-normal)',
				slow: 'var(--duration-slow)'
			},
			boxShadow: {
				glow: '0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.15)',
				'glow-sm': '0 0 10px hsl(var(--primary) / 0.2)'
			}
		}
	},
	plugins: [forms, require('tailwindcss-animate')]
} satisfies Config;
