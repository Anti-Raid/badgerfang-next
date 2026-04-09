import type React from 'react';
import type { Metadata } from 'next';
import { generateScriptMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';

export const metadata: Metadata = generateScriptMetadata({
	canonicalUrl: `${website_url}/script/shop`
});

export default function ScriptShopLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
