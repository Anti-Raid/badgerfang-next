'use client';

import React, { useEffect, useState, useRef, ReactNode, useCallback, useMemo } from 'react';

interface MotionProps {
	children?: ReactNode;
	initial?: { opacity?: number; y?: number; x?: number; scale?: number; rotate?: number };
	animate?: { opacity?: number; y?: number; x?: number; scale?: number; rotate?: number };
	exit?: { opacity?: number; y?: number; x?: number; scale?: number; rotate?: number };
	transition?: {
		duration?: number;
		delay?: number;
		ease?: string | number[];
		type?: 'tween' | 'spring' | 'inertia';
		stiffness?: number;
		damping?: number;
		mass?: number;
		repeat?: number | 'Infinity';
		repeatType?: 'loop' | 'reverse' | 'mirror';
		repeatDelay?: number;
	};
	whileHover?: { scale?: number; y?: number; rotate?: number; opacity?: number };
	whileTap?: { scale?: number; rotate?: number };
	layout?: boolean;
	layoutId?: string;
	className?: string;
	style?: React.CSSProperties;
	onAnimationComplete?: () => void;
}

// Spring physics simulation for smooth animations
const springPhysics = (
	current: number,
	target: number,
	velocity: number,
	stiffness: number = 100,
	damping: number = 10,
	mass: number = 1
): { value: number; velocity: number } => {
	const springForce = (target - current) * stiffness;
	const dampingForce = -velocity * damping;
	const acceleration = (springForce + dampingForce) / mass;
	const newVelocity = velocity + acceleration * 0.016; // ~60fps
	const newValue = current + newVelocity * 0.016;

	return { value: newValue, velocity: newVelocity };
};

// Easing functions
const easingFunctions: Record<string, (t: number) => number> = {
	linear: (t) => t,
	easeIn: (t) => t * t,
	easeOut: (t) => t * (2 - t),
	easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
	easeInCubic: (t) => t * t * t,
	easeOutCubic: (t) => --t * t * t + 1,
	easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
};

const createMotionComponent = <T extends keyof JSX.IntrinsicElements>(
	element: T
): React.ForwardRefExoticComponent<
	MotionProps & Omit<React.ComponentPropsWithoutRef<T>, 'children'> & React.RefAttributes<HTMLElement>
