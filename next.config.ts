import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_BUILD_ENV: process.env.NODE_ENV || 'development'
	},
	images: {
		remotePatterns: [
			{
				hostname: '**'
			}
		]
	},
	experimental: {
		viewTransition: true,
	}
};

export default nextConfig;
