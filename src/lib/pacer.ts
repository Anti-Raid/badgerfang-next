/**
 * TanStack Pacer utilities for performance optimization
 * Provides debouncing, throttling, and rate limiting hooks for React
 */
import { useState, useEffect } from 'react';

/**
 * Debounced search hook for search inputs
 * Delays execution until user stops typing
 */
export function useDebouncedSearch<T>(value: T, delay: number = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}

/**
 * Throttled scroll handler
 * Limits scroll event execution to improve performance
 */
export function useThrottledScroll(callback: (event: Event) => void, delay: number = 100) {
	useEffect(() => {
		let lastCall = 0;
		const throttledCallback = (event: Event) => {
			const now = Date.now();
			if (now - lastCall >= delay) {
				lastCall = now;
				callback(event);
			}
		};

		window.addEventListener('scroll', throttledCallback, { passive: true });
		return () => window.removeEventListener('scroll', throttledCallback);
	}, [callback, delay]);
}

/**
 * Throttled mouse move handler
 * Limits mouse move event execution for better performance
 */
export function useThrottledMouseMove(
	callback: (event: MouseEvent) => void,
	delay: number = 16 // ~60fps
) {
	useEffect(() => {
		let lastCall = 0;
		const throttledCallback = (event: MouseEvent) => {
			const now = Date.now();
			if (now - lastCall >= delay) {
				lastCall = now;
				callback(event);
			}
		};

		window.addEventListener('mousemove', throttledCallback, { passive: true });
		return () => window.removeEventListener('mousemove', throttledCallback);
	}, [callback, delay]);
}

/**
 * Debounced input value for form inputs
 * Returns debounced value that updates after user stops typing
 */
export function useDebouncedInput(initialValue: string = '', delay: number = 300) {
	const [debouncedValue, setDebouncedValue] = useState<string>(initialValue);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(initialValue);
		}, delay);

		return () => clearTimeout(timer);
	}, [initialValue, delay]);

	return debouncedValue;
}

/**
 * Throttled value hook
 * Limits value updates to improve performance
 */
export function useThrottledValueHook<T>(value: T, delay: number = 100): T {
	const [throttledValue, setThrottledValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setThrottledValue(value);
		}, Math.max(delay, 16)); // Ensure minimum 16ms

		return () => clearTimeout(timer);
	}, [value, delay]);

	return throttledValue;
}

/**
 * Throttled resize handler
 * Limits window resize event execution
 */
export function useThrottledResize(callback: (event: UIEvent) => void, delay: number = 150) {
	useEffect(() => {
		let lastCall = 0;
		const throttledCallback = (event: UIEvent) => {
			const now = Date.now();
			if (now - lastCall >= delay) {
				lastCall = now;
				callback(event);
			}
		};

		window.addEventListener('resize', throttledCallback, { passive: true });
		return () => window.removeEventListener('resize', throttledCallback);
	}, [callback, delay]);
}