> => {
	type Props = MotionProps & Omit<React.ComponentPropsWithoutRef<T>, 'children'>;
	
	return React.forwardRef<HTMLElement, Props>(
		(props, ref) => {
			const {
				children,
				initial,
				animate,
				exit,
				transition = { duration: 0.3 },
				whileHover,
				whileTap,
				layout,
				layoutId,
				className,
				style,
				onAnimationComplete,
				...restProps
			} = props as Props & { children?: ReactNode };
			const [isVisible, setIsVisible] = useState(false);
			const [isExiting, setIsExiting] = useState(false);
			const [hoverState, setHoverState] = useState(false);
			const [tapState, setTapState] = useState(false);
			const elementRef = useRef<HTMLElement>(null);
			const rafRef = useRef<number | null>(null);
			const timeoutRef = useRef<NodeJS.Timeout | null>(null);
			const animationStateRef = useRef({
				opacity: { current: 1, target: 1, velocity: 0 },
				x: { current: 0, target: 0, velocity: 0 },
				y: { current: 0, target: 0, velocity: 0 },
				scale: { current: 1, target: 1, velocity: 0 },
				rotate: { current: 0, target: 0, velocity: 0 }
			});

			// Use CSS animations for infinite rotations (GPU accelerated)
			const hasInfiniteRotation = useMemo(() => {
				return (
					transition.repeat === 'Infinity' &&
					animate?.rotate !== undefined &&
					transition.ease === 'linear'
				);
			}, [transition.repeat, animate?.rotate, transition.ease]);

			// Generate CSS keyframes for infinite rotation
			const rotationKeyframes = useMemo(() => {
				if (!hasInfiniteRotation || !animate?.rotate) return null;
				const rotation = animate.rotate;
				const duration = transition.duration || 2;
				return `@keyframes infinite-rotate-${Math.abs(rotation)} {
					from { transform: rotate(0deg); }
					to { transform: rotate(${rotation}deg); }
				}`;
			}, [hasInfiniteRotation, animate?.rotate, transition.duration]);

			// Inject keyframes into document if needed
			useEffect(() => {
				if (rotationKeyframes && typeof document !== 'undefined') {
					const styleId = `motion-rotation-${Math.abs(animate?.rotate || 0)}`;
					if (!document.getElementById(styleId)) {
						const style = document.createElement('style');
						style.id = styleId;
						style.textContent = rotationKeyframes;
						document.head.appendChild(style);
					}
				}
			}, [rotationKeyframes, animate?.rotate]);

			// Initialize animation state
			useEffect(() => {
				if (initial) {
					animationStateRef.current = {
						opacity: { current: initial.opacity ?? 1, target: initial.opacity ?? 1, velocity: 0 },
						x: { current: initial.x ?? 0, target: initial.x ?? 0, velocity: 0 },
						y: { current: initial.y ?? 0, target: initial.y ?? 0, velocity: 0 },
						scale: { current: initial.scale ?? 1, target: initial.scale ?? 1, velocity: 0 },
						rotate: { current: initial.rotate ?? 0, target: initial.rotate ?? 0, velocity: 0 }
					};
				}
				setIsVisible(true);
				return () => {
					if (timeoutRef.current) clearTimeout(timeoutRef.current);
					if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
				};
			}, []);

			// Spring physics animation loop
			useEffect(() => {
				if (hasInfiniteRotation) return; // Skip for CSS animations

				const isSpring = transition.type === 'spring' || transition.stiffness || transition.damping;
				if (!isSpring && transition.type !== 'spring') return; // Only use RAF for spring animations

				const stiffness = transition.stiffness || 100;
				const damping = transition.damping || 10;
				const mass = transition.mass || 1;

				const animate = () => {
					const state = animationStateRef.current;
					let hasChanges = false;

					// Update each property with spring physics
					['opacity', 'x', 'y', 'scale', 'rotate'].forEach((prop) => {
						const key = prop as keyof typeof state;
						const current = state[key].current;
						const target = state[key].target;
						const velocity = state[key].velocity;

						if (Math.abs(current - target) > 0.001 || Math.abs(velocity) > 0.001) {
							const result = springPhysics(current, target, velocity, stiffness, damping, mass);
							state[key].current = result.value;
							state[key].velocity = result.velocity;
							hasChanges = true;
						}
					});

					if (hasChanges && elementRef.current) {
						const el = elementRef.current as HTMLElement;
						const state = animationStateRef.current;
						el.style.setProperty('--motion-opacity', String(state.opacity.current));
						el.style.setProperty('--motion-x', `${state.x.current}px`);
						el.style.setProperty('--motion-y', `${state.y.current}px`);
						el.style.setProperty('--motion-scale', String(state.scale.current));
						el.style.setProperty('--motion-rotate', `${state.rotate.current}deg`);
					}

					if (hasChanges) {
						rafRef.current = requestAnimationFrame(animate);
					}
				};

				rafRef.current = requestAnimationFrame(animate);
				return () => {
					if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
				};
			}, [hasInfiniteRotation, transition.type, transition.stiffness, transition.damping, transition.mass]);

			// Update animation targets
			useEffect(() => {
				if (animate && !hasInfiniteRotation) {
					if (animate.opacity !== undefined)
						animationStateRef.current.opacity.target = animate.opacity;
					if (animate.x !== undefined) animationStateRef.current.x.target = animate.x;
					if (animate.y !== undefined) animationStateRef.current.y.target = animate.y;
					if (animate.scale !== undefined) animationStateRef.current.scale.target = animate.scale;
					if (animate.rotate !== undefined) animationStateRef.current.rotate.target = animate.rotate;
				}
			}, [animate, hasInfiniteRotation]);

			// Handle exit animation
			useEffect(() => {
				if (exit && isExiting) {
					const duration = transition.duration || 0.3;
					timeoutRef.current = setTimeout(() => {
						onAnimationComplete?.();
					}, duration * 1000);
				}
			}, [isExiting, exit, transition.duration, onAnimationComplete]);

			// Optimized style calculation with CSS custom properties
			const getStyles = useCallback((): React.CSSProperties => {
				const baseStyle: React.CSSProperties = {
					willChange: 'transform, opacity',
					backfaceVisibility: 'hidden',
					perspective: '1000px',
					...style
				};

				// Use CSS animation for infinite rotation
				if (hasInfiniteRotation && animate?.rotate) {
					const duration = transition.duration || 2;
					return {
						...baseStyle,
						animation: `infinite-rotate-${Math.abs(animate.rotate)} ${duration}s linear infinite`,
						transformOrigin: 'center center'
					};
				}

				// Exit state
				if (isExiting && exit) {
					const duration = transition.duration || 0.3;
					const ease = typeof transition.ease === 'string' ? transition.ease : 'ease-in-out';
					return {
						...baseStyle,
						opacity: exit.opacity !== undefined ? exit.opacity : baseStyle.opacity,
						transform: `translate3d(${exit.x || 0}px, ${exit.y || 0}px, 0) scale(${exit.scale || 1}) rotate(${exit.rotate || 0}deg)`,
						transition: `all ${duration}s ${ease}`
					};
				}

				// Initial state
				if (!isVisible && initial) {
					return {
						...baseStyle,
						opacity: initial.opacity !== undefined ? initial.opacity : 1,
						transform: `translate3d(${initial.x || 0}px, ${initial.y || 0}px, 0) scale(${initial.scale || 1}) rotate(${initial.rotate || 0}deg)`
					};
				}

				// Animated state with hover/tap interactions
				if (isVisible && animate) {
					let scale = animate.scale || 1;
					let x = animate.x || 0;
					let y = animate.y || 0;
					let rotate = animate.rotate || 0;
					let opacity = animate.opacity !== undefined ? animate.opacity : 1;

					if (hoverState && whileHover) {
						scale = whileHover.scale !== undefined ? whileHover.scale : scale;
						y = whileHover.y !== undefined ? whileHover.y : y;
						rotate = whileHover.rotate !== undefined ? whileHover.rotate : rotate;
						opacity = whileHover.opacity !== undefined ? whileHover.opacity : opacity;
					}

					if (tapState && whileTap) {
						scale = whileTap.scale !== undefined ? whileTap.scale : scale;
						rotate = whileTap.rotate !== undefined ? whileTap.rotate : rotate;
					}

					const duration = transition.duration || 0.3;
					const delay = transition.delay || 0;
					let ease = 'ease-in-out';

					if (typeof transition.ease === 'string') {
						ease = transition.ease;
					} else if (Array.isArray(transition.ease)) {
						ease = `cubic-bezier(${transition.ease.join(', ')})`;
					}

					// Use CSS custom properties for spring animations
					if (transition.type === 'spring' && elementRef.current) {
						return {
							...baseStyle,
							opacity: `var(--motion-opacity, ${opacity})`,
							transform: `translate3d(var(--motion-x, ${x}px), var(--motion-y, ${y}px), 0) scale(var(--motion-scale, ${scale})) rotate(var(--motion-rotate, ${rotate}deg))`
						};
					}

					return {
						...baseStyle,
						opacity,
						transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
						transition: `all ${duration}s ${ease} ${delay}s`
					};
				}

				return baseStyle;
			}, [
				isVisible,
				isExiting,
				initial,
				animate,
				exit,
				hoverState,
				tapState,
				whileHover,
				whileTap,
				transition,
				hasInfiniteRotation,
				style
			]);

			const handleMouseEnter = useCallback(() => {
				if (whileHover) setHoverState(true);
			}, [whileHover]);

			const handleMouseLeave = useCallback(() => {
				if (whileHover) setHoverState(false);
			}, [whileHover]);

			const handleMouseDown = useCallback(() => {
				if (whileTap) setTapState(true);
			}, [whileTap]);

			const handleMouseUp = useCallback(() => {
				if (whileTap) setTapState(false);
			}, [whileTap]);

			const handleTouchStart = useCallback(() => {
				if (whileTap) setTapState(true);
			}, [whileTap]);

			const handleTouchEnd = useCallback(() => {
				if (whileTap) setTapState(false);
			}, [whileTap]);

			const Element = element as any;

			return (
				<Element
					ref={ref || elementRef}
					className={className}
					style={getStyles()}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
					data-layout-id={layoutId}
					{...restProps}
				>
					{children}
				</Element>
			);
		}
	) as any;
};

