'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface SettingsErrorDisplayProps {
	loadErrors: { [templateName: string]: string };
	onRetry?: () => void;
}

export const SettingsErrorDisplay: React.FC<SettingsErrorDisplayProps> = ({
	loadErrors,
	onRetry
}) => {
	if (!loadErrors || Object.keys(loadErrors).length === 0) {
		return null;
	}

	return (
		<motion.div
			className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 mb-4"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const }}
			role="alert"
			aria-live="assertive"
		>
			<AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
			<div className="text-destructive text-sm flex-1">
				{Object.entries(loadErrors).map(([templateName, error]) => (
					<div key={templateName}>
						<span className="font-medium">Error in {templateName}:</span>
						<code className="block mt-1 text-xs whitespace-pre-wrap text-destructive/80">
							{error}
						</code>
					</div>
				))}
			</div>
			{onRetry && (
				<button
					onClick={onRetry}
					className="shrink-0 bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
					aria-label="Retry loading settings"
				>
					Retry
				</button>
			)}
		</motion.div>
	);
};
