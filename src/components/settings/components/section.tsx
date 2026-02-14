'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SectionProps {
	title: string;
	description?: string;
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
	const contentId = React.useId();

	return (
		<motion.div
			className="group/section"
			initial={{ opacity: 0, y: 8 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const }}
		>
			<div className="bg-card border border-border rounded-xl overflow-hidden transition-colors hover:border-primary/20">
				{/* Header Section */}
				<button
					className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary transition-colors"
					onClick={() => setIsOpen(!isOpen)}
					aria-expanded={isOpen}
					aria-controls={contentId}
				>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
								{React.isValidElement(icon) &&
									React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
										size: 18
									})}
							</div>
							<div>
								<h2 className="text-base font-medium text-foreground">
									{title}
								</h2>
								{description && (
									<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
								)}
							</div>
						</div>

						<div
							className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								isOpen
									? 'bg-foreground text-background'
									: 'bg-secondary text-muted-foreground hover:text-foreground'
							}`}
						>
							<motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
								<ChevronDown size={16} />
							</motion.div>
							<span>{isOpen ? 'Close' : 'Configure'}</span>
						</div>
					</div>
				</button>

				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.25 }}
							id={contentId}
						>
							<div className="border-t border-border p-5 bg-secondary/30">
								<motion.div
									initial={{ y: 4, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ duration: 0.2 }}
								>
									{children}
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};