export const motion = {
	div: createMotionComponent('div'),
	nav: createMotionComponent('nav'),
	button: createMotionComponent('button'),
	img: createMotionComponent('img'),
	section: createMotionComponent('section'),
	article: createMotionComponent('article'),
	header: createMotionComponent('header'),
	footer: createMotionComponent('footer'),
	span: createMotionComponent('span'),
	p: createMotionComponent('p'),
	h1: createMotionComponent('h1'),
	h2: createMotionComponent('h2'),
	h3: createMotionComponent('h3'),
	h4: createMotionComponent('h4'),
	h5: createMotionComponent('h5'),
	h6: createMotionComponent('h6')
};

motion.div.displayName = 'MotionDiv';
motion.nav.displayName = 'MotionNav';
motion.button.displayName = 'MotionButton';
motion.img.displayName = 'MotionImg';

interface AnimatePresenceProps {
	children: ReactNode;
	mode?: 'wait' | 'sync' | 'popLayout';
}

export const AnimatePresence: React.FC<AnimatePresenceProps> = ({ children, mode = 'sync' }) => {
	return <>{children}</>;
};

// High-performance Reorder implementation using pointer events
// Fixes issues with framer-motion: performance, scroll handling, high refresh rates
interface ReorderGroupProps {
	axis?: 'x' | 'y';
	values: any[];
	onReorder: (newValues: any[]) => void;
	children: ReactNode;
	className?: string;
}

