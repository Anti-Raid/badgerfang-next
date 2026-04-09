'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
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
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div
				className="bg-background rounded-xl border border-border w-11/12 max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
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
			</div>
		</div>
	);
};
