'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';

export type Variants = Record<string, Record<string, unknown>>;

type MotionStyle = React.CSSProperties & Record<string, unknown>;
type MotionValueLike = { get?: () => number } | number;
type MotionTarget = Record<string, unknown>;

type MotionProps<T extends HTMLElement = HTMLDivElement> = React.HTMLAttributes<T> & {
	as?: keyof JSX.IntrinsicElements;
	style?: MotionStyle;
	initial?: unknown;
	animate?: unknown;
	exit?: unknown;
	transition?: unknown;
	variants?: Variants;
	whileHover?: unknown;
	whileTap?: unknown;
	whileInView?: unknown;
	viewport?: unknown;
	layout?: unknown;
	layoutId?: string;
	drag?: boolean | 'x' | 'y';
	dragConstraints?: unknown;
	dragElastic?: number;
	dragMomentum?: boolean;
	onDragStart?: (...args: unknown[]) => void;
	onDrag?: (...args: unknown[]) => void;
	onDragEnd?: (...args: unknown[]) => void;
};

const MOTION_STYLE_KEYS = new Set(['x', 'y', 'scale', 'rotate', 'opacity']);

const stripMotionProps = <T extends Record<string, unknown>>(props: T): Record<string, unknown> => {
	const {
		initial,
		animate,
		exit,
		transition,
		variants,
		whileHover,
		whileTap,
		whileInView,
		viewport,
		layout,
		layoutId,
		drag,
		dragConstraints,
		dragElastic,
		dragMomentum,
		onDragStart,
		onDrag,
		onDragEnd,
		...rest
	} = props;
	return rest;
};

const resolveTarget = (target: unknown, variants?: Variants): MotionTarget => {
	if (!target) return {};
	if (typeof target === 'string') return variants?.[target] ?? {};
	if (typeof target === 'object' && !Array.isArray(target)) return target as MotionTarget;
	return {};
};

const toCssUnit = (value: unknown): string | undefined => {
	if (typeof value === 'number') return `${value}px`;
	if (typeof value === 'string') return value;
	return undefined;
};

const toCssValue = (value: unknown): string | number | undefined => {
	if (Array.isArray(value)) return toCssValue(value[value.length - 1]);
	if (typeof value === 'number' || typeof value === 'string') return value;
	return undefined;
};

const normalizeTransition = (transition: unknown): React.CSSProperties => {
	const config = transition && typeof transition === 'object' ? (transition as MotionTarget) : {};
	const duration =
		typeof config.duration === 'number' ? config.duration : typeof config.type === 'string' ? 0.35 : 0.45;
	const delay = typeof config.delay === 'number' ? config.delay : 0;
	const ease = Array.isArray(config.ease) ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.22, 1, 0.36, 1)';

	return {
		transitionProperty: 'opacity, transform, filter, background-color, border-color, color, box-shadow',
		transitionDuration: `${duration}s`,
		transitionDelay: delay ? `${delay}s` : undefined,
		transitionTimingFunction: ease
	};
};

const targetToStyle = (target: MotionTarget, baseStyle?: MotionStyle): React.CSSProperties => {
	const x = toCssUnit(target.x ?? baseStyle?.x);
	const y = toCssUnit(target.y ?? baseStyle?.y);
	const scale = toCssValue(target.scale ?? baseStyle?.scale);
	const rotate = toCssValue(target.rotate ?? baseStyle?.rotate);

	const transforms = [
		x || y ? `translate3d(${x ?? '0px'}, ${y ?? '0px'}, 0)` : null,
		scale !== undefined ? `scale(${scale})` : null,
		rotate !== undefined ? `rotate(${typeof rotate === 'number' ? `${rotate}deg` : rotate})` : null
	].filter(Boolean);

	const nextStyle: React.CSSProperties = {};
	for (const [key, value] of Object.entries(target)) {
		if (MOTION_STYLE_KEYS.has(key) || key === 'transition') continue;
		const cssValue = toCssValue(value);
		if (cssValue !== undefined) {
			(nextStyle as MotionStyle)[key] = cssValue;
		}
	}

	const opacity = toCssValue(target.opacity ?? baseStyle?.opacity);
	if (opacity !== undefined) nextStyle.opacity = Number(opacity);
	if (transforms.length > 0) {
		nextStyle.transform = [baseStyle?.transform, ...transforms].filter(Boolean).join(' ');
		nextStyle.willChange = 'opacity, transform';
	}

	return nextStyle;
};

