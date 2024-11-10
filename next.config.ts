import type { NextConfig } from 'next';
import { version } from './package.json';
import { execSync } from 'child_process';

const getGitCommitHash = (): string => {
	try {
		const gitCommand = 'git rev-parse --short HEAD';
		return execSync(gitCommand).toString().trim();
	} catch (error) {
		console.error('Error fetching Git commit hash:', error);
		return 'unknown'; // Fallback in case of error
	}
};

const getLastMod = (): string => {
	try {
		const gitCommand = 'git log -1 --format="%cd"';
		return execSync(gitCommand).toString().trim();
	} catch (error) {
		console.error('Error fetching Git commit hash:', error);
		return 'unknown'; // Fallback in case of error
	}
};

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_BUILD_ENV: process.env.NODE_ENV || 'development',
		NEXT_PUBLIC_COMMIT: getGitCommitHash(),
		NEXT_PUBLIC_VERSION: version,
		NEXT_PUBLIC_LASTMOD: getLastMod()
	}
};

export default nextConfig;
