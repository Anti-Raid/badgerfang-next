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

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		if (isOpen) {
			window.addEventListener('keydown', handleEsc);
			document.body.style.overflow = 'hidden';
		}
		return () => {
			window.removeEventListener('keydown', handleEsc);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

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
					role="dialog"
					aria-modal="true"
					aria-labelledby="modal-title"
				>
					<motion.div
						className="bg-background rounded-xl border border-border w-11/12 max-w-5xl max-h-[90vh] flex flex-col"
						initial={{ scale: 0.95, y: 10 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.95, y: 10 }}
						transition={{ duration: 0.2 }}
						tabIndex={-1}
						autoFocus
					>
						<div className="flex justify-between items-center p-5 border-b border-border">
							<h3 id="modal-title" className="text-lg font-medium text-foreground">
								{modalTitle}
							</h3>
							<button
								onClick={onClose}
								className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
								aria-label="Close modal"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<div className="overflow-auto p-5 flex-grow">
							<ScriptIDE
								files={contentToFiles(localContent)}
								isContentEditable={isEditMode}
								onContentChange={handleContentChange}
								height="500px"
								width="100%"
							/>
						</div>
						{isEditMode && (
							<div className="p-5 border-t border-border flex justify-end">
								<Primary Title="Save Changes" onClick={handleSave} />
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