const useMotionInView = (
	ref: React.RefObject<HTMLElement | null>,
	enabled: boolean,
	viewport: unknown
) => {
	const [inView, setInView] = useState(!enabled);
	const viewportConfig =
		viewport && typeof viewport === 'object' ? (viewport as { once?: boolean; margin?: string; amount?: number }) : {};

	useEffect(() => {
		if (!enabled) return;
		const node = ref.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries[0]?.isIntersecting ?? false;
				setInView((prev) => (viewportConfig.once ? prev || visible : visible));
				if (visible && viewportConfig.once) observer.disconnect();
			},
			{
				rootMargin: viewportConfig.margin,
				threshold: viewportConfig.amount ?? 0.15
			}
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [enabled, viewportConfig.once, viewportConfig.margin, viewportConfig.amount, ref]);

	return inView;
};

const createMotionComponent = (tag: keyof JSX.IntrinsicElements) =>
	React.forwardRef<HTMLElement, MotionProps>((props, ref) => {
		const {
			as,
			style,
			initial,
			animate,
			transition,
			variants,
			whileHover,
			whileTap,
			whileInView,
			viewport,
			onMouseEnter,
			onMouseLeave,
			onPointerDown,
			onPointerUp,
			onPointerCancel,
			...raw
		} = props;
		const Comp = (as ?? tag) as keyof JSX.IntrinsicElements;
		const localRef = useRef<HTMLElement | null>(null);
		const [mounted, setMounted] = useState(false);
		const [isHovered, setIsHovered] = useState(false);
		const [isPressed, setIsPressed] = useState(false);
		const inView = useMotionInView(localRef, Boolean(whileInView), viewport);

		useEffect(() => {
			const frame = requestAnimationFrame(() => setMounted(true));
			return () => cancelAnimationFrame(frame);
		}, []);

		const baseTarget = useMemo(() => {
			if (whileInView) return inView ? resolveTarget(whileInView, variants) : resolveTarget(initial, variants);
			if (!mounted && initial !== false) return resolveTarget(initial, variants);
			return resolveTarget(animate, variants);
		}, [animate, initial, inView, mounted, variants, whileInView]);

		const interactiveTarget = isPressed
			? resolveTarget(whileTap, variants)
			: isHovered
				? resolveTarget(whileHover, variants)
				: {};

		const mergedTarget = { ...baseTarget, ...interactiveTarget };
		const motionStyle = {
			...style,
			...normalizeTransition(transition),
			...targetToStyle(mergedTarget, style)
		};

		const clean = stripMotionProps(raw as Record<string, unknown>);
		const setRefs = (node: HTMLElement | null) => {
			localRef.current = node;
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
		};

		return React.createElement(Comp, {
			...(clean as object),
			ref: setRefs,
			style: motionStyle,
			onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
				setIsHovered(true);
				onMouseEnter?.(event);
			},
			onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
				setIsHovered(false);
				setIsPressed(false);
				onMouseLeave?.(event);
			},
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
				setIsPressed(true);
				onPointerDown?.(event);
			},
			onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
				setIsPressed(false);
				onPointerUp?.(event);
			},
			onPointerCancel: (event: React.PointerEvent<HTMLElement>) => {
				setIsPressed(false);
				onPointerCancel?.(event);
			}
		});
	});

type MotionFactory = Record<string, React.ComponentType<any>>;

export const motion: MotionFactory = new Proxy(
	{},
	{
		get: (_target, prop: string) => createMotionComponent(prop as keyof JSX.IntrinsicElements)
	}
) as MotionFactory;

