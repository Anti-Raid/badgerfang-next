import { MetadataRoute } from 'next';
import { title, description_short } from '@/components/common';

export default function manifest(): MetadataRoute.Manifest {
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
				type: 'image/webp',
			},
			{
				src: '/logo.webp',
				sizes: '512x512',
				type: 'image/webp',
			},
		],
	};
}
