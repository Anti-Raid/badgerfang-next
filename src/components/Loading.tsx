'use client';
import { useState, useEffect, useCallback } from 'react';

interface LoadingProps {
	onClose: () => void;
}

const words = [
	'Hello',
	'નમસ્તે',
	'Ciao',
	'こんにちは',
	'Hola',
	'안녕',
	'Bonjour',
	'Olá',
	'Hallo',
	'你好',
	'नमस्ते'
];

const Loading: React.FC<LoadingProps> = ({ onClose }) => {
	const [index, setIndex] = useState(0);
	const [intervalDuration, setIntervalDuration] = useState(200);
	const [done, setDone] = useState(false);

	const close = useCallback(() => {
		setDone(true);
		onClose();
	}, [onClose]);

	useEffect(() => {
		const switchWord = () => {
			setIntervalDuration(200 - index * 10);
			if (index >= words.length - 1) {
				setTimeout(close, 1500);
			} else {
				setIndex((i) => i + 1);
			}
		};
		const run = setInterval(switchWord, intervalDuration);
		return () => clearInterval(run);
	}, [index, intervalDuration, close]);

	useEffect(() => {
		document.body.addEventListener('click', close);
		return () => document.body.removeEventListener('click', close);
	}, [close]);

	const progress = (index / (words.length - 1)) * 100;

	return (
		<div
			className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${done ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
			role="status"
			aria-live="polite"
			aria-label="Loading"
		>
			{/* Background */}
			<div className="absolute inset-0 overflow-hidden" aria-hidden="true">
				<div
					className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] animate-pulse"
					style={{ animationDuration: '4s' }}
				/>
				<div
					className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-extra/8 rounded-full blur-[120px] animate-pulse"
					style={{ animationDuration: '6s', animationDelay: '2s' }}
				/>
			</div>

			{/* Center content */}
			<div className="relative flex flex-col items-center gap-10 animate-in fade-in-0 zoom-in-95 duration-500">
				{/* Logo with spinning ring */}
				<div className="relative flex items-center justify-center">
					{/* Outer spin ring */}
					<div
						className="absolute w-28 h-28 rounded-full border-2 border-primary/15 border-t-primary animate-spin"
						style={{ animationDuration: '2s' }}
					/>
					{/* Inner pulse ring */}
					<div
						className="absolute w-24 h-24 rounded-full border border-primary/20 animate-pulse"
						style={{ animationDuration: '2s' }}
					/>
					{/* Logo */}
					<div className="relative z-10 w-16 h-16">
						<div className="absolute inset-0 bg-primary/25 blur-xl rounded-full" />
						<img src="/logo.webp" alt="AntiRaid" className="w-16 h-16 relative z-10 rounded-full" />
					</div>
				</div>

				{/* Greeting word */}
				<div className="h-20 flex items-center justify-center overflow-hidden">
					<h1
						key={index}
						className="text-6xl md:text-7xl font-bold tracking-tight animate-in fade-in-0 slide-in-from-bottom-4 duration-200 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
						style={{ backgroundSize: '200% 100%' }}
					>
						{words[index]}
					</h1>
				</div>

				{/* Progress bar */}
				<div className="w-48 flex flex-col items-center gap-3">
					<div className="w-full h-px bg-border rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-primary to-extra rounded-full transition-all duration-300 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="text-xs text-muted-foreground/50 tracking-widest uppercase">AntiRaid</p>
				</div>
			</div>

			{/* Skip hint */}
			<p className="absolute bottom-10 text-xs text-muted-foreground/40 animate-in fade-in-0 duration-700 delay-1000">
				Click anywhere to skip
			</p>
		</div>
	);
};

export default Loading;
