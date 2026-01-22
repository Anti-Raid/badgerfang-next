/**
 * TanStack Pacer utilities for performance optimization
 * Provides debouncing, throttling, and rate limiting hooks for React
 */
import {
	useDebouncedCallback,
	useThrottledCallback,
	useDebouncedValue,
	useThrottledValue
} from '@tanstack/react-pacer';
import { useState, useEffect, useMemo } from 'react';

/**
 * Debounced search hook for search inputs
 * Delays execution until user stops typing
 */
export function useDebouncedSearch<T>(value: T, delay: number = 300): T {
	return useDebouncedValue(value, delay);
}

/**
 * Throttled scroll handler
 * Limits scroll event execution to improve performance
 */
export function useThrottledScroll(callback: (event: Event) => void, delay: number = 100) {
	const throttledCallback = useThrottledCallback(callback, delay);

	useEffect(() => {
		window.addEventListener('scroll', throttledCallback, { passive: true });
		return () => window.removeEventListener('scroll', throttledCallback);
	}, [throttledCallback]);
}

/**
 * Throttled mouse move handler
 * Limits mouse move event execution for better performance
 */
export function useThrottledMouseMove(
	callback: (event: MouseEvent) => void,
	delay: number = 16 // ~60fps
) {
	const throttledCallback = useThrottledCallback(callback, delay);

	useEffect(() => {
		window.addEventListener('mousemove', throttledCallback, { passive: true });
		return () => window.removeEventListener('mousemove', throttledCallback);
	}, [throttledCallback]);
}

/**
 * Debounced input value for form inputs
 * Returns debounced value that updates after user stops typing
 */
export function useDebouncedInput(initialValue: string = '', delay: number = 300) {
	return useDebouncedValue(initialValue, delay);
}

/**
 * Throttled value hook
 * Limits value updates to improve performance
 */
export function useThrottledValueHook<T>(value: T, delay: number = 100): T {
	const throttled = useThrottledValue(value, delay);
	return throttled;
}

/**
 * Throttled resize handler
 * Limits window resize event execution
 */
export function useThrottledResize(callback: (event: UIEvent) => void, delay: number = 150) {
	const throttledCallback = useThrottledCallback(callback, delay);

	useEffect(() => {
		window.addEventListener('resize', throttledCallback, { passive: true });
		return () => window.removeEventListener('resize', throttledCallback);
	}, [throttledCallback]);
}
