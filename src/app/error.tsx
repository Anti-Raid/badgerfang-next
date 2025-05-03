'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight, RefreshCcw, AlertOctagon } from 'lucide-react';
import { Primary, Secondary, Ghost } from '@/components/ui/Buttons';

type ErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

const ParticlesBackground = () => {
	const [particles, setParticles] = useState<
		Array<{
			x: number;
			y: number;
			size: number;
			speedX: number;
			speedY: number;
			opacity: number;
		}>
	>([]);

	useEffect(() => {
		const createParticles = () => {
			const newParticles = [];
			for (let i = 0; i < 50; i++) {
				newParticles.push({
					x: Math.random() * window.innerWidth,
					y: Math.random() * window.innerHeight,
					size: Math.random() * 4 + 1,
					speedX: (Math.random() - 0.5) * 0.5,
					speedY: (Math.random() - 0.5) * 0.5,
					opacity: Math.random() * 0.5 + 0.1
				});
			}
			setParticles(newParticles);
		};

		createParticles();

		const updateParticles = () => {
			setParticles((prev) =>
				prev.map((particle) => {
					let newX = particle.x + particle.speedX;
					let newY = particle.y + particle.speedY;

					if (newX < 0 || newX > window.innerWidth) {
						particle.speedX *= -1;
					}

					if (newY < 0 || newY > window.innerHeight) {
						particle.speedY *= -1;
					}

					return {
						...particle,
						x: newX,
						y: newY
					};
				})
			);
		};

		const interval = setInterval(updateParticles, 50);
		const resizeHandler = () => createParticles();

		window.addEventListener('resize', resizeHandler);

		return () => {
			clearInterval(interval);
			window.removeEventListener('resize', resizeHandler);
		};
	}, []);

	return (
		<div className="fixed inset-0 z-0 pointer-events-none">
			{particles.map((particle, index) => (
				<div
					key={index}
					className="absolute rounded-full bg-primary"
					style={{
						left: particle.x,
						top: particle.y,
						width: particle.size,
						height: particle.size,
						opacity: particle.opacity
					}}
				/>
			))}
		</div>
	);
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
	const [isGlitching, setIsGlitching] = useState(false);

	useEffect(() => {
		const glitchInterval = setInterval(() => {
			setIsGlitching(true);
			setTimeout(() => setIsGlitching(false), 200);
		}, 3000);

		console.error('Global error caught:', error);

		return () => clearInterval(glitchInterval);
	}, [error]);

	const statusCode = 500;
	const title = 'Unexpected Error';
	const description = error.message || 'Something went wrong on our end.';

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background text-foreground p-4">
			<ParticlesBackground />

			<div className="relative z-10 max-w-3xl w-full">
				<div className="flex flex-col items-center text-center">
					<div
						className={`mb-6 font-mono text-8xl font-bold tracking-tighter ${isGlitching ? 'animate-pulse' : ''}`}
					>
						<span className="text-primary">{statusCode}</span>
					</div>

					<div className="relative mb-8">
						<div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
						<div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-background border-2 border-primary">
							<AlertOctagon className="h-12 w-12 text-primary animate-spin-slow" />
						</div>
					</div>

					<h1 className={`text-4xl font-bold mb-4 ${isGlitching ? 'animate-glitch' : ''}`}>
						{title}
					</h1>
					<p className="text-lg text-muted-foreground mb-8 max-w-md">{description}</p>

					<div className="flex flex-wrap gap-4 justify-center">
						<Link href="/">
							<Primary Title="Return Home" icon={ArrowRight} onClick={() => {}} />
						</Link>
						<Primary Title="Try Again" icon={RefreshCcw} onClick={reset} />
						<Ghost Title="Dismiss" icon={X} onClick={() => {}} />
					</div>

					<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 opacity-50 rounded-full blur-3xl"></div>
				</div>

				<div className="hidden md:block absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-xl"></div>
				<div className="hidden md:block absolute -bottom-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-xl"></div>
				<div className="hidden md:block absolute top-1/4 right-10 w-20 h-20 bg-primary/20 rounded-full blur-lg"></div>
			</div>

			<div className="absolute bottom-8 text-center text-sm text-muted-foreground">
				<p>If you continue experiencing issues, please contact our support team.</p>
			</div>

			<style jsx global>{`
				@keyframes spin-slow {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}

				@keyframes glitch {
					0% {
						transform: translate(0);
					}
					20% {
						transform: translate(-2px, 2px);
					}
					40% {
						transform: translate(-2px, -2px);
					}
					60% {
						transform: translate(2px, 2px);
					}
					80% {
						transform: translate(2px, -2px);
					}
					100% {
						transform: translate(0);
					}
				}

				.animate-spin-slow {
					animation: spin-slow 6s linear infinite;
				}

				.animate-glitch {
					animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
				}
			`}</style>
		</div>
	);
};

export default ErrorPage;
