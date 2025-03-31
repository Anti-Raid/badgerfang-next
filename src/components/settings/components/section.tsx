'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SectionProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	children?: React.ReactNode;
	defaultOpen?: boolean;
}

export const Section: React.FC<SectionProps> = ({
	title,
	description,
	icon,
	children,
	defaultOpen = false
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="mb-6">
			<div className="mb-1">
				<h2 className="text-xl font-semibold text-foreground">{title}</h2>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>

			<div className="bg-accent rounded-lg border border-primary border-opacity-10 overflow-hidden">
				<div className="p-4 flex items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
					<motion.div
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={{ duration: 0.3 }}
						className="mr-2"
					>
						<ChevronDown className="w-5 h-5 text-foreground" />
					</motion.div>
					{icon}
					<span className="ml-2 text-foreground font-medium">+ New {title}</span>
				</div>

				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="border-t border-primary border-opacity-10 p-4">{children}</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
