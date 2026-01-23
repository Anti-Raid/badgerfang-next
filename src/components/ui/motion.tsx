'use client';

import React, { useEffect, useLayoutEffect, useState, useRef, ReactNode, useCallback, useMemo } from 'react';

// Performance optimizations: Use CSS animations where possible, batch DOM updates, minimize re-renders
interface MotionProps {
	children?: ReactNode;
	initial?:
		| boolean
		| string
		| {
				opacity?: number | number[];
				y?: number | number[];
				x?: number | number[];
				scale?: number | number[];
				rotate?: number | number[];
				rotateX?: number | number[];
				rotateY?: number | number[];
				width?: number | string | (number | string)[];
				height?: number | string | (number | string)[];
				top?: number | string | (number | string)[];
				left?: number | string | (number | string)[];
				right?: number | string | (number | string)[];
				bottom?: number | string | (number | string)[];
				boxShadow?: string | string[];
				backgroundColor?: string;
				translateX?: number | string | (number | string)[];
				translateY?: number | string | (number | string)[];
		  };
	animate?:
		| boolean
		| string
		| {
				opacity?: number | number[];
				y?: number | number[];
				x?: number | number[];
				scale?: number | number[];
				rotate?: number | number[];
				rotateX?: number | number[];
				rotateY?: number | number[];
				width?: number | string | (number | string)[];
				height?: number | string | (number | string)[];
				top?: number | string | (number | string)[];
				left?: number | string | (number | string)[];
				right?: number | string | (number | string)[];
				bottom?: number | string | (number | string)[];
				boxShadow?: string | string[];
				backgroundColor?: string;
				translateX?: number | string | (number | string)[];
				translateY?: number | string | (number | string)[];
		  };
	exit?:
		| string
		| {
			opacity?: number | number[];
			y?: number | number[];
			x?: number | number[];
			scale?: number | number[];
			rotate?: number | number[];
			rotateX?: number | number[];
			rotateY?: number | number[];
			width?: number | string | (number | string)[];
			height?: number | string | (number | string)[];
			top?: number | string | (number | string)[];
			left?: number | string | (number | string)[];
			right?: number | string | (number | string)[];
			bottom?: number | string | (number | string)[];
			boxShadow?: string | string[];
			backgroundColor?: string;
			translateX?: number | string | (number | string)[];
			translateY?: number | string | (number | string)[];
		};
	variants?: Variants;
	custom?: any;
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
		rotate?: {
			duration?: number;
			repeat?: number | 'Infinity';
			ease?: string | number[];
			type?: 'tween' | 'spring' | 'inertia';
		};
		boxShadow?: {
			duration?: number;
			repeat?: number | 'Infinity';
			ease?: string | number[];
			type?: 'tween' | 'spring' | 'inertia';
		};
		[key: string]: any;
	};
	whileHover?: {
		scale?: number;
		y?: number;
		rotate?: number;
		opacity?: number;
		boxShadow?: string;
		backgroundColor?: string;
		translateX?: number | string;
		transition?: {
			duration?: number;
			delay?: number;
			ease?: string | number[];
			type?: 'tween' | 'spring' | 'inertia';
			stiffness?: number;
			damping?: number;
			mass?: number;
		};
	};
	whileTap?: { 
		scale?: number; 
		rotate?: number;
		translateX?: number | string;
	};
	whileInView?:
		| {
				opacity?: number | number[];
				y?: number | number[];
				x?: number | number[];
				scale?: number | number[];
				rotate?: number | number[];
				rotateX?: number | number[];
				rotateY?: number | number[];
				width?: number | string | (number | string)[];
				boxShadow?: string | string[];
				backgroundColor?: string;
				translateX?: number | string | (number | string)[];
				translateY?: number | string | (number | string)[];
		  }
		| string;
	whileFocus?: { scale?: number; opacity?: number };
	viewport?: { once?: boolean; margin?: string; amount?: number };
	layout?: boolean | 'position' | 'size';
	layoutId?: string;
	layoutDependency?: any;
	drag?: boolean | 'x' | 'y';
	dragConstraints?:
		| { left?: number; right?: number; top?: number; bottom?: number }
		| React.RefObject<HTMLElement>;
	dragElastic?: number;
	dragMomentum?: boolean;
	onDragStart?: (event: PointerEvent, info: { point: { x: number; y: number } }) => void;
	onDragEnd?: (event: PointerEvent, info: { point: { x: number; y: number } }) => void;
	className?: string;
	style?: React.CSSProperties;
	onAnimationStart?: () => void;
	onAnimationComplete?: () => void;
	onUpdate?: (latest: {
		x: number;
		y: number;
		scale: number;
		rotate: number;
		opacity: number;
	}) => void;
}

export type Variants = Record<
	string,
	{
		opacity?: number | number[];
		y?: number | number[];
		x?: number | number[];
		scale?: number | number[];
		rotate?: number | number[];
		rotateX?: number | number[];
		rotateY?: number | number[];
		width?: number | string | (number | string)[];
		boxShadow?: string | string[];
		backgroundColor?: string;
		translateX?: number | string | (number | string)[];
		translateY?: number | string | (number | string)[];
		transition?: MotionProps['transition'];
	} | ((props: any) => any)
>;

