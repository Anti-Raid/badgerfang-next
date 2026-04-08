import type React from 'react';
import type { Metadata } from 'next';
import { generateScriptMetadata } from '@/lib/Metadata';

export const metadata: Metadata = generateScriptMetadata({
	title: 'Script',
	keywords: ['Script', 'Template', 'Luau', 'Customization']
});

export default function ScriptLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
