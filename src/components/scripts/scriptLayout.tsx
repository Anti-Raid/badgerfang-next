'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FiArrowLeft, FiCode, FiCopy, FiGithub, FiX } from 'react-icons/fi';
import type { TemplateShopProps } from '@/types/script';
import { CommonCard } from './ScriptCard';

interface ScriptLayoutProps {
	script: TemplateShopProps;
	files: {
		name: string;
		path: string;
		content: string;
	}[];
}

export function ScriptLayout({ script, files }: ScriptLayoutProps) {
	const [activeTab, setActiveTab] = useState(files.length > 0 ? files[0].name : '');
	const [showToast, setShowToast] = useState(false);
	const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const copyToClipboard = (content: string) => {
		navigator.clipboard.writeText(content);

		// Clear any existing timeout
		if (toastTimeoutRef.current) {
			clearTimeout(toastTimeoutRef.current);
		}

		// Show toast
		setShowToast(true);

		// Hide toast after 3 seconds
		toastTimeoutRef.current = setTimeout(() => {
			setShowToast(false);
		}, 3000);
	};

	const getLanguage = (fileName: string): string => {
		const extension = fileName.split('.').pop()?.toLowerCase();
		switch (extension) {
			case 'js':
				return 'javascript';
			case 'ts':
				return 'typescript';
			case 'tsx':
				return 'typescript';
			case 'jsx':
				return 'jsx';
			case 'json':
				return 'json';
			case 'md':
				return 'markdown';
			case 'lua':
				return 'lua';
			case 'luau':
				return 'lua';
			case 'py':
				return 'python';
			case 'css':
				return 'css';
			case 'html':
				return 'html';
			case 'yml':
			case 'yaml':
				return 'yaml';
			default:
				return 'text';
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Toast notification */}
			{showToast && (
				<div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5">
					<div className="bg-background border border-border shadow-lg rounded-lg p-4 flex items-center gap-3">
						<div className="text-primary">
							<FiCopy className="h-5 w-5" />
						</div>
						<div>
							<h4 className="font-semibold text-foreground">Copied to clipboard</h4>
							<p className="text-sm text-muted-foreground">
								The code has been copied to your clipboard.
							</p>
						</div>
						<button
							onClick={() => setShowToast(false)}
							className="ml-auto text-muted-foreground hover:text-foreground"
						>
							<FiX className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			<div className="mb-8">
				<Link
					href="/script/shop"
					className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
				>
					<FiArrowLeft className="mr-2" />
					Back to Script Shop
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
				{/* Left side - Code display */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="bg-card rounded-xl shadow-lg border border-border overflow-hidden"
				>
					<div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
						<div className="flex items-center">
							<FiCode className="mr-2 text-primary" />
							<h2 className="font-monster font-semibold">Source Code</h2>
						</div>
						<div className="flex items-center space-x-2">
							<button
								className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
								onClick={() => window.open(`https://github.com/Anti-Raid/auto-slowdown`, '_blank')}
							>
								<FiGithub className="mr-2" />
								View on GitHub
							</button>
						</div>
					</div>

					{files.length > 0 ? (
						<div>
							{/* Custom Tabs */}
							<div className="overflow-x-auto">
								<div className="flex bg-muted/30 border-b border-border">
									{files.map((file) => (
										<button
											key={file.path}
											onClick={() => setActiveTab(file.name)}
											className={`px-4 py-2 text-sm font-medium border-r border-border last:border-r-0 transition-colors ${
												activeTab === file.name
													? 'bg-background text-foreground'
													: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
											}`}
										>
											{file.name}
										</button>
									))}
								</div>
							</div>

							{/* Content for active tab with syntax highlighting */}
							{files.map(
								(file) =>
									file.name === activeTab && (
										<div key={file.path} className="relative">
											<div className="absolute top-2 right-2 z-10">
												<button
													onClick={() => copyToClipboard(file.content)}
													className="h-8 w-8 p-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
												>
													<FiCopy className="h-4 w-4" />
													<span className="sr-only">Copy code</span>
												</button>
											</div>
											<div className="max-h-[70vh] overflow-y-auto">
												<SyntaxHighlighter
													language={getLanguage(file.name)}
													style={vscDarkPlus}
													customStyle={{
														margin: 0,
														borderRadius: 0,
														background: 'transparent',
														fontSize: '0.875rem'
													}}
													showLineNumbers={true}
													wrapLines={true}
													wrapLongLines={false}
												>
													{file.content}
												</SyntaxHighlighter>
											</div>
										</div>
									)
							)}
						</div>
					) : (
						<div className="p-8 text-center text-muted-foreground">
							<p>No source files available for this script.</p>
						</div>
					)}
				</motion.div>

				{/* Right side - Script metadata */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="space-y-6"
				>
					<CommonCard template={script} />
				</motion.div>
			</div>
		</div>
	);
}
