'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ScriptIDE } from '@/components/ide/ide';
import { Primary } from '@/components/ui/Buttons';

interface ScriptModalProps {
	isOpen: boolean;
	onClose: () => void;
	content: Record<string, string>;
	scriptName: string;
	isEditMode?: boolean;
	onContentChange?: (content: Record<string, string>) => void;
	onSave?: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
	isOpen,
	onClose,
	content,
	scriptName,
	isEditMode = false,
	onContentChange,
	onSave
}) => {
	const [localContent, setLocalContent] = useState<Record<string, string>>(content);

	// Update local content when the content prop changes
	useEffect(() => {
		setLocalContent(content);
	}, [content]);

	if (!isOpen) return null;

	// Convert content object to files array for ScriptIDE
	const contentToFiles = (content: Record<string, string>) => {
		return Object.entries(content).map(([name, content]) => ({
			name,
			path: name,
			content,
			type: 'file' as const
		}));
	};

	const handleContentChange = (newContent: Record<string, string>) => {
		setLocalContent(newContent);
		if (onContentChange) {
			onContentChange(newContent);
		}
	};

	const handleSave = () => {
		if (onSave) {
			onSave();
		} else {
			onClose();
		}
	};

	const modalTitle = isEditMode
		? scriptName === 'New Script'
			? 'Add Script Content'
			: `Edit Script: ${scriptName}`
		: `View Script: ${scriptName}`;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="bg-background rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col"
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
					>
						<div className="flex justify-between items-center p-4 border-b border-border">
							<h3 className="text-lg font-semibold">{modalTitle}</h3>
							<motion.button
								onClick={onClose}
								className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent/50 transition-colors"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								<X className="h-5 w-5" />
							</motion.button>
						</div>
						<div className="overflow-auto p-4 flex-grow">
							<ScriptIDE
								files={contentToFiles(localContent)}
								isContentEditable={isEditMode}
								onContentChange={handleContentChange}
								height="500px"
								width="100%"
							/>
						</div>
						{isEditMode && (
							<div className="p-4 border-t border-border flex justify-end">
								<Primary Title="Save Changes" onClick={handleSave} />
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