// Optimized spring physics with adaptive timestep
const springPhysics = (
	current: number,
	target: number,
	velocity: number,
	stiffness: number = 100,
	damping: number = 10,
	mass: number = 1,
	deltaTime: number = 0.016
): { value: number; velocity: number } => {
	const springForce = (target - current) * stiffness;
	const dampingForce = -velocity * damping;
	const acceleration = (springForce + dampingForce) / mass;
	const newVelocity = velocity + acceleration * deltaTime;
	const newValue = current + newVelocity * deltaTime;

	return { value: newValue, velocity: newVelocity };
};

// Performance: Shared RAF scheduler to batch animations
class AnimationScheduler {
	private rafId: number | null = null;
	private callbacks = new Set<() => void>();
	private lastTime = 0;

	add(callback: () => void) {
		this.callbacks.add(callback);
		if (this.rafId === null) {
			this.rafId = requestAnimationFrame(this.tick);
		}
	}

	remove(callback: () => void) {
		this.callbacks.delete(callback);
		if (this.callbacks.size === 0 && this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	private tick = (currentTime: number) => {
		const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0.016;
		this.lastTime = currentTime;

		// Batch all callbacks
		this.callbacks.forEach((cb) => {
			try {
				cb();
			} catch (e) {
				console.error('Animation callback error:', e);
			}
		});

		if (this.callbacks.size > 0) {
			this.rafId = requestAnimationFrame(this.tick);
		} else {
			this.rafId = null;
		}
	};
}

const globalScheduler = new AnimationScheduler();

// Performance: CSS keyframe cache with proper synchronization
const keyframeCache = new Map<string, string>();
const injectingKeyframes = new Set<string>();

const injectKeyframes = (name: string, keyframes: string) => {
	// Prevent duplicate injections with proper synchronization
	if (keyframeCache.has(name)) return;
	if (injectingKeyframes.has(name)) {
		// Wait for the other injection to complete
		let attempts = 0;
		const checkInterval = setInterval(() => {
			attempts++;
			if (keyframeCache.has(name) || attempts > 50) {
				clearInterval(checkInterval);
			}
		}, 10);
		return;
	}

	injectingKeyframes.add(name);
	keyframeCache.set(name, keyframes);

	if (typeof document !== 'undefined') {
		const styleId = `motion-keyframes-${name}`;
		// Double-check after acquiring lock
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = keyframes;
			// Use requestAnimationFrame to ensure DOM is ready
			requestAnimationFrame(() => {
				if (!document.getElementById(styleId)) {
					document.head.appendChild(style);
				}
				injectingKeyframes.delete(name);
			});
		} else {
			injectingKeyframes.delete(name);
		}
	} else {
		injectingKeyframes.delete(name);
	}
};

const createMotionComponent = <T extends keyof JSX.IntrinsicElements>(
	element: T
): React.ForwardRefExoticComponent<
	MotionProps &
		Omit<React.ComponentPropsWithoutRef<T>, 'children'> &
		React.RefAttributes<HTMLElement>
> => {
	type Props = MotionProps & Omit<React.ComponentPropsWithoutRef<T>, 'children'>;

	return React.forwardRef<HTMLElement, Props>((props, ref) => {
		const {
			children,
			initial,
			animate,
			exit,
			variants,
			transition = { duration: 0.3 },
			whileHover,
			whileTap,
			whileInView,
			whileFocus,
			viewport,
			layout,
			layoutId,
			layoutDependency,
			drag,
			dragConstraints,
			dragElastic = 0.2,
			dragMomentum = true,
			onDragStart,
			onDragEnd,
			className,
			style,
			onAnimationStart,
			onAnimationComplete,
			onUpdate,
			...restProps
		} = props as Props & { children?: ReactNode };

		// Resolve variants
		const resolvedInitial = useMemo(() => {
			if (typeof initial === 'boolean') return initial ? variants?.initial : false;
			if (typeof initial === 'string') return variants?.[initial];
			return initial || variants?.initial;
		}, [initial, variants]);

		const resolvedAnimate = useMemo(() => {
			if (typeof animate === 'boolean') return animate ? variants?.animate : false;
			if (typeof animate === 'string') return variants?.[animate];
			return animate || variants?.animate;
		}, [animate, variants]);

		const resolvedExit = useMemo(() => {
			if (typeof exit === 'string') return variants?.[exit];
			return exit;
		}, [exit, variants]);

		const resolvedWhileInView = useMemo(() => {
			if (!whileInView) return undefined;
			if (typeof whileInView === 'string') return variants?.[whileInView];
			return whileInView;
		}, [whileInView, variants]);

		// State management - minimize re-renders
		const [isVisible, setIsVisible] = useState(false);
		const [isExiting, setIsExiting] = useState(false);
		const [inViewState, setInViewState] = useState(false);
		const [hoverState, setHoverState] = useState(false);
		const [tapState, setTapState] = useState(false);
		const [focusState, setFocusState] = useState(false);
		const [isDragging, setIsDragging] = useState(false);
		const elementRef = useRef<HTMLElement>(null);
		const timeoutRef = useRef<NodeJS.Timeout | null>(null);
		const dragStateRef = useRef({
			isDragging: false,
			startX: 0,
			startY: 0,
			currentX: 0,
			currentY: 0,
			velocityX: 0,
			velocityY: 0,
			lastX: 0,
			lastY: 0,
			lastTime: 0
		});

		// Animation state - use refs to avoid re-renders
		const animationStateRef = useRef({
			opacity: { current: 1, target: 1, velocity: 0 },
			x: { current: 0, target: 0, velocity: 0 },
			y: { current: 0, target: 0, velocity: 0 },
			scale: { current: 1, target: 1, velocity: 0 },
			rotate: { current: 0, target: 0, velocity: 0 }
		});

		// Performance: Use CSS animations for simple, infinite, or linear animations
		const useCSSAnimation = useMemo(() => {
			if (!resolvedAnimate) return false;
			const hasRepeat =
				transition.repeat === 'Infinity' ||
				(typeof transition.repeat === 'number' && transition.repeat > 0);
			const isLinear = transition.ease === 'linear' || transition.type === 'tween';
			const hasSingleProperty = Object.keys(resolvedAnimate).length === 1;
			return hasRepeat && isLinear && hasSingleProperty;
		}, [resolvedAnimate, transition]);

		// Generate CSS keyframes for infinite animations - use useLayoutEffect for immediate injection
		useLayoutEffect(() => {
			if (!useCSSAnimation || !resolvedAnimate) return;

			const prop = Object.keys(resolvedAnimate)[0] as keyof typeof resolvedAnimate;
			const value = resolvedAnimate[prop];
			if (prop === 'rotate' && typeof value === 'number') {
				const name = `rotate-${Math.abs(value)}`;
				const duration = transition.duration || 2;
				const keyframes = `@keyframes ${name} {
						from { transform: rotate(0deg); }
						to { transform: rotate(${value}deg); }
					}`;
				// Inject immediately and ensure it's ready
				injectKeyframes(name, keyframes);
				// Double-check injection completed
				requestAnimationFrame(() => {
					if (typeof document !== 'undefined') {
						const styleId = `motion-keyframes-${name}`;
						if (!document.getElementById(styleId) && keyframeCache.has(name)) {
							// Retry injection if it failed
							const style = document.createElement('style');
							style.id = styleId;
							style.textContent = keyframeCache.get(name)!;
							document.head.appendChild(style);
						}
					}
				});
			}
		}, [useCSSAnimation, resolvedAnimate, transition]);

		// IntersectionObserver for whileInView - optimized with passive observation
		useEffect(() => {
			if (!resolvedWhileInView || !elementRef.current) return;

			const element = elementRef.current;
			
			// Check initial intersection state immediately to prevent race conditions
			const checkInitialIntersection = () => {
				const rect = element.getBoundingClientRect();
				const isIntersecting = 
					rect.top < window.innerHeight &&
					rect.bottom > 0 &&
					rect.left < window.innerWidth &&
					rect.right > 0;
				
				if (isIntersecting) {
					setInViewState(true);
					if (viewport?.once) {
						return true; // Don't set up observer if already in view and once is true
					}
				}
				return false;
			};

			// Use requestAnimationFrame to ensure DOM is fully laid out
			requestAnimationFrame(() => {
				if (!elementRef.current) return;
				
				// Check if already in view before setting up observer
				if (checkInitialIntersection() && viewport?.once) {
					return; // Already in view and once is true, no need for observer
				}

				const observer = new IntersectionObserver(
					([entry]) => {
						if (entry.isIntersecting) {
							setInViewState(true);
							if (viewport?.once) {
								observer.disconnect();
							}
						} else if (!viewport?.once) {
							setInViewState(false);
						}
					},
					{
						threshold: viewport?.amount || 0.1,
						rootMargin: viewport?.margin || '0px'
					}
				);

				observer.observe(element);
				return () => observer.disconnect();
			});
		}, [resolvedWhileInView, viewport]);

		// Initialize animation state - use useLayoutEffect to prevent flash
		useLayoutEffect(() => {
			if (resolvedInitial && typeof resolvedInitial === 'object') {
				const getFirstValue = (val: any): number => {
					if (Array.isArray(val)) return val[0] as number;
					return typeof val === 'number' ? val : 0;
				};

				animationStateRef.current = {
					opacity: {
						current: getFirstValue(resolvedInitial.opacity) ?? 1,
						target: getFirstValue(resolvedInitial.opacity) ?? 1,
						velocity: 0
					},
					x: { current: getFirstValue(resolvedInitial.x) ?? 0, target: getFirstValue(resolvedInitial.x) ?? 0, velocity: 0 },
					y: { current: getFirstValue(resolvedInitial.y) ?? 0, target: getFirstValue(resolvedInitial.y) ?? 0, velocity: 0 },
					scale: {
						current: getFirstValue(resolvedInitial.scale) ?? 1,
						target: getFirstValue(resolvedInitial.scale) ?? 1,
						velocity: 0
					},
					rotate: {
						current: getFirstValue(resolvedInitial.rotate) ?? 0,
						target: getFirstValue(resolvedInitial.rotate) ?? 0,
						velocity: 0
					}
				};
			}
			// Set visible immediately to prevent animation delays
			setIsVisible(true);
			// Use requestAnimationFrame to ensure DOM is ready before calling callbacks
			requestAnimationFrame(() => {
				onAnimationStart?.();
			});
			return () => {
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
			};
		}, [resolvedInitial, onAnimationStart]);

		// Performance: Optimized spring animation loop using shared scheduler
		const animationCallbackRef = useRef<(() => void) | null>(null);

		useEffect(() => {
			if (useCSSAnimation) return; // Skip RAF for CSS animations

			const isSpring = transition.type === 'spring' || transition.stiffness || transition.damping;
			if (!isSpring) return; // Only use RAF for spring animations

			const stiffness = transition.stiffness || 100;
			const damping = transition.damping || 10;
			const mass = transition.mass || 1;

			animationCallbackRef.current = () => {
				const state = animationStateRef.current;
				let hasChanges = false;
				let lastTime = performance.now();

				const update = (currentTime: number) => {
					const deltaTime = (currentTime - lastTime) / 1000;
					lastTime = currentTime;

					// Update each property with spring physics
					(['opacity', 'x', 'y', 'scale', 'rotate'] as const).forEach((prop) => {
						const current = state[prop].current;
						const target = state[prop].target;
						const velocity = state[prop].velocity;

						if (Math.abs(current - target) > 0.001 || Math.abs(velocity) > 0.001) {
							const result = springPhysics(
								current,
								target,
								velocity,
								stiffness,
								damping,
								mass,
								deltaTime
							);
							state[prop].current = result.value;
							state[prop].velocity = result.velocity;
							hasChanges = true;
						}
					});

					if (hasChanges && elementRef.current) {
						const el = elementRef.current;
						const s = animationStateRef.current;

						// Batch DOM updates
						el.style.setProperty('--motion-opacity', String(s.opacity.current));
						el.style.setProperty('--motion-x', `${s.x.current}px`);
						el.style.setProperty('--motion-y', `${s.y.current}px`);
						el.style.setProperty('--motion-scale', String(s.scale.current));
						el.style.setProperty('--motion-rotate', `${s.rotate.current}deg`);

						// Call onUpdate if provided
						onUpdate?.({
							x: s.x.current,
							y: s.y.current,
							scale: s.scale.current,
							rotate: s.rotate.current,
							opacity: s.opacity.current
						});
					}
				};

				update(performance.now());
			};

			if (animationCallbackRef.current) {
				globalScheduler.add(animationCallbackRef.current);
			}

			return () => {
				if (animationCallbackRef.current) {
					globalScheduler.remove(animationCallbackRef.current);
				}
			};
		}, [
			useCSSAnimation,
			transition.type,
			transition.stiffness,
			transition.damping,
			transition.mass,
			onUpdate
		]);

		// Update animation targets
		useEffect(() => {
			if (resolvedAnimate && typeof resolvedAnimate === 'object' && !useCSSAnimation) {
				const getFirstValue = (val: any): number | undefined => {
					if (Array.isArray(val)) return (val[val.length - 1] as number) ?? undefined;
					return typeof val === 'number' ? val : undefined;
				};

				if (resolvedAnimate.opacity !== undefined)
					animationStateRef.current.opacity.target = getFirstValue(resolvedAnimate.opacity) ?? 1;
				if (resolvedAnimate.x !== undefined) animationStateRef.current.x.target = getFirstValue(resolvedAnimate.x) ?? 0;
				if (resolvedAnimate.y !== undefined) animationStateRef.current.y.target = getFirstValue(resolvedAnimate.y) ?? 0;
				if (resolvedAnimate.scale !== undefined)
					animationStateRef.current.scale.target = getFirstValue(resolvedAnimate.scale) ?? 1;
				if (resolvedAnimate.rotate !== undefined)
					animationStateRef.current.rotate.target = getFirstValue(resolvedAnimate.rotate) ?? 0;
			}
		}, [resolvedAnimate, useCSSAnimation]);

		// Handle exit animation
		useEffect(() => {
			if (resolvedExit && isExiting) {
				const duration = transition.duration || 0.3;
				timeoutRef.current = setTimeout(() => {
					onAnimationComplete?.();
				}, duration * 1000);
			}
		}, [isExiting, resolvedExit, transition.duration, onAnimationComplete]);

		// Drag handling - optimized with pointer events
		useEffect(() => {
			if (!drag || !elementRef.current) return;

			const element = elementRef.current;
			const state = dragStateRef.current;

			const handlePointerDown = (e: PointerEvent) => {
				if (e.button !== 0 && e.pointerType !== 'touch') return;
				e.preventDefault();

				state.isDragging = true;
				state.startX = e.clientX;
				state.startY = e.clientY;
				state.currentX = e.clientX;
				state.currentY = e.clientY;
				state.lastX = e.clientX;
				state.lastY = e.clientY;
				state.lastTime = performance.now();
				state.velocityX = 0;
				state.velocityY = 0;

				setIsDragging(true);
				element.setPointerCapture(e.pointerId);
				onDragStart?.(e, { point: { x: e.clientX, y: e.clientY } });

				const handlePointerMove = (e: PointerEvent) => {
					if (!state.isDragging) return;

					const now = performance.now();
					const deltaTime = (now - state.lastTime) / 1000;
					state.lastTime = now;

					const deltaX = e.clientX - state.lastX;
					const deltaY = e.clientY - state.lastY;
					state.velocityX = deltaTime > 0 ? deltaX / deltaTime : 0;
					state.velocityY = deltaTime > 0 ? deltaY / deltaTime : 0;

					state.currentX = e.clientX;
					state.currentY = e.clientY;
					state.lastX = e.clientX;
					state.lastY = e.clientY;

					let newX = e.clientX - state.startX;
					let newY = e.clientY - state.startY;

					// Apply constraints
					if (dragConstraints) {
						if (typeof dragConstraints === 'object' && 'current' in dragConstraints) {
							const container = dragConstraints.current;
							if (container) {
								const containerRect = container.getBoundingClientRect();
								const elementRect = element.getBoundingClientRect();
								const maxX = containerRect.width - elementRect.width;
								const maxY = containerRect.height - elementRect.height;
								newX = Math.max(0, Math.min(newX, maxX));
								newY = Math.max(0, Math.min(newY, maxY));
							}
						} else {
							if (dragConstraints.left !== undefined) newX = Math.max(newX, dragConstraints.left);
							if (dragConstraints.right !== undefined) newX = Math.min(newX, dragConstraints.right);
							if (dragConstraints.top !== undefined) newY = Math.max(newY, dragConstraints.top);
							if (dragConstraints.bottom !== undefined)
								newY = Math.min(newY, dragConstraints.bottom);
						}
					}

					// Apply elastic bounds
					if (dragElastic > 0) {
						const elastic = dragElastic * 50;
						if (newX < 0) newX = newX * (1 - dragElastic);
						if (newY < 0) newY = newY * (1 - dragElastic);
					}

					// Update transform based on drag axis
					if (drag === 'x' || drag === true) {
						element.style.transform = `translate3d(${newX}px, 0, 0)`;
						animationStateRef.current.x.current = newX;
					}
					if (drag === 'y' || drag === true) {
						element.style.transform = `translate3d(0, ${newY}px, 0)`;
						animationStateRef.current.y.current = newY;
					}
					if (drag === true) {
						element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
						animationStateRef.current.x.current = newX;
						animationStateRef.current.y.current = newY;
					}
				};

				const handlePointerUp = (e: PointerEvent) => {
					if (!state.isDragging) return;

					state.isDragging = false;
					setIsDragging(false);
					element.releasePointerCapture(e.pointerId);
					onDragEnd?.(e, { point: { x: e.clientX, y: e.clientY } });

					// Apply momentum if enabled
					if (dragMomentum && (state.velocityX !== 0 || state.velocityY !== 0)) {
						const momentumCallback = () => {
							const decay = 0.9;
							state.velocityX *= decay;
							state.velocityY *= decay;

							if (Math.abs(state.velocityX) > 0.1 || Math.abs(state.velocityY) > 0.1) {
								let newX = animationStateRef.current.x.current + state.velocityX * 0.016;
								let newY = animationStateRef.current.y.current + state.velocityY * 0.016;

								// Apply constraints
								if (
									dragConstraints &&
									typeof dragConstraints === 'object' &&
									!('current' in dragConstraints)
								) {
									if (dragConstraints.left !== undefined)
										newX = Math.max(newX, dragConstraints.left);
									if (dragConstraints.right !== undefined)
										newX = Math.min(newX, dragConstraints.right);
									if (dragConstraints.top !== undefined) newY = Math.max(newY, dragConstraints.top);
									if (dragConstraints.bottom !== undefined)
										newY = Math.min(newY, dragConstraints.bottom);
								}

								animationStateRef.current.x.current = newX;
								animationStateRef.current.y.current = newY;

								if (drag === 'x' || drag === true) {
									element.style.transform = `translate3d(${newX}px, 0, 0)`;
								}
								if (drag === 'y' || drag === true) {
									element.style.transform = `translate3d(0, ${newY}px, 0)`;
								}
								if (drag === true) {
									element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
								}

								requestAnimationFrame(momentumCallback);
							}
						};
						requestAnimationFrame(momentumCallback);
					}

					document.removeEventListener('pointermove', handlePointerMove);
					document.removeEventListener('pointerup', handlePointerUp);
				};

				document.addEventListener('pointermove', handlePointerMove, { passive: false });
				document.addEventListener('pointerup', handlePointerUp, { once: true });
			};

			element.addEventListener('pointerdown', handlePointerDown);
			return () => {
				element.removeEventListener('pointerdown', handlePointerDown);
			};
		}, [drag, dragConstraints, dragElastic, dragMomentum, onDragStart, onDragEnd]);

		// Optimized style calculation - memoized and batched
		const getStyles = useCallback((): React.CSSProperties => {
			const baseStyle: React.CSSProperties = {
				willChange: isDragging ? 'transform' : 'transform, opacity',
				backfaceVisibility: 'hidden',
				perspective: '1000px',
				contain: 'layout style paint', // CSS containment for performance
				...style
			};

			// Use CSS animation for infinite/linear animations
			if (useCSSAnimation && resolvedAnimate && typeof resolvedAnimate === 'object') {
				const prop = Object.keys(resolvedAnimate)[0] as keyof typeof resolvedAnimate;
				const value = resolvedAnimate[prop];
				if (prop === 'rotate' && typeof value === 'number') {
					const duration = transition.duration || 2;
					return {
						...baseStyle,
						animation: `rotate-${Math.abs(value)} ${duration}s linear infinite`,
						transformOrigin: 'center center'
					};
				}
			}

		// Exit state
		if (isExiting && resolvedExit && typeof resolvedExit === 'object') {
			const getExitOpacity = (val: any): number | undefined => {
				if (Array.isArray(val)) return (val[val.length - 1] as number) ?? undefined;
				return typeof val === 'number' ? val : undefined;
			};

			const duration = transition.duration || 0.3;
			const ease = typeof transition.ease === 'string' ? transition.ease : 'ease-in-out';
			return {
				...baseStyle,
				opacity: getExitOpacity(resolvedExit.opacity) ?? baseStyle.opacity,
				transform: `translate3d(${resolvedExit.x || 0}px, ${resolvedExit.y || 0}px, 0) scale(${resolvedExit.scale || 1}) rotate(${resolvedExit.rotate || 0}deg)`,
				transition: `all ${duration}s ${ease}`
			};
		}			// Initial state
		if (!isVisible && resolvedInitial && typeof resolvedInitial === 'object') {
			const getOpacityValue = (val: any): number => {
				if (Array.isArray(val)) return (val[0] as number) ?? 1;
				return typeof val === 'number' ? val : 1;
			};

			const getWidthValue = (val: any): string | number | undefined => {
				if (Array.isArray(val)) return (val[0] as string | number) ?? undefined;
				return (val as string | number) ?? undefined;
			};

			const style: React.CSSProperties = {
				...baseStyle,
				opacity: getOpacityValue(resolvedInitial.opacity),
				transform: `translate3d(${resolvedInitial.x || 0}px, ${resolvedInitial.y || 0}px, 0) scale(${resolvedInitial.scale || 1}) rotate(${resolvedInitial.rotate || 0}deg)`
			};
			if (resolvedInitial.width !== undefined) {
				style.width = getWidthValue(resolvedInitial.width);
			}
			if (resolvedInitial.boxShadow !== undefined) {
				style.boxShadow = Array.isArray(resolvedInitial.boxShadow)
					? resolvedInitial.boxShadow[0]
					: resolvedInitial.boxShadow;
			}
			return style;
		}			// Animated state with interactions
			if (isVisible) {
				const activeAnimate =
					inViewState && resolvedWhileInView ? resolvedWhileInView : resolvedAnimate;

				if (activeAnimate && typeof activeAnimate === 'object') {
					const getNumericValue = (val: any, defaultVal: number): number => {
						if (Array.isArray(val)) return (val[val.length - 1] as number) ?? defaultVal;
						return typeof val === 'number' ? val : defaultVal;
					};

					const animateObj = activeAnimate as any;
					let scale = getNumericValue(animateObj.scale, 1);
					let x = getNumericValue(animateObj.x, 0);
					let y = getNumericValue(animateObj.y, 0);
					let rotate = getNumericValue(animateObj.rotate, 0);
					let opacity = getNumericValue(animateObj.opacity, 1);
					let width = animateObj.width;
					let boxShadow = animateObj.boxShadow;

					// Apply interaction states
					let hoverTransition = transition;
					if (hoverState && whileHover && typeof whileHover === 'object') {
						scale = whileHover.scale !== undefined ? whileHover.scale : scale;
						y = whileHover.y !== undefined ? whileHover.y : y;
						rotate = whileHover.rotate !== undefined ? whileHover.rotate : rotate;
						opacity = whileHover.opacity !== undefined ? whileHover.opacity : opacity;
						// Use transition from whileHover if provided
						if (whileHover.transition) {
							hoverTransition = { ...transition, ...whileHover.transition };
						}
					}

					if (tapState && whileTap) {
						scale = whileTap.scale !== undefined ? whileTap.scale : scale;
						rotate = whileTap.rotate !== undefined ? whileTap.rotate : rotate;
					}

					if (focusState && whileFocus) {
						scale = whileFocus.scale !== undefined ? whileFocus.scale : scale;
						opacity = whileFocus.opacity !== undefined ? whileFocus.opacity : opacity;
					}

					// Apply drag offset
					if (isDragging) {
						x += animationStateRef.current.x.current;
						y += animationStateRef.current.y.current;
					}

					// Use hover transition if hovering, otherwise use default transition
					const activeTransition =
						hoverState && hoverTransition !== transition ? hoverTransition : transition;
					const duration = activeTransition.duration || 0.3;
					const delay = activeTransition.delay || 0;
					let ease = 'ease-in-out';

					if (typeof activeTransition.ease === 'string') {
						ease = activeTransition.ease;
					} else if (Array.isArray(activeTransition.ease)) {
						ease = `cubic-bezier(${activeTransition.ease.join(', ')})`;
					}

					// Handle per-property transitions
					const transitions: string[] = [];
					if (transition.rotate) {
						const rotateDuration = transition.rotate.duration || duration;
						const rotateEase =
							typeof transition.rotate.ease === 'string' ? transition.rotate.ease : ease;
						transitions.push(`transform ${rotateDuration}s ${rotateEase}`);
					}
					if (transition.boxShadow) {
						const shadowDuration = transition.boxShadow.duration || duration;
						const shadowEase =
							typeof transition.boxShadow.ease === 'string' ? transition.boxShadow.ease : ease;
						transitions.push(`box-shadow ${shadowDuration}s ${shadowEase}`);
					}
					if (width !== undefined) {
						transitions.push(`width ${duration}s ${ease}`);
					}

					// Build transition string
					let transitionString = isDragging
						? 'none'
						: transitions.length > 0
							? transitions.join(', ')
							: `all ${duration}s ${ease} ${delay}s`;

					// Handle boxShadow array (keyframe animation)
					let boxShadowValue: string | undefined;
					if (Array.isArray(boxShadow)) {
						// For keyframe animations, we'll use CSS animation
						// But for simplicity, just use the first value and let CSS transition handle it
						boxShadowValue = boxShadow[0];
					} else if (typeof boxShadow === 'string') {
						boxShadowValue = boxShadow;
					}

					// Use CSS custom properties for spring animations
					if (activeTransition.type === 'spring' && elementRef.current && !isDragging) {
						const style: React.CSSProperties = {
							...baseStyle,
							opacity: `var(--motion-opacity, ${opacity})`,
							transform: `translate3d(var(--motion-x, ${x}px), var(--motion-y, ${y}px), 0) scale(var(--motion-scale, ${scale})) rotate(var(--motion-rotate, ${rotate}deg))`
						};
						if (width !== undefined) {
							style.width = width;
						}
						if (boxShadowValue !== undefined) {
							style.boxShadow = boxShadowValue;
						}
						return style;
					}

					const style: React.CSSProperties = {
						...baseStyle,
						opacity,
						transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
						transition: transitionString
					};
					if (width !== undefined) {
						style.width = width;
					}
					if (boxShadowValue !== undefined) {
						style.boxShadow = boxShadowValue;
					}
					return style;
				}
			}

			return baseStyle;
		}, [
			isVisible,
			isExiting,
			resolvedInitial,
			resolvedAnimate,
			resolvedExit,
			inViewState,
			resolvedWhileInView,
			hoverState,
			tapState,
			focusState,
			whileHover,
			whileTap,
			whileFocus,
			transition,
			useCSSAnimation,
			isDragging,
			style
		]);

		// Event handlers - memoized
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

		const handleFocus = useCallback(() => {
			if (whileFocus) setFocusState(true);
		}, [whileFocus]);

		const handleBlur = useCallback(() => {
			if (whileFocus) setFocusState(false);
		}, [whileFocus]);

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
				onFocus={handleFocus}
				onBlur={handleBlur}
				data-layout-id={layoutId}
				{...restProps}
			>
				{children}
			</Element>
		);
	}) as any;
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
	h6: createMotionComponent('h6'),
	ul: createMotionComponent('ul'),
	ol: createMotionComponent('ol'),
	li: createMotionComponent('li'),
	a: createMotionComponent('a'),
	form: createMotionComponent('form'),
	input: createMotionComponent('input'),
	textarea: createMotionComponent('textarea'),
	select: createMotionComponent('select'),
	label: createMotionComponent('label')
};

