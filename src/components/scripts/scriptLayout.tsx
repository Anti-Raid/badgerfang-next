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

/**
 * Renders a layout for viewing a script's details along with its related files.
 *
 * This component displays a back navigation link to the Script Shop, a card with the script template details,
 * and a non-editable code editor presenting the script's associated files.
 *
 * @param script - The script template information to display.
 * @param files - An array of file objects containing details such as name, path, content, and type.
 * @returns A React element representing the script layout.
 */
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

			<div className="w-full">
				<ScriptIDE
					files={files}
					isContentEditable={false}
					height="800px"
					width="100%"
				/>
			</div>
		</div>
	);
}

export default ScriptLayout;
