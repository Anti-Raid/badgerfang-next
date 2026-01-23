// Type definition for manifest
type ManifestIcon = {
	src: string;
	sizes: string;
	type: string;
};

type Manifest = {
	name: string;
	short_name: string;
	description: string;
	start_url: string;
	display: string;
	background_color: string;
	theme_color: string;
	icons: ManifestIcon[];
};

import { title, description_short } from '@/components/common';

export default function manifest(): Manifest {
	return {
		name: title,
		short_name: 'AntiRaid',
		description: description_short,
		start_url: '/',
		display: 'standalone',
		background_color: '#0f0f12',
		theme_color: '#8c45f4',
		icons: [
			{
				src: '/logo.webp',
				sizes: '192x192',
				type: 'image/webp'
			},
			{
				src: '/logo.webp',
				sizes: '512x512',
				type: 'image/webp'
			}
		]
	};
}
