'use client';

import React, { useState } from 'react';
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
		<div className="group/section animate-in fade-in-0 slide-in-from-bottom-2 duration-400">
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
								<h2 className="text-base font-medium text-foreground">{title}</h2>
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
							<ChevronDown
								size={16}
								className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
							/>
							<span>{isOpen ? 'Close' : 'Configure'}</span>
						</div>
					</div>
				</button>

				{/* Accordion content using grid trick */}
				<div
					id={contentId}
					className={`grid transition-all duration-250 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
				>
					<div className="overflow-hidden">
						<div className="border-t border-border p-5 bg-secondary/30">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
};
