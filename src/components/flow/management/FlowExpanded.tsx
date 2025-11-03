import { NodeProps } from '@/lib/flow/data';
import { Ghost } from '../../ui/Buttons';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface FlowExpandedProps {
	nodeProps: NodeProps;
	children: React.ReactNode;
	title?: string; // Optional title for the modal
	onDone?: () => void;
}

export const FlowExpanded: React.FC<FlowExpandedProps> = ({
	nodeProps,
	children,
	title,
	onDone
}) => {
	const [isExpanded, setExpanded] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isExpanded) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isExpanded]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isExpanded) {
				setExpanded(false);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isExpanded]);

	const backdropVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
		},
		exit: {
			opacity: 0,
			transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
		}
	};

	const modalVariants: Variants = {
		hidden: {
			y: -60,
			opacity: 0,
			scale: 0.9,
			rotateX: -15
		},
		visible: {
			y: 0,
			opacity: 1,
			scale: 1,
			rotateX: 0,
			transition: {
				type: 'spring' as const,
				stiffness: 400,
				damping: 30,
				mass: 0.8
			}
		},
		exit: {
			y: 60,
			opacity: 0,
			scale: 0.9,
			rotateX: 15,
			transition: {
				duration: 0.25,
				ease: [0.4, 0, 0.2, 1]
			}
		}
	};

	const headerVariants: Variants = {
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: { delay: 0.1, duration: 0.3 }
		}
	};

	const contentVariants: Variants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { delay: 0.15, duration: 0.3 }
		}
	};

	const modal = (
		<AnimatePresence mode="wait">
			{isExpanded && (
				<motion.div
					key="modal-backdrop"
					variants={backdropVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					onClick={() => setExpanded(false)}
					tabIndex={-1}
					role="dialog"
					aria-modal={true}
					aria-labelledby="modal-title"
					className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
				>
					<motion.div
						key="modal-content"
						variants={modalVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						onClick={(e) => e.stopPropagation()}
						style={{ perspective: '1000px' }}
						className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden" // Make max-w customizable per node
					>
						{/* Decorative background elements */}
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-extra/5 rounded-2xl" />
						<div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
						<div className="absolute -bottom-24 -left-24 w-48 h-48 bg-extra/10 rounded-full blur-3xl" />

						{/* Main modal container */}
						<div className="relative bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
							{/* Shimmer effect */}
							<div
								className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-shimmer"
								style={{ animation: 'shimmer 3s infinite' }}
							/>

							{/* Header */}
							<motion.div
								variants={headerVariants}
								className="relative px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent"
							>
								<div className="flex items-center justify-between">
									<h2
										id="modal-title"
										className="text-2xl font-bold font-cabin bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
									>
										{title || `${nodeProps.data.type} Configuration`}
									</h2>
									<button
										onClick={() => setExpanded(false)}
										aria-label="Close modal"
										className="group p-2 rounded-lg hover:bg-destructive/10 transition-all duration-200 active:scale-90"
									>
										<svg
											className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								{/* Subtitle */}
								<p className="mt-1 text-sm text-muted-foreground font-inter">
									Configure your node settings and properties
								</p>
							</motion.div>

							{/* Content */}
							<motion.div
								variants={contentVariants}
								className="relative px-6 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar"
							>
								<div className="prose prose-sm max-w-none dark:prose-invert">{children}</div>
							</motion.div>

							{/* Footer */}
							<motion.div
								variants={contentVariants}
								className="relative px-6 py-4 border-t border-border/50 bg-muted/30 backdrop-blur-sm"
							>
								<div className="flex justify-end gap-3">
									<button
										onClick={() => {
											if (onDone) {
												onDone();
											}
											setExpanded(false);
										}}
										className="px-5 py-2.5 rounded-lg font-medium font-inter text-sm
                             bg-primary text-primary-foreground
                             hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20
                             active:scale-95 transition-all duration-200
                             focus:outline-none focus:ring-2 focus:ring-primary/50"
									>
										{onDone ? 'Save' : 'Done'}
									</button>
								</div>
							</motion.div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	if (!mounted) return null;

	return (
		<>
			{createPortal(modal, document.body)}

			<div className="flex justify-center mt-3">
				<button
					onClick={() => setExpanded(!isExpanded)}
					className={`
            group relative px-6 py-2.5 rounded-lg font-medium font-inter text-sm
            transition-all duration-300 overflow-hidden
            ${
							isExpanded
								? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
								: 'bg-card border border-border text-foreground hover:border-primary hover:shadow-md'
						}
            hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-primary/50
          `}
				>
					{/* Animated background gradient */}
					<span
						className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					/>

					{/* Button content */}
					<span className="relative flex items-center gap-2">
						<svg
							className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
						{isExpanded ? 'Collapse' : 'Expand Details'}
					</span>
				</button>
			</div>
		</>
	);
};
