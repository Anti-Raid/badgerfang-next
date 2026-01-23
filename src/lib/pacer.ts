/**
 * TanStack Pacer utilities for performance optimization
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useThrottledCallback } from '@tanstack/react-pacer'

/**
 * Debounced search hook for search inputs
 */
export function useDebouncedSearch<T>(value: T, delay: number = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay)
		return () => clearTimeout(timer)
	}, [value, delay])

	return debouncedValue
}

/**
 * Throttled scroll handler
 */
export function useThrottedScroll(callback: (e: Event) => void, delay = 100) {
	// ❗ hook must be called here, not inside useEffect
	const throttledCallback = useThrottledCallback(callback, { wait: delay })

	useEffect(() => {
		window.addEventListener('scroll', throttledCallback, { passive: true })
		return () => window.removeEventListener('scroll', throttledCallback)
	}, [throttledCallback])
}

/**
 * Throttled mouse move handler
 */
export function useThrottledMouseMove(callback: (e: MouseEvent) => void, delay = 16) {
	const throttledCallback = useThrottledCallback(callback, { wait: delay })

	useEffect(() => {
		window.addEventListener('mousemove', throttledCallback, { passive: true })
		return () => window.removeEventListener('mousemove', throttledCallback)
	}, [throttledCallback])
}

/**
 * Debounced input value
 */
export function useDebouncedInput(initialValue = '', delay = 300) {
	const [debouncedValue, setDebouncedValue] = useState(initialValue)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(initialValue), delay)
		return () => clearTimeout(timer)
	}, [initialValue, delay])

	return debouncedValue
}

/**
 * Throttled value hook
 */
export function useThrottledValueHook<T>(value: T, delay = 100): T {
	const [throttledValue, setThrottledValue] = useState(value)
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(() => setThrottledValue(value), Math.max(delay, 16))

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [value, delay])

	return throttledValue
}

/**
 * Throttled resize handler
 */
export function useThrottledResize(callback: (e: UIEvent) => void, delay = 150) {
	const throttledCallback = useThrottledCallback(callback, { wait: delay })

	useEffect(() => {
		window.addEventListener('resize', throttledCallback, { passive: true })
		return () => window.removeEventListener('resize', throttledCallback)
	}, [throttledCallback])
}
