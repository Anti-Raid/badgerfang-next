import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import {
    FiArrowLeft,
    FiCode,
    FiCopy,
    FiGithub,
    FiX,
    FiMenu,
    FiFolder,
    FiFile,
    FiPlus
} from 'react-icons/fi';
import { SiLua } from 'react-icons/si';
import Link from 'next/link';

interface FileStructure {
    name: string;
    path: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileStructure[];
    expanded?: boolean;
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
}

export function ScriptIDE({ files = [], isContentEditable = false, height = 'auto', width = '100%' }: ScriptIDEProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [fileStructure, setFileStructure] = useState<FileStructure[]>([]);
    const [flattenedFiles, setFlattenedFiles] = useState<{ [key: string]: { content: string, path: string } }>({});
    const [editedContent, setEditedContent] = useState<{ [key: string]: string }>({});
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fileMap: { [key: string]: { content: string, path: string } } = {};
        files.forEach(file => {
            fileMap[file.name] = {
                content: file.content,
                path: file.path
            };
        });
        setFlattenedFiles(fileMap);
    }, [files]);

    useEffect(() => {
        const buildFileTree = (items: any[]): FileStructure[] => {
            const tree: FileStructure[] = [];

            items.forEach((item) => {
                if (item.type !== 'file' && item.type !== 'dir') return;

                const pathParts = item.path.split('/');
                let currentLevel = tree;

                pathParts.forEach((part: string, index: number) => {
                    const existing = currentLevel.find(
                        (entry) => entry.name === part
                    );

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

        const fileTree = buildFileTree(files);
        setFileStructure(fileTree);

        const readmeFile = files.find(f =>
            f.name.toLowerCase() === 'readme.md' ||
            f.name === 'README.md' ||
            f.name.toLowerCase() === 'readme.markdown'
        );

        if (readmeFile) {
            setActiveTab(readmeFile.path);
            setActiveTabs([readmeFile.path]);
        } else if (files.length > 0) {
            setActiveTab(files[0].path);
            setActiveTabs([files[0].path]);
        }
    }, [files]);

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setShowToast(true);
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);
    };

    const getLanguage = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'md': return 'markdown';
            case 'lua': return 'lua';
            case 'luau': return 'lua';
            case 'luaurc': return 'lua';
            case 'yml':
            case 'yaml': return 'yaml';
            case 'cmd': return 'batch';
            case 'sh': return 'bash';
            case 'makefile':
            case 'make': return 'makefile';
            case 'gitignore': return 'plaintext';
            case 'gitmodules': return 'plaintext';
            default: return 'plaintext';
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

        const newTabs = activeTabs.filter(t => t !== tabName);
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
            setActiveTabs(prev => [...prev, file.path]);
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

        const file = files.find(f => f.path === path);
        return file ? file.content : '';
    };

    const handleContentChange = (path: string, content: string) => {
        setEditedContent(prev => ({ ...prev, [path]: content }));
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
                                aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
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
                            <TreeItem
                                key={child.path}
                                item={child}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const addFile = (parentPath: string) => {
        const newFileName = prompt("Enter new file name:");
        if (newFileName) {
            const newFilePath = parentPath ? `${parentPath}/${newFileName}` : newFileName;
            const newFile: FileStructure = {
                name: newFileName,
                path: newFilePath,
                type: 'file',
                content: '',
                expanded: false
            };
            setFileStructure(prev => {
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
            setFlattenedFiles(prev => ({ ...prev, [newFilePath]: { content: '', path: newFilePath } }));
            setActiveTab(newFilePath);
            setActiveTabs(prev => [...prev, newFilePath]);
        }
    };

    const addFolder = (parentPath: string) => {
        const newFolderName = prompt("Enter new folder name:");
        if (newFolderName) {
            const newFolderPath = parentPath ? `${parentPath}/${newFolderName}` : newFolderName;
            const newFolder: FileStructure = {
                name: newFolderName,
                path: newFolderPath,
                type: 'folder',
                children: [],
                expanded: false
            };
            setFileStructure(prev => {
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
        }
    };

    return (
        <div className="container mx-auto px-4 py-8" style={{ height, width }}>
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
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="absolute top-0 left-0 z-10 h-full w-64 bg-card border-r border-border shadow-lg"
                                >
                                    <div className="p-4 h-full overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold">Files</h3>
                                            <button
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <FiX className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {isContentEditable && (
                                            <div className="mb-4 flex gap-2">
                                                <button
                                                    onClick={() => addFile('')}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                                                >
                                                    <FiFile className="w-4 h-4" />
                                                    New File
                                                </button>
                                                <button
                                                    onClick={() => addFolder('')}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                                                >
                                                    <FiFolder className="w-4 h-4" />
                                                    New Folder
                                                </button>
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
                            <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label={isSidebarOpen ? "Close file explorer" : "Open file explorer"}
                                    >
                                        <FiMenu className="h-5 w-5" />
                                    </button>
                                    <FiCode className="text-primary" />
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

                            {activeTabs.length > 0 && (
                                <div className="overflow-x-auto">
                                    <div className="flex bg-muted/30 border-b border-border">
                                        {activeTabs.map((tabPath) => (
                                            <div
                                                key={tabPath}
                                                className="flex items-center"
                                            >
                                                <button
                                                    onClick={() => setActiveTab(tabPath)}
                                                    className={`px-4 py-2 text-sm font-medium border-r border-border flex items-center gap-2 ${
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
                                                    className="px-2 hover:text-foreground text-muted-foreground"
                                                    aria-label={`Close ${tabPath} tab`}
                                                >
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab ? (
                                <div className="relative">
                                    <div className="absolute top-2 right-2 z-10">
                                        <button
                                            onClick={() => copyToClipboard(getFileContent(activeTab))}
                                            className="h-8 w-8 p-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
                                            aria-label="Copy code"
                                        >
                                            <FiCopy className="h-4 w-4" />
                                            <span className="sr-only">Copy code</span>
                                        </button>
                                    </div>
                                    <div className="h-[600px] w-full">
  {isContentEditable ? (
    <textarea
      className="w-full h-full p-4 text-foreground outline-none resize-none"
      value={getFileContent(activeTab)}
      onChange={(e) => handleContentChange(activeTab, e.target.value)}
      style={{ minHeight: '500px' }}
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
        height: '100%',
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
                                        className="mt-4 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors inline-flex items-center"
                                    >
                                        <FiFolder className="mr-2" />
                                        Open file explorer
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
