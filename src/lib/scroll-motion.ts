'use client';

import { useEffect, useMemo, useState, type RefObject } from 'react';

type MotionValueLike = { get?: () => number } | number;

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
	ref: RefObject<Element | null>,
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