interface AnimatePresenceProps {
	children?: React.ReactNode;
	mode?: 'sync' | 'wait' | 'popLayout';
	initial?: boolean;
}

export const AnimatePresence: React.FC<AnimatePresenceProps> = ({ children }) => <>{children}</>;

interface ReorderGroupProps<T> extends MotionProps {
	as?: keyof JSX.IntrinsicElements;
	values: T[];
	onReorder: (values: T[]) => void;
	axis?: 'x' | 'y';
}

interface ReorderItemProps extends MotionProps {
	as?: keyof JSX.IntrinsicElements;
	value: unknown;
}

const ReorderGroupComponent = <T,>(props: ReorderGroupProps<T>) => {
	const { as = 'div', children, ...rest } = props;
	const clean = stripMotionProps(rest as Record<string, unknown>);
	return React.createElement(as, clean, children);
};

const ReorderItemComponent = React.forwardRef<HTMLElement, ReorderItemProps>((props, ref) => {
	const { as = 'div', children, ...rest } = props;
	const clean = stripMotionProps(rest as Record<string, unknown>);
	return React.createElement(as, { ...(clean as object), ref }, children);
});

export const Reorder = {
	Group: ReorderGroupComponent,
	Item: ReorderItemComponent
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const toNumber = (value: MotionValueLike): number => {
	if (typeof value === 'number') return value;
	if (value && typeof value === 'object' && typeof value.get === 'function') return value.get();
	return 0;
};

const interpolate = (value: number, inputRange: number[], outputRange: number[]): number => {
	if (inputRange.length < 2 || outputRange.length < 2) return outputRange[0] ?? 0;

	const start = inputRange[0] ?? 0;
	const end = inputRange[inputRange.length - 1] ?? 1;
	const progress = start === end ? 0 : clamp((value - start) / (end - start), 0, 1);
	const outStart = outputRange[0] ?? 0;
	const outEnd = outputRange[outputRange.length - 1] ?? 0;

	return outStart + (outEnd - outStart) * progress;
};

export const useScroll = () => {
	const [scrollY, setScrollY] = useState(0);
	const [scrollYProgress, setScrollYProgress] = useState(0);

	useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY || window.pageYOffset || 0;
			const maxScrollable = Math.max(
				1,
				document.documentElement.scrollHeight - window.innerHeight
			);
			setScrollY(y);
			setScrollYProgress(clamp(y / maxScrollable, 0, 1));
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, []);

	return { scrollY, scrollYProgress };
};

export const useTransform = (
	value: MotionValueLike,
	inputRange: number[],
	outputRange: number[]
): number => {
	return useMemo(
		() => interpolate(toNumber(value), inputRange, outputRange),
		[value, inputRange, outputRange]
	);
};

export const useInView = (
	ref: React.RefObject<Element | null>,
	options?: { once?: boolean; margin?: string; amount?: number }
): boolean => {
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries[0]?.isIntersecting ?? false;
				setInView((prev) => (options?.once ? prev || visible : visible));
				if (visible && options?.once) observer.disconnect();
			},
			{
				rootMargin: options?.margin,
				threshold: options?.amount ?? 0
			}
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [ref, options?.once, options?.margin, options?.amount]);

	return inView;
};

export const useMotionValue = (initial: number) => {
	const [value, setValue] = useState(initial);
	return useMemo(
		() => ({
			get: () => value,
			set: (next: number) => setValue(next)
		}),
		[value]
	);
};

export const useSpring = (value: MotionValueLike, _config?: Record<string, unknown>): number => {
	return toNumber(value);
};

export const useScrollFade = (options: { fadeInStart?: number; fadeInEnd?: number } = {}) => {
	const { scrollY } = useScroll();
	const fadeInStart = options.fadeInStart ?? 0;
	const fadeInEnd = options.fadeInEnd ?? 200;
	const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1]);
	const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0]);
	return { opacity, y };
};
