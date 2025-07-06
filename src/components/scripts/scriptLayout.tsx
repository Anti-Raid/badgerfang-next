'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { ScriptIDE } from '../ide/ide';
import { CommonCard } from './ScriptCard';
import type { TemplateShopProps } from '@/types/script';
import { TemplateShopPartialTemplate } from '@/types/gosdk/types';

interface ScriptLayoutProps {
	script: TemplateShopPartialTemplate;
	files: { [key: string]: string };
}

/**
 * Displays a script template's details and its associated files in a read-only layout.
 *
 * Shows a back navigation link, a card with script information, and a non-editable code editor containing the script's files.
 *
 * @returns A React element rendering the script details and files.
 */
export function ScriptLayout({ script, files }: ScriptLayoutProps) {
	// Convert content object to files array for ScriptIDE
	const contentToFiles = (content: Record<string, string>) => {
		return Object.entries(content).map(([name, content]) => ({
			name,
			path: name,
			content,
			type: 'file' as const
		}));
	};

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

			<div className="w-full">
				<ScriptIDE
					files={contentToFiles(files)}
					isContentEditable={false}
					height="800px"
					width="100%"
				/>
			</div>
		</div>
	);
}

export default ScriptLayout;