motion.div.displayName = 'MotionDiv';
motion.nav.displayName = 'MotionNav';
motion.button.displayName = 'MotionButton';
motion.img.displayName = 'MotionImg';

interface AnimatePresenceProps {
	children: ReactNode;
	mode?: 'wait' | 'sync' | 'popLayout';
	initial?: boolean;
	onExitComplete?: () => void;
}

export const AnimatePresence: React.FC<AnimatePresenceProps> = ({
	children,
	mode = 'sync',
	initial = true,
	onExitComplete
}) => {
	return <>{children}</>;
};

// High-performance Reorder implementation
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
		scrollContainer: null
	});
	const itemRefsRef = useRef<Map<number, HTMLElement>>(new Map());
	const rafRef = useRef<number | null>(null);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const findScrollContainer = useCallback((element: HTMLElement | null): HTMLElement | null => {
		if (!element) return null;
		let current: HTMLElement | null = element;
		while (current) {
			const style = window.getComputedStyle(current);
			if (
				style.overflow === 'auto' ||
				style.overflow === 'scroll' ||
				style.overflowY === 'auto' ||
				style.overflowY === 'scroll'
			) {
				return current;
			}
			current = current.parentElement;
		}
		return document.documentElement;
	}, []);

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

	const updateDragPosition = useCallback(() => {
		if (!dragStateRef.current.isDragging) return;

		const state = dragStateRef.current;
		const draggedElement =
			state.draggedIndex !== null ? itemRefsRef.current.get(state.draggedIndex) : null;

		if (draggedElement) {
			const offset = axis === 'y' ? state.offsetY : state.offsetX;
			draggedElement.style.transform = `translate${axis === 'y' ? 'Y' : 'X'}(${offset}px)`;
			draggedElement.style.zIndex = '1000';
			draggedElement.style.opacity = '0.8';
			draggedElement.style.pointerEvents = 'none';
			draggedElement.style.willChange = 'transform';
		}

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

	const findItemUnderPointer = useCallback(
		(clientY: number, clientX: number): number | null => {
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
		},
		[axis]
	);

	const handlePointerDown = useCallback(
		(index: number) => (e: React.PointerEvent) => {
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
				scrollContainer: findScrollContainer(containerRef.current)
			};

			setDraggedIndex(index);
			element.setPointerCapture(e.pointerId);
			rafRef.current = requestAnimationFrame(updateDragPosition);

			const handlePointerMove = (e: PointerEvent) => {
				if (!dragStateRef.current.isDragging) return;

				dragStateRef.current.currentY = e.clientY;
				dragStateRef.current.currentX = e.clientX;

				const currentOffset =
					axis === 'y'
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

			const handlePointerUp = (e: PointerEvent) => {
				if (!dragStateRef.current.isDragging) return;

				const state = dragStateRef.current;
				const finalIndex = findItemUnderPointer(e.clientY, e.clientX) ?? state.draggedIndex;

				if (
					state.draggedIndex !== null &&
					finalIndex !== null &&
					state.draggedIndex !== finalIndex
				) {
					const newValues = [...values];
					const [draggedItem] = newValues.splice(state.draggedIndex, 1);
					newValues.splice(finalIndex, 0, draggedItem);
					onReorder(newValues);
				}

				if (rafRef.current !== null) {
					cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
				}

				itemRefsRef.current.forEach((el) => {
					el.style.transform = '';
					el.style.zIndex = '';
					el.style.opacity = '';
					el.style.pointerEvents = '';
					el.style.transition = '';
					el.style.willChange = '';
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

	useEffect(() => {
		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	const registerItemRef = useCallback((index: number, element: HTMLElement | null) => {
		if (element) {
			itemRefsRef.current.set(index, element);
		} else {
			itemRefsRef.current.delete(index);
		}
	}, []);

	return (
		<div
			ref={containerRef}
			className={className}
			style={{ position: 'relative', contain: 'layout' }}
		>
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
							willChange: draggedIndex === index ? 'transform' : 'auto',
							contain: 'layout style paint'
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

export const Reorder = {
	Group: ReorderGroup,
	Item: ReorderItem
};

// Enhanced hooks with performance optimizations
export const useScroll = () => {
	const [scrollY, setScrollY] = useState(0);
	const [scrollYProgress, setScrollYProgress] = useState(0);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		let ticking = false;

		const updateScroll = () => {
			const scroll = window.scrollY;
			const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
			setScrollY(scroll);
			setScrollYProgress(maxScroll > 0 ? scroll / maxScroll : 0);
			ticking = false;
		};

		const handleScroll = () => {
			if (!ticking) {
				rafRef.current = requestAnimationFrame(updateScroll);
				ticking = true;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		updateScroll();
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return { scrollY, scrollYProgress };
};

export const useTransform = (value: any, inputRange: number[], outputRange: number[]) => {
	return useMemo(() => {
		if (typeof value !== 'number') return outputRange[0] || 0;
		if (value <= inputRange[0]) return outputRange[0];
		if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];

		for (let i = 0; i < inputRange.length - 1; i++) {
			if (value >= inputRange[i] && value <= inputRange[i + 1]) {
				const t = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
				return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
			}
		}

		return outputRange[0] || 0;
	}, [value, inputRange, outputRange]);
};

/**
 * Hook for scroll-based fade in/out animations
 * Returns opacity and transform values based on scroll position
 * 
 * @param options Configuration options
 * @param options.fadeInStart Scroll position where fade in starts (default: 0)
 * @param options.fadeInEnd Scroll position where fade in completes (default: 100)
 * @param options.fadeOutStart Scroll position where fade out starts (default: null, no fade out)
 * @param options.fadeOutEnd Scroll position where fade out completes (default: null)
 * @param options.yTransform Y-axis transform range [start, end] (default: [20, 0])
 * @param options.ref Optional ref to track scroll relative to element instead of window
 * 
 * @returns Object with opacity, y, and scrollY values
 */
export const useScrollFade = (options: {
	fadeInStart?: number;
	fadeInEnd?: number;
	fadeOutStart?: number | null;
	fadeOutEnd?: number | null;
	yTransform?: [number, number];
	ref?: React.RefObject<HTMLElement>;
} = {}) => {
	const {
		fadeInStart = 0,
		fadeInEnd = 100,
		fadeOutStart = null,
		fadeOutEnd = null,
		yTransform = [20, 0],
		ref
	} = options;

	const { scrollY, scrollYProgress } = useScroll();
	
	const opacity = useMemo(() => {
		if (ref?.current) {
			// Element-based scroll tracking would need IntersectionObserver
			// For now, use window scroll
			const scroll = scrollY;
			
			// Fade in
			if (scroll >= fadeInStart && scroll <= fadeInEnd) {
				const progress = (scroll - fadeInStart) / (fadeInEnd - fadeInStart);
				return Math.min(1, Math.max(0, progress));
			}
			
			// Fade out
			if (fadeOutStart !== null && fadeOutEnd !== null && scroll >= fadeOutStart && scroll <= fadeOutEnd) {
				const progress = (scroll - fadeOutStart) / (fadeOutEnd - fadeOutStart);
				return Math.min(1, Math.max(0, 1 - progress));
			}
			
			// Before fade in
			if (scroll < fadeInStart) return 0;
			
			// After fade out (if configured)
			if (fadeOutEnd !== null && scroll > fadeOutEnd) return 0;
			
			// Between fade in and fade out
			return 1;
		}
		
		// Window-based scroll
		const scroll = scrollY;
		
		// Fade in
		if (scroll >= fadeInStart && scroll <= fadeInEnd) {
			const progress = (scroll - fadeInStart) / (fadeInEnd - fadeInStart);
			return Math.min(1, Math.max(0, progress));
		}
		
		// Fade out
		if (fadeOutStart !== null && fadeOutEnd !== null && scroll >= fadeOutStart && scroll <= fadeOutEnd) {
			const progress = (scroll - fadeOutStart) / (fadeOutEnd - fadeOutStart);
			return Math.min(1, Math.max(0, 1 - progress));
		}
		
		// Before fade in
		if (scroll < fadeInStart) return 0;
		
		// After fade out (if configured)
		if (fadeOutEnd !== null && scroll > fadeOutEnd) return 0;
		
		// Between fade in and fade out
		return 1;
	}, [scrollY, fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd, ref]);
	
	const y = useTransform(scrollY, [fadeInStart, fadeInEnd], yTransform);
	
	return { opacity, y, scrollY };
};

export const useInView = (
	ref?: React.RefObject<HTMLElement>,
	options?: IntersectionObserverInit
) => {
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
	const valueRef = useRef(initial);

	return {
		get: () => valueRef.current,
		set: (newValue: number) => {
			valueRef.current = newValue;
		},
		on: () => {}, // Stub for compatibility
		off: () => {} // Stub for compatibility
	};
};

export const useSpring = (
	value: any,
	config?: { stiffness?: number; damping?: number; mass?: number }
) => {
	const [springValue, setSpringValue] = useState(typeof value === 'number' ? value : 0);
	const rafRef = useRef<number | null>(null);
	const stateRef = useRef({
		current: springValue,
		target: typeof value === 'number' ? value : 0,
		velocity: 0
	});

	useEffect(() => {
		const stiffness = config?.stiffness || 100;
		const damping = config?.damping || 10;
		const mass = config?.mass || 1;
		const target = typeof value === 'number' ? value : 0;

		stateRef.current.target = target;

		const animate = () => {
			const state = stateRef.current;
			const result = springPhysics(
				state.current,
				state.target,
				state.velocity,
				stiffness,
				damping,
				mass
			);

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
