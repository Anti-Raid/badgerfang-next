'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Optimised Snowfall Effect
 * Uses HTML5 Canvas for high-performance particle rendering.
 * Features:
 * - Parallax depth (different sizes/speeds)
 * - Wind & Sway physics
 * - Mouse repulsion interaction
 * - RequestAnimationFrame for smooth 60fps
 */
export default function Snowfall() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mouseRef = useRef({ x: -1000, y: -1000 });

	// Use throttled mouse move for better performance (~60fps)
	const handleMouseMove = useCallback(
		(() => {
			let lastCall = 0;
			return (e: MouseEvent) => {
				const now = Date.now();
				if (now - lastCall >= 16) {
					lastCall = now;
					mouseRef.current = { x: e.clientX, y: e.clientY };
				}
			};
		})(),
		[]
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationFrameId: number;
		let particles: Particle[] = [];
		const particleCount = 100;

		const resize = () => {
			if (canvas) {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}
		};

		class Particle {
			x: number = 0;
			y: number = 0;
			size: number = 0;
			speedX: number = 0;
			speedY: number = 0;
			opacity: number = 0;
			wind: number = 0;
			sway: number = 0;
			swaySpeed: number = 0;

			constructor() {
				this.reset();
				this.y = Math.random() * window.innerHeight;
			}

			reset() {
				this.x = Math.random() * window.innerWidth;
				this.y = -20;
				this.size = Math.random() * 3 + 1; // 1px to 4px
				this.speedY = Math.random() * 1 + 0.5; // 0.5 to 1.5
				this.speedX = Math.random() * 0.5 - 0.25;
				this.opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
				this.wind = Math.random() * 0.02;
				this.sway = Math.random() * Math.PI * 2;
				this.swaySpeed = Math.random() * 0.03 + 0.01;
			}

			update() {
				// Base movement
				this.y += this.speedY * (this.size * 0.5); // Larger flakes fall faster (parallax)
				this.x += this.speedX + Math.sin(this.sway) * 0.5;
				this.sway += this.swaySpeed;

				// Mouse interaction
				const dx = this.x - mouseRef.current.x;
				const dy = this.y - mouseRef.current.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				const force = 100; // Interaction radius

				if (distance < force) {
					const angle = Math.atan2(dy, dx);
					const push = (force - distance) / force;
					this.x += Math.cos(angle) * push * 5;
					this.y += Math.sin(angle) * push * 2;
				}

				// Reset if out of bounds
				if (this.y > window.innerHeight + 10) {
					this.reset();
				}
				if (this.x > window.innerWidth + 10) {
					this.x = -10;
				} else if (this.x < -10) {
					this.x = window.innerWidth + 10;
				}
			}

			draw() {
				if (!ctx) return;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;

				// Added a subtle glow to larger flakes
				if (this.size > 2.5) {
					ctx.shadowBlur = 4;
					ctx.shadowColor = 'white';
				} else {
					ctx.shadowBlur = 0;
				}

				ctx.fill();
			}
		}

		const init = () => {
			particles = [];
			for (let i = 0; i < particleCount; i++) {
				particles.push(new Particle());
			}
		};

		const animate = () => {
			if (!ctx || !canvas) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			particles.forEach((p) => {
				p.update();
				p.draw();
			});
			animationFrameId = requestAnimationFrame(animate);
		};

		window.addEventListener('resize', resize);
		window.addEventListener('mousemove', handleMouseMove);

		resize();
		init();
		animate();

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', handleMouseMove);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				zIndex: 50, // Slightly lower than before but above content
				opacity: 0.8
			}}
			aria-hidden="true"
		/>
	);
}
