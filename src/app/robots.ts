import { MetadataRoute } from 'next';
import { website_url } from '@/components/common';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/dashboard/', '/authorize', '/debug/', '/api/']
			}
		],
		sitemap: `${website_url}/api/sitemap.xml`
	};
}
