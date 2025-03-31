'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { ScriptIDE } from '../ide/ide';
import { CommonCard } from './ScriptCard';
import type { TemplateShopProps } from '@/types/script';

interface ScriptLayoutProps {
	script: TemplateShopProps;
	files: {
		name: string;
		path: string;
		content: string;
		type: 'file' | 'dir';
	}[];
}

export function ScriptLayout({ script, files }: ScriptLayoutProps) {
	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<div className="mb-8">
				<Link
					href="/script/shop"
					className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300 ease-in-out"
				>
					<FiArrowLeft className="mr-2" />
					Back to Script Shop
				</Link>
			</div>

			<div className="mb-8">
				<CommonCard template={script} />
			</div>

			<div className="grid grid-cols-1 gap-8">
				<ScriptIDE files={files} isContentEditable={false} height="800px" width="2000%" />
			</div>
		</div>
	);
}

export default ScriptLayout;