interface DragState {
	isDragging: boolean;
	draggedIndex: number | null;
	dragOverIndex: number | null;
	startY: number;
	startX: number;
	currentY: number;
	currentX: number;
	offsetY: number;
	offsetX: number;
	scrollContainer: HTMLElement | null;
	scrollInterval: number | null;
}

export const ReorderGroup: React.FC<ReorderGroupProps> = ({
	axis = 'y',
	values,
	onReorder,
	children,
	className
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const dragStateRef = useRef<DragState>({
		isDragging: false,
		draggedIndex: null,
		dragOverIndex: null,
		startY: 0,
		startX: 0,
		currentY: 0,
		currentX: 0,
		offsetY: 0,
		offsetX: 0,
		scrollContainer: null,
		scrollInterval: null
	});
	const itemRefsRef = useRef<Map<number, HTMLElement>>(new Map());
	const rafRef = useRef<number | null>(null);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	// Find scrollable container
	const findScrollContainer = useCallback((element: HTMLElement | null): HTMLElement | null => {
		if (!element) return null;
		let current: HTMLElement | null = element;
		while (current) {
			const style = window.getComputedStyle(current);
			if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
				return current;
			}
			current = current.parentElement;
		}
		return document.documentElement;
	}, []);

	// Auto-scroll when dragging near edges
	const handleAutoScroll = useCallback(() => {
		if (!dragStateRef.current.isDragging || !dragStateRef.current.scrollContainer) return;

		const state = dragStateRef.current;
		const container = state.scrollContainer;
		if (!container) return;
		
		const rect = container.getBoundingClientRect();
		const scrollThreshold = 50;
		const scrollSpeed = 10;

		let shouldScroll = false;
		let scrollDelta = 0;

		if (axis === 'y') {
			const mouseY = state.currentY;
			if (mouseY < rect.top + scrollThreshold) {
				scrollDelta = -scrollSpeed;
				shouldScroll = true;
			} else if (mouseY > rect.bottom - scrollThreshold) {
				scrollDelta = scrollSpeed;
				shouldScroll = true;
			}
		} else {
			const mouseX = state.currentX;
			if (mouseX < rect.left + scrollThreshold) {
				scrollDelta = -scrollSpeed;
				shouldScroll = true;
			} else if (mouseX > rect.right - scrollThreshold) {
				scrollDelta = scrollSpeed;
				shouldScroll = true;
			}
		}

		if (shouldScroll && container) {
			if (axis === 'y') {
				container.scrollTop += scrollDelta;
			} else {
				container.scrollLeft += scrollDelta;
			}
		}
	}, [axis]);

	// Smooth drag animation using RAF (works at any refresh rate)
	const updateDragPosition = useCallback(() => {
		if (!dragStateRef.current.isDragging) return;

		const state = dragStateRef.current;
		const draggedElement = state.draggedIndex !== null ? itemRefsRef.current.get(state.draggedIndex) : null;

		if (draggedElement) {
			const offset = axis === 'y' ? state.offsetY : state.offsetX;
			draggedElement.style.transform = `translate${axis === 'y' ? 'Y' : 'X'}(${offset}px)`;
			draggedElement.style.zIndex = '1000';
			draggedElement.style.opacity = '0.8';
			draggedElement.style.pointerEvents = 'none';
		}

		// Update drag over indicator
		const allItems = Array.from(itemRefsRef.current.entries());
		allItems.forEach(([index, element]) => {
			if (index === state.draggedIndex) return;
			
			if (index === state.dragOverIndex) {
				element.style.transform = `translate${axis === 'y' ? 'Y' : 'X'}(${axis === 'y' ? 4 : 4}px)`;
				element.style.transition = 'transform 0.1s ease-out';
			} else {
				element.style.transform = '';
				element.style.transition = 'transform 0.1s ease-out';
			}
		});

		handleAutoScroll();
		rafRef.current = requestAnimationFrame(updateDragPosition);
	}, [axis, handleAutoScroll]);

	// Find which item is under the pointer
	const findItemUnderPointer = useCallback((clientY: number, clientX: number): number | null => {
		const items = Array.from(itemRefsRef.current.entries());
		for (const [index, element] of items) {
			const rect = element.getBoundingClientRect();
			if (axis === 'y') {
				if (clientY >= rect.top && clientY <= rect.bottom) {
					return index;
				}
			} else {
				if (clientX >= rect.left && clientX <= rect.right) {
					return index;
				}
			}
		}
		return null;
	}, [axis]);

	// Handle pointer down
	const handlePointerDown = useCallback(
		(index: number) => (e: React.PointerEvent) => {
			// Only start drag on left mouse button or touch
			if (e.button !== 0 && e.pointerType !== 'touch') return;

			e.preventDefault();
			e.stopPropagation();

			const element = itemRefsRef.current.get(index);
			if (!element) return;

			const rect = element.getBoundingClientRect();
			const startY = e.clientY;
			const startX = e.clientX;
			const offsetY = startY - rect.top;
			const offsetX = startX - rect.left;

			dragStateRef.current = {
				isDragging: true,
				draggedIndex: index,
				dragOverIndex: null,
				startY,
				startX,
				currentY: startY,
				currentX: startX,
				offsetY,
				offsetX,
				scrollContainer: findScrollContainer(containerRef.current),
				scrollInterval: null
			};

			setDraggedIndex(index);
			element.setPointerCapture(e.pointerId);
			
			// Start RAF loop
			rafRef.current = requestAnimationFrame(updateDragPosition);

			// Global pointer move handler
			const handlePointerMove = (e: PointerEvent) => {
				if (!dragStateRef.current.isDragging) return;

				dragStateRef.current.currentY = e.clientY;
				dragStateRef.current.currentX = e.clientX;

				const currentOffset = axis === 'y' 
					? e.clientY - dragStateRef.current.startY
					: e.clientX - dragStateRef.current.startX;
				
				if (axis === 'y') {
					dragStateRef.current.offsetY = currentOffset;
				} else {
					dragStateRef.current.offsetX = currentOffset;
				}

				const itemIndex = findItemUnderPointer(e.clientY, e.clientX);
				if (itemIndex !== null && itemIndex !== dragStateRef.current.draggedIndex) {
					dragStateRef.current.dragOverIndex = itemIndex;
					setDragOverIndex(itemIndex);
				} else {
					dragStateRef.current.dragOverIndex = null;
					setDragOverIndex(null);
				}
			};

			// Global pointer up handler
			const handlePointerUp = (e: PointerEvent) => {
				if (!dragStateRef.current.isDragging) return;

				const state = dragStateRef.current;
				const finalIndex = findItemUnderPointer(e.clientY, e.clientX) ?? state.draggedIndex;

				// Perform reorder
				if (state.draggedIndex !== null && finalIndex !== null && state.draggedIndex !== finalIndex) {
					const newValues = [...values];
					const [draggedItem] = newValues.splice(state.draggedIndex, 1);
					newValues.splice(finalIndex, 0, draggedItem);
					onReorder(newValues);
				}

				// Cleanup
				if (rafRef.current !== null) {
					cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
				}

				// Reset all item styles
				itemRefsRef.current.forEach((el, idx) => {
					el.style.transform = '';
					el.style.zIndex = '';
					el.style.opacity = '';
					el.style.pointerEvents = '';
					el.style.transition = '';
				});

				element.releasePointerCapture(e.pointerId);
				dragStateRef.current.isDragging = false;
				setDraggedIndex(null);
				setDragOverIndex(null);

				document.removeEventListener('pointermove', handlePointerMove);
				document.removeEventListener('pointerup', handlePointerUp);
			};

			document.addEventListener('pointermove', handlePointerMove, { passive: false });
			document.addEventListener('pointerup', handlePointerUp, { once: true });
		},
		[axis, values, onReorder, findScrollContainer, updateDragPosition, findItemUnderPointer]
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	// Register item refs
	const registerItemRef = useCallback((index: number, element: HTMLElement | null) => {
		if (element) {
			itemRefsRef.current.set(index, element);
		} else {
			itemRefsRef.current.delete(index);
		}
	}, []);

	return (
		<div ref={containerRef} className={className} style={{ position: 'relative' }}>
			{React.Children.map(children, (child, index) => {
				if (React.isValidElement(child)) {
					const childElement = child as React.ReactElement<any>;
					const childStyle = (childElement.props?.style as React.CSSProperties) || {};
					return React.cloneElement(childElement, {
						ref: (el: HTMLElement | null) => registerItemRef(index, el),
						onPointerDown: handlePointerDown(index),
						style: {
							...childStyle,
							cursor: draggedIndex === index ? 'grabbing' : 'grab',
							touchAction: 'none',
							userSelect: 'none',
							WebkitUserSelect: 'none',
							willChange: draggedIndex === index ? 'transform' : 'auto'
						}
					});
				}
				return child;
			})}
		</div>
	);
};

interface ReorderItemProps {
	value: any;
	children: ReactNode;
	className?: string;
	style?: React.CSSProperties;
	onPointerDown?: (e: React.PointerEvent) => void;
	ref?: (el: HTMLElement | null) => void;
}

export const ReorderItem = React.forwardRef<HTMLDivElement, ReorderItemProps>(
	({ children, className, style, onPointerDown, ...props }, ref) => {
		const internalRef = useRef<HTMLDivElement>(null);
		const combinedRef = useCallback(
			(el: HTMLDivElement | null) => {
				internalRef.current = el;
				if (typeof ref === 'function') {
					ref(el);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
				}
			},
			[ref]
		);

		return (
			<div
				ref={combinedRef}
				className={className}
				style={style}
				onPointerDown={onPointerDown}
				{...props}
			>
				{children}
			</div>
		);
	}
);

ReorderItem.displayName = 'ReorderItem';

// Export as Reorder for compatibility
export const Reorder = {
	Group: ReorderGroup,
	Item: ReorderItem
};

// Export types for compatibility
export type Variants = Record<string, any>;

// Enhanced hooks with better performance
export const useScroll = () => {
	const [scrollY, setScrollY] = useState(0);
	const [scrollYProgress, setScrollYProgress] = useState(0);

	useEffect(() => {
		const updateScroll = () => {
			const scroll = window.scrollY;
			const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
			setScrollY(scroll);
			setScrollYProgress(maxScroll > 0 ? scroll / maxScroll : 0);
		};

		window.addEventListener('scroll', updateScroll, { passive: true });
		updateScroll();
		return () => window.removeEventListener('scroll', updateScroll);
	}, []);

	return { scrollY, scrollYProgress };
};

export const useTransform = (value: any, inputRange: number[], outputRange: number[]) => {
	return useMemo(() => {
		if (typeof value !== 'number') return outputRange[0] || 0;
		if (value <= inputRange[0]) return outputRange[0];
		if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];

		// Linear interpolation
		for (let i = 0; i < inputRange.length - 1; i++) {
			if (value >= inputRange[i] && value <= inputRange[i + 1]) {
				const t = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
				return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
			}
		}

		return outputRange[0] || 0;
	}, [value, inputRange, outputRange]);
};

