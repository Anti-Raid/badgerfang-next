import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import { nextui } from '@nextui-org/react';

export default {
	darkMode: 'class',
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		extend: {
			fontFamily: {
				monocraft: ['Monocraft', 'sans-serif'],
				cursive: ['"Borel"', 'cursive'],
				monster: ['"Montserrat"', 'sans-serif'],
				cabin: ['"Cabin"', 'sans-serif']
			}
		}
	},
	plugins: [nextui(), forms]
} satisfies Config;
