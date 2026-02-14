'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { ScriptIDE } from '../ide/ide';
import { CommonCard } from './ScriptCard';

interface ScriptLayoutProps {
	script: any; // TODO: Fixme once shop is updated
	files: { [key: string]: string };
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
			<nav className="mb-8" aria-label="Back navigation">
				<Link
					href="/script/shop"
					className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1 -ml-2"
				>
					<FiArrowLeft className="mr-2" aria-hidden="true" />
					Back to Script Shop
				</Link>
			</nav>

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