export const useInView = (ref?: React.RefObject<HTMLElement>, options?: IntersectionObserverInit) => {
	const [isInView, setIsInView] = useState(false);
	const elementRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const element = ref?.current || elementRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInView(entry.isIntersecting);
			},
			{ threshold: 0.1, ...options }
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [ref, options]);

	return [isInView, elementRef] as [boolean, React.RefObject<HTMLElement>];
};

export const useMotionValue = (initial: number) => {
	const [value, setValue] = useState(initial);
	const valueRef = useRef(initial);

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	return {
		get: () => valueRef.current,
		set: (newValue: number) => {
			valueRef.current = newValue;
			setValue(newValue);
		}
	};
};

export const useSpring = (value: any, config?: { stiffness?: number; damping?: number; mass?: number }) => {
	const [springValue, setSpringValue] = useState(typeof value === 'number' ? value : 0);
	const rafRef = useRef<number | null>(null);
	const stateRef = useRef({ current: springValue, target: typeof value === 'number' ? value : 0, velocity: 0 });

	useEffect(() => {
		const stiffness = config?.stiffness || 100;
		const damping = config?.damping || 10;
		const mass = config?.mass || 1;
		const target = typeof value === 'number' ? value : 0;

		stateRef.current.target = target;

		const animate = () => {
			const state = stateRef.current;
			const result = springPhysics(state.current, state.target, state.velocity, stiffness, damping, mass);

			if (Math.abs(result.value - state.current) > 0.001 || Math.abs(result.velocity) > 0.001) {
				state.current = result.value;
				state.velocity = result.velocity;
				setSpringValue(result.value);
				rafRef.current = requestAnimationFrame(animate);
			}
		};

				rafRef.current = requestAnimationFrame(animate);
				return () => {
					if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
				};
			}, [value, config?.stiffness, config?.damping, config?.mass]);

	return springValue;
};
