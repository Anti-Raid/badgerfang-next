import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	typescript: { ignoreBuildErrors: true },
        eslint: { ignoreDuringBuilds: true },
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
		viewTransition: true
	}
};

export default nextConfig;
