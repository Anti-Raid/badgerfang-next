'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';

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
			initial={{ opacity: 0, y: 10 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.4 }}
		>
			<div className="bg-card border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
				{/* Header Section */}
				<button
					className="w-full text-left p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white focus:bg-accent/5 transition-colors group/header"
					onClick={() => setIsOpen(!isOpen)}
					aria-expanded={isOpen}
					aria-controls={contentId}
				>
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary transition-colors duration-300 group-hover/section:bg-primary/10 group-header:border-primary/30">
								{React.isValidElement(icon) &&
									React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
										size: 20
									})}
							</div>
							<div>
								<h2 className="text-lg font-bold tracking-tight text-foreground transition-colors group-header:text-primary">
									{title}
								</h2>
								{description && (
									<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
								)}
							</div>
						</div>

						<div
							className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
								${
									isOpen
										? 'bg-primary text-primary-foreground'
										: 'bg-accent/50 text-foreground/70 group-hover/header:bg-accent group-hover/header:text-foreground'
								}
							`}
						>
							<motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
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
							transition={{ duration: 0.3 }}
							id={contentId}
						>
							<div className="border-t border-border/50 p-6 bg-accent/10">
								<motion.div
									initial={{ y: 5, opacity: 0 }}
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
