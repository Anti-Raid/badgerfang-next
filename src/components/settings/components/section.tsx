'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
		<div className="group/section animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
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
							<ChevronDown
								size={16}
								className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
							/>
							<span>{isOpen ? 'Close' : 'Configure'}</span>
						</div>
					</div>
				</button>

				<div
					className={cn(
						'grid transition-[grid-template-rows] duration-300 ease-out',
						isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
					)}
				>
					<div className="min-h-0 overflow-hidden">
						{isOpen ? (
							<div id={contentId} className="border-t border-border/50 p-6 bg-accent/10">
								<div className="animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};
