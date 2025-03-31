import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import {
	FiCode,
	FiCopy,
	FiGithub,
	FiX,
	FiMenu,
	FiFolder,
	FiFile,
	FiUpload,
	FiFolderPlus,
	FiFilePlus,
	FiSettings
} from 'react-icons/fi';
import { SiLua } from 'react-icons/si';
import dynamic from 'next/dynamic';
import * as monaco from 'monaco-editor'; // Import Monaco Editor

// Dynamically import the Monaco Editor with SSR disabled
const Editor = dynamic(() => import('@monaco-editor/react'), {
	ssr: false,
	loading: () => <div>Loading Editor...</div>
});

interface FileStructure {
	name: string;
	path: string;
	type: 'file' | 'folder';
	content?: string;
	children?: FileStructure[];
	expanded?: boolean;
	parent?: FileStructure; // Add parent property
}

interface ScriptIDEProps {
	files?: {
		name: string;
		path: string;
		content: string;
		type: 'file' | 'dir';
	}[];
	isContentEditable: boolean;
	height?: string;
	width?: string;
	onContentChange?: (content: Record<string, string>) => void;
}

// Tooltip component for icon buttons
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
	return (
		<div className="relative group">
			{children}
			<div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
				{text}
			</div>
		</div>
	);
};

export function ScriptIDE({
	files = [],
	isContentEditable = false,
	height = 'auto',
	width = '100%',
	onContentChange
}: ScriptIDEProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [activeTabs, setActiveTabs] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState('');
	const [showToast, setShowToast] = useState(false);
	const [fileStructure, setFileStructure] = useState<FileStructure[]>([]);
	const [flattenedFiles, setFlattenedFiles] = useState<{
		[key: string]: { content: string; path: string };
	}>({});
	const [editedContent, setEditedContent] = useState<{ [key: string]: string }>({});
	const [currentFiles, setCurrentFiles] = useState(files);
	const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dropZoneRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Ensure this code runs only on the client side
		if (typeof window !== 'undefined') {
			// Register Luau language support
			let isMounted = true;
			import('monaco-editor').then((monacoModule) => {
				if (!isMounted) return;
				const monaco = monacoModule; // Use the imported monaco
				monaco.languages.register({ id: 'luau' });
				try {
					// Register a tokens provider for the language
					monaco.languages.setMonarchTokensProvider('luau', {
						tokenizer: {
							root: [
								[/\[error.*/, 'custom-error'],
								[/\[warning.*/, 'custom-warning'],
								[/\[info.*/, 'custom-info'],
								[/\[debug.*/, 'custom-debug'],
								[/\[trace.*/, 'custom-trace'],
								[/\[verbose.*/, 'custom-verbose'],
								[
									/\b(function|local|end|if|then|else|elseif|while|do|for|in|repeat|until|return|break)\b/,
									'keyword'
								],
								[/\b(true|false|nil)\b/, 'keyword'],
								[/\b[A-Za-z_][A-Za-z0-9_]*\b/, 'identifier'],
								[/\b[0-9]+\b/, 'number'],
								[/"([^"\\]|\\.)*$/, 'string.invalid'],
								[/"([^"\\]|\\.)*"/, 'string']
							],
							string: [
								[/[^\\"]+/, 'string'],
								[/\\./, 'string.escape'],
								[/"/, 'string', '@pop']
							]
						}
					});

					// Register a completion item provider for the new language
					monaco.languages.registerCompletionItemProvider('luau', {
						provideCompletionItems: (
							model: monaco.editor.ITextModel,
							position: monaco.Position
						) => {
							const word = model.getWordUntilPosition(position);
							const range = {
								startLineNumber: position.lineNumber,
								startColumn: word.startColumn,
								endLineNumber: position.lineNumber,
								endColumn: word.endColumn
							};

							const suggestions = [
								{
									label: 'print',
									kind: monaco.languages.CompletionItemKind.Function,
									insertText: 'print(${1:value})',
									range: range
								},
								{
									label: 'if',
									kind: monaco.languages.CompletionItemKind.Keyword,
									insertText: 'if ${1:condition} then\n\t$0\nend',
									range: range
								},
								{
									label: 'for',
									kind: monaco.languages.CompletionItemKind.Keyword,
									insertText: 'for ${1:i} = ${2:start}, ${3:end} do\n\t$0\nend',
									range: range
								},
								{
									label: 'while',
									kind: monaco.languages.CompletionItemKind.Keyword,
									insertText: 'while ${1:condition} do\n\t$0\nend',
									range: range
								},
								{
									label: 'function',
									kind: monaco.languages.CompletionItemKind.Function,
									insertText: 'function ${1:name}(${2:args})\n\t$0\nend',
									range: range
								}
							];
							return { suggestions };
						}
					});
				} catch (error) {
					console.error('Error registering language support:', error);
				}
				return () => {
					isMounted = false;
				};
			});
		}
	}, []);

	// Update currentFiles when files prop changes
	useEffect(() => {
		setCurrentFiles(files);
	}, [files]);

	useEffect(() => {
		if (onContentChange) {
			onContentChange(combineContent(editedContent));
		}
	}, [currentFiles, editedContent, onContentChange]);

	// Setup drag and drop handlers
	useEffect(() => {
		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (dropZoneRef.current) {
				dropZoneRef.current.classList.add('bg-primary/10');
			}
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (dropZoneRef.current) {
				dropZoneRef.current.classList.remove('bg-primary/10');
			}
		};

		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (dropZoneRef.current) {
				dropZoneRef.current.classList.remove('bg-primary/10');
			}

			if (!e.dataTransfer || !isContentEditable) return;

			const files = e.dataTransfer.files;
			handleFiles(files);
		};

		const element = dropZoneRef.current;
		if (element) {
			element.addEventListener('dragover', handleDragOver);
			element.addEventListener('dragleave', handleDragLeave);
			element.addEventListener('drop', handleDrop);
		}

		return () => {
			if (element) {
				element.removeEventListener('dragover', handleDragOver);
				element.removeEventListener('dragleave', handleDragLeave);
				element.removeEventListener('drop', handleDrop);
			}
		};
	}, [isContentEditable]);

	// Update the handleFiles function to handle null case
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			handleFiles(files);
		}
		// Reset the file input
		if (event.target) {
			event.target.value = '';
		}
	};

	const handleFiles = (files: FileList | null) => {
		if (!files) return;

		Array.from(files).forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				const newFile = {
					name: file.name,
					path: file.name,
					content: content,
					type: 'file' as const
				};
				setCurrentFiles((prev) => {
					const newFiles = [...prev];
					const existingFileIndex = newFiles.findIndex((f) => f.path === file.name);
					if (existingFileIndex >= 0) {
						newFiles[existingFileIndex] = newFile;
					} else {
						newFiles.push(newFile);
					}
					return newFiles;
				});
				setEditedContent((prev) => ({ ...prev, [file.name]: content }));
				setActiveTab(file.name);
				setActiveTabs((prev) => {
					if (!prev.includes(file.name)) {
						return [...prev, file.name];
					}
					return prev;
				});
			};
			reader.readAsText(file);
		});
	};

	const handleContentChange = (path: string, content: string) => {
		setEditedContent((prev: Record<string, string>) => {
			const newContent = { ...prev, [path]: content };

			// Update the current files array to reflect changes
			setCurrentFiles((currentFiles) => {
				return currentFiles.map((file) => {
					if (file.path === path) {
						return { ...file, content };
					}
					return file;
				});
			});

			// Call the parent's onContentChange with the combined content
			if (onContentChange) {
				onContentChange(combineContent(newContent));
			}

			return newContent;
		});
	};

	const combineContent = (edits: Record<string, string>) => {
		const combined: Record<string, string> = {};

		currentFiles.forEach((file) => {
			combined[file.path] = edits[file.path] !== undefined ? edits[file.path] : file.content;
		});

		Object.entries(edits).forEach(([path, content]) => {
			if (!combined[path]) {
				combined[path] = content;
			}
		});

		return combined;
	};

	useEffect(() => {
		const fileMap: { [key: string]: { content: string; path: string } } = {};
		currentFiles.forEach((file) => {
			fileMap[file.name] = {
				content: file.content,
				path: file.path
			};
		});
		setFlattenedFiles(fileMap);
	}, [currentFiles]);

	useEffect(() => {
		const buildFileTree = (items: any[]): FileStructure[] => {
			const tree: FileStructure[] = [];

			items.forEach((item) => {
				if (item.type !== 'file' && item.type !== 'dir') return;

				const pathParts = item.path.split('/');
				let currentLevel = tree;

				pathParts.forEach((part: string, index: number) => {
					const existing = currentLevel.find((entry) => entry.name === part);

					if (existing) {
						if (existing.type === 'folder') {
							currentLevel = existing.children || [];
						}
					} else {
						const isFolder = item.type === 'dir' || index < pathParts.length - 1;
						const newEntry: FileStructure = {
							name: part,
							path: pathParts.slice(0, index + 1).join('/'),
							type: isFolder ? 'folder' : 'file',
							children: [],
							expanded: false
						};

						if (!isFolder) {
							newEntry.content = item.content || '';
						}

						currentLevel.push(newEntry);
						currentLevel = isFolder ? newEntry.children! : currentLevel;
					}
				});
			});

			return tree;
		};

		const fileTree = buildFileTree(currentFiles);
		setFileStructure(fileTree);

		const readmeFile = currentFiles.find(
			(f) =>
				f.name.toLowerCase() === 'readme.md' ||
				f.name === 'README.md' ||
				f.name.toLowerCase() === 'readme.markdown'
		);

		if (readmeFile) {
			setActiveTab(readmeFile.path);
			setActiveTabs([readmeFile.path]);
		} else if (currentFiles.length > 0) {
			setActiveTab(currentFiles[0].path);
			setActiveTabs([currentFiles[0].path]);
		}
	}, [currentFiles]);

	const copyToClipboard = (content: string) => {
		navigator.clipboard.writeText(content);
		if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
		setShowToast(true);
		toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);
	};

	const getLanguage = (fileName: string): string => {
		const extension = fileName.split('.').pop()?.toLowerCase();
		switch (extension) {
			case 'md':
				return 'markdown';
			case 'lua':
				return 'lua';
			case 'luau':
				return 'luau';
			case 'luaurc':
				return 'lua';
			case 'yml':
			case 'yaml':
				return 'yaml';
			case 'cmd':
				return 'batch';
			case 'sh':
				return 'bash';
			case 'makefile':
			case 'make':
				return 'makefile';
			case 'gitignore':
				return 'plaintext';
			case 'gitmodules':
				return 'plaintext';
			default:
				return 'plaintext';
		}
	};

	const FileIcon = ({ fileName }: { fileName: string }) => {
		if (fileName.startsWith('.')) {
			return <FiFile className="w-4 h-4 text-gray-400" />;
		}

		const ext = fileName.split('.').pop()?.toLowerCase();
		if (ext === 'lua' || ext === 'luau') {
			return <SiLua className="w-4 h-4 text-blue-400" />;
		}
		if (ext === 'md' || fileName.toLowerCase() === 'readme') {
			return <FiFile className="w-4 h-4 text-green-400" />;
		}
		if (ext === 'json' || ext === 'json5') {
			return <FiFile className="w-4 h-4 text-yellow-400" />;
		}
		if (fileName.toLowerCase() === 'license') {
			return <FiFile className="w-4 h-4 text-purple-400" />;
		}
		if (ext === 'cmd' || ext === 'sh' || fileName.toLowerCase() === 'makefile') {
			return <FiFile className="w-4 h-4 text-red-400" />;
		}

		return <FiFile className="w-4 h-4" />;
	};

	const closeTab = (tabName: string, event?: React.MouseEvent) => {
		if (event) {
			event.stopPropagation();
		}

		const newTabs = activeTabs.filter((t) => t !== tabName);
		setActiveTabs(newTabs);

		if (activeTab === tabName) {
			if (newTabs.length > 0) {
				setActiveTab(newTabs[newTabs.length - 1]);
			} else {
				setActiveTab('');
			}
		}
	};

	const openFile = (file: FileStructure) => {
		if (file.type === 'folder') return;

		if (!activeTabs.includes(file.path)) {
			setActiveTabs((prev) => [...prev, file.path]);
		}
		setActiveTab(file.path);
	};

	const getFileContent = (path: string) => {
		if (editedContent[path]) {
			return editedContent[path];
		}
		if (flattenedFiles[path]?.content) {
			return flattenedFiles[path].content;
		}

		const file = currentFiles.find((f) => f.path === path);
		return file ? file.content : '';
	};

	const TreeItem = ({ item, depth = 0 }: { item: FileStructure; depth?: number }) => {
		const [isExpanded, setIsExpanded] = useState(item.expanded || false);

		const toggleExpand = (e: React.MouseEvent) => {
			e.stopPropagation();
			setIsExpanded(!isExpanded);
		};

		const handleClick = () => {
			if (item.type === 'folder') {
				setIsExpanded(!isExpanded);
			} else {
				openFile(item);
			}
		};

		return (
			<div className="space-y-1">
				<button
					onClick={handleClick}
					className={`flex items-center gap-2 p-2 w-full hover:bg-muted/30 rounded-sm text-sm ${
						activeTab === item.path ? 'bg-muted/20 text-foreground' : 'text-muted-foreground'
					}`}
					style={{ paddingLeft: `${depth * 16 + 8}px` }}
				>
					{item.type === 'folder' ? (
						<>
							<button
								onClick={toggleExpand}
								className="hover:text-foreground"
								aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
							>
								{isExpanded ? (
									<FiFolder className="w-4 h-4 text-yellow-500" />
								) : (
									<FiFolder className="w-4 h-4 text-yellow-500" />
								)}
							</button>
							<span className="truncate">{item.name}</span>
						</>
					) : (
						<>
							<FileIcon fileName={item.name} />
							<span className="truncate">{item.name}</span>
						</>
					)}
				</button>

				{isExpanded && item.children && (
					<div className="space-y-1">
						{item.children.map((child) => (
							<TreeItem key={child.path} item={child} depth={depth + 1} />
						))}
					</div>
				)}
			</div>
		);
	};

	const addFile = (parentPath: string) => {
		const newFileName = prompt('Enter new file name:');
		if (newFileName) {
			const newFilePath = parentPath ? `${parentPath}/${newFileName}` : newFileName;
			const newFile: FileStructure = {
				name: newFileName,
				path: newFilePath,
				type: 'file',
				content: '',
				expanded: false
			};
			setFileStructure((prev) => {
				const updatedStructure = [...prev];
				const addFileToStructure = (structure: FileStructure[], path: string) => {
					for (const item of structure) {
						if (item.path === path && item.type === 'folder') {
							item.children = item.children || [];
							item.children.push(newFile);
							return;
						}
						if (item.children) {
							addFileToStructure(item.children, path);
						}
					}
				};
				addFileToStructure(updatedStructure, parentPath || '');
				return updatedStructure;
			});
			setFlattenedFiles((prev) => ({ ...prev, [newFilePath]: { content: '', path: newFilePath } }));

			// Add to currentFiles
			const newFileObj = {
				name: newFileName,
				path: newFilePath,
				content: '',
				type: 'file' as const
			};
			setCurrentFiles((prev) => [...prev, newFileObj]);

			// Add to editedContent to ensure it's saved
			setEditedContent((prev) => ({
				...prev,
				[newFilePath]: ''
			}));

			setActiveTab(newFilePath);
			setActiveTabs((prev) => [...prev, newFilePath]);
		}
	};

	const addFolder = (parentPath: string) => {
		const newFolderName = prompt('Enter new folder name:');
		if (newFolderName) {
			const newFolderPath = parentPath ? `${parentPath}/${newFolderName}` : newFolderName;
			const newFolder: FileStructure = {
				name: newFolderName,
				path: newFolderPath,
				type: 'folder',
				children: [],
				expanded: false
			};
			setFileStructure((prev) => {
				const updatedStructure = [...prev];
				const addFolderToStructure = (structure: FileStructure[], path: string) => {
					for (const item of structure) {
						if (item.path === path && item.type === 'folder') {
							item.children = item.children || [];
							item.children.push(newFolder);
							return;
						}
						if (item.children) {
							addFolderToStructure(item.children, path);
						}
					}
				};
				addFolderToStructure(updatedStructure, parentPath || '');
				return updatedStructure;
			});

			// Add to currentFiles
			const newFolderObj = {
				name: newFolderName,
				path: newFolderPath,
				content: '',
				type: 'dir' as const
			};
			setCurrentFiles((prev) => [...prev, newFolderObj]);
		}
	};

	const importFromGitHub = async () => {
		const repoUrl = prompt('Enter GitHub repository URL:');
		if (repoUrl) {
			try {
				const response = await fetch(`https://api.github.com/repos/${repoUrl}/contents`);
				const data = await response.json();
				const newFiles = data.map((file: any) => ({
					name: file.name,
					path: file.path,
					content: atob(file.content),
					type: file.type === 'file' ? 'file' : 'dir'
				}));
				setCurrentFiles((prev) => [...prev, ...newFiles]);
			} catch (error) {
				console.error('Error importing from GitHub:', error);
			}
		}
	};

	const triggerFileUpload = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="container mx-auto px-4 py-8" style={{ height, width }} ref={dropZoneRef}>
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

			{isContentEditable && (
				<div className="mb-4 p-3 border-2 border-dashed border-primary/30 rounded-lg text-center">
					<p className="text-muted-foreground mb-2">Drag and drop files here or</p>
					<button
						onClick={triggerFileUpload}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						Browse Files
					</button>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileUpload}
						className="hidden"
						multiple
					/>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="relative w-full"
				>
					<div className="relative flex">
						<AnimatePresence>
							{isSidebarOpen && (
								<motion.div
									initial={{ x: -250, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -250, opacity: 0 }}
									transition={{ type: 'spring', stiffness: 300, damping: 30 }}
									className="absolute top-0 left-0 z-10 h-full w-64 bg-card border-r border-border shadow-lg"
								>
									<div className="p-4 h-full overflow-y-auto">
										<div className="flex items-center justify-between mb-4">
											<h3 className="font-semibold">Explorer</h3>
											<button
												onClick={() => setIsSidebarOpen(false)}
												className="text-muted-foreground hover:text-foreground"
											>
												<FiX className="h-4 w-4" />
											</button>
										</div>

										{isContentEditable && (
											<div className="mb-4 flex items-center gap-2">
												<Tooltip text="New File">
													<button
														onClick={() => addFile('')}
														className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
														aria-label="New File"
													>
														<FiFilePlus className="w-4 h-4" />
													</button>
												</Tooltip>
												<Tooltip text="New Folder">
													<button
														onClick={() => addFolder('')}
														className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
														aria-label="New Folder"
													>
														<FiFolderPlus className="w-4 h-4" />
													</button>
												</Tooltip>
												<Tooltip text="Upload Files">
													<button
														onClick={triggerFileUpload}
														className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
														aria-label="Upload Files"
													>
														<FiUpload className="w-4 h-4" />
													</button>
												</Tooltip>
												<input
													type="file"
													ref={fileInputRef}
													onChange={handleFileUpload}
													className="hidden"
													multiple
												/>
												<Tooltip text="Import from GitHub">
													<button
														onClick={importFromGitHub}
														className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
														aria-label="Import from GitHub"
													>
														<FiGithub className="w-4 h-4" />
													</button>
												</Tooltip>
											</div>
										)}

										<div className="space-y-1">
											{fileStructure.map((item) => (
												<TreeItem key={item.path} item={item} />
											))}
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="flex-1 bg-card rounded-xl shadow-lg border border-border overflow-hidden">
							<div className="p-2 bg-muted/30 border-b border-border flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Tooltip text={isSidebarOpen ? 'Hide Explorer' : 'Show Explorer'}>
										<button
											onClick={() => setIsSidebarOpen(!isSidebarOpen)}
											className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
											aria-label={isSidebarOpen ? 'Hide Explorer' : 'Show Explorer'}
										>
											<FiMenu className="h-4 w-4" />
										</button>
									</Tooltip>
									<div className="flex items-center gap-1.5">
										<FiCode className="text-primary h-4 w-4" />
										<span className="font-medium text-sm">EDITOR</span>
									</div>
								</div>
								<div className="flex items-center gap-1">
									{isContentEditable && (
										<>
											<Tooltip text="New File">
												<button
													onClick={() => addFile('')}
													className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
													aria-label="New File"
												>
													<FiFilePlus className="w-4 h-4" />
												</button>
											</Tooltip>
											<Tooltip text="Upload Files">
												<button
													onClick={triggerFileUpload}
													className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
													aria-label="Upload Files"
												>
													<FiUpload className="w-4 h-4" />
												</button>
											</Tooltip>
										</>
									)}
									<Tooltip text="View on GitHub">
										<button
											className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
											onClick={() =>
												window.open(`https://github.com/Anti-Raid/auto-slowdown`, '_blank')
											}
											aria-label="View on GitHub"
										>
											<FiGithub className="w-4 h-4" />
										</button>
									</Tooltip>
								</div>
							</div>

							{activeTabs.length > 0 && (
								<div className="overflow-x-auto">
									<div className="flex bg-muted/30 border-b border-border">
										{activeTabs.map((tabPath) => (
											<div key={tabPath} className="flex items-center">
												<button
													onClick={() => setActiveTab(tabPath)}
													className={`px-3 py-1.5 text-xs font-medium border-r border-border flex items-center gap-1.5 ${
														activeTab === tabPath
															? 'bg-background text-foreground'
															: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
													}`}
												>
													<FileIcon fileName={tabPath.split('/').pop() || ''} />
													{tabPath.split('/').pop()}
												</button>
												<button
													onClick={(e) => closeTab(tabPath, e)}
													className="px-1 hover:text-foreground text-muted-foreground"
													aria-label={`Close ${tabPath} tab`}
												>
													<FiX className="h-3 w-3" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{activeTab ? (
								<div className="relative">
									<div className="absolute top-2 right-2 z-10 flex items-center gap-1">
										<Tooltip text="Copy Code">
											<button
												onClick={() => copyToClipboard(getFileContent(activeTab))}
												className="h-7 w-7 p-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
												aria-label="Copy code"
											>
												<FiCopy className="h-3.5 w-3.5" />
											</button>
										</Tooltip>
										<Tooltip text="Settings">
											<button
												className="h-7 w-7 p-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
												aria-label="Editor settings"
											>
												<FiSettings className="h-3.5 w-3.5" />
											</button>
										</Tooltip>
									</div>
									<div className="h-[600px] w-full">
										{isContentEditable ? (
											<Editor
												height="600px"
												language={getLanguage(activeTab)}
												value={getFileContent(activeTab)}
												onChange={(value: string | undefined) =>
													handleContentChange(activeTab, value || '')
												}
												theme="vs-dark"
												options={{
													minimap: { enabled: false },
													fontSize: 14,
													automaticLayout: true,
													wordWrap: 'on',
													scrollBeyondLastLine: false,
													smoothScrolling: true,
													cursorBlinking: 'smooth',
													cursorSmoothCaretAnimation: 'on',
													formatOnPaste: true,
													formatOnType: true,
													suggestOnTriggerCharacters: true,
													acceptSuggestionOnEnter: 'on',
													tabCompletion: 'on',
													dragAndDrop: true,
													links: true,
													bracketPairColorization: {
														enabled: true
													},
													autoIndent: 'full'
												}}
											/>
										) : (
											<SyntaxHighlighter
												language={getLanguage(activeTab)}
												style={vscDarkPlus}
												customStyle={{
													margin: 0,
													borderRadius: 0,
													fontSize: '0.875rem',
													width: '100%',
													height: '100%'
												}}
												showLineNumbers={true}
												wrapLines={true}
												wrapLongLines={false}
											>
												{getFileContent(activeTab)}
											</SyntaxHighlighter>
										)}
									</div>
								</div>
							) : (
								<div className="p-20 flex flex-col items-center justify-center text-center text-muted-foreground">
									<FiFile className="h-12 w-12 mb-4 opacity-50" />
									<h3 className="text-lg font-semibold mb-2">No file open</h3>
									<p>Open a code file from the file explorer to view its contents</p>
									<button
										onClick={() => setIsSidebarOpen(true)}
										className="mt-4 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors inline-flex items-center gap-2"
									>
										<FiFolder className="h-4 w-4" />
										Open explorer
									</button>
								</div>
							)}
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
