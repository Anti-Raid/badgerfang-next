'use client';
import { useState, useEffect, useCallback } from 'react';

interface LoadingProps {
	onClose: () => void;
}

const Loading: React.FC<LoadingProps> = ({ onClose }) => {
	const words: string[] = [
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

	const [index, setIndex] = useState(0);
	const [word, setWord] = useState(words[index]);
	const [intervalDuration, setIntervalDuration] = useState(200);
	const [isFinished, setIsFinished] = useState(false);

	const close = useCallback(() => {
		setIsFinished(true);
		onClose();
	}, [onClose]);

	useEffect(() => {
		const switchWord = () => {
			setIntervalDuration(200 - index * 10);

			if (index >= words.length - 1) {
				setTimeout(() => {
					setIsFinished(true);
					onClose();
				}, 1500);
			} else setIndex((prevIndex) => prevIndex + 1);

			setWord(words[index]);
		};

		const run = setInterval(switchWord, intervalDuration);
		return () => clearInterval(run);
	}, [index, intervalDuration, words, onClose]);

	useEffect(() => {
		document.body.addEventListener('click', close);
		return () => document.body.removeEventListener('click', close);
	}, [close]);

	return (
		<div
			className="fixed inset-0 z-[9999] bg-background grid place-items-center overflow-hidden"
			role="status"
			aria-live="polite"
			aria-label="Loading"
		>
			{/* Background gradient orbs */}
			<div className="absolute inset-0 overflow-hidden" aria-hidden="true">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
				<div
					className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-extra/15 rounded-full blur-[100px] animate-pulse-glow"
					style={{ animationDelay: '1s' }}
				/>
			</div>

			{/* Main content */}
			<div className="relative flex flex-col items-center gap-8">
				{/* Logo */}
				<div className="relative animate-in fade-in-0 zoom-in-95 duration-500">
					<div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
					<img src="/logo.webp" alt="AntiRaid" className="w-20 h-20 relative z-10 rounded-full" />
				</div>

				{/* Cycling greeting — key forces re-mount for each new word */}
				<h1
					key={word}
					className="text-5xl md:text-6xl font-bold text-foreground tracking-tight animate-in fade-in-0 zoom-in-95 duration-200"
				>
					{word}
				</h1>

				{/* Loading indicator */}
				<div className="flex items-center gap-1.5 animate-in fade-in-0 duration-500 delay-300">
					{[0, 1, 2].map((i) => (
						<span
							key={i}
							className="w-2 h-2 bg-primary rounded-full animate-pulse"
							style={{ animationDelay: `${i * 0.15}s` }}
						/>
					))}
				</div>

				{/* Skip hint */}
				<p className="absolute bottom-[-4rem] text-sm text-muted-foreground opacity-50 animate-in fade-in-0 duration-500 delay-1000">
					Click anywhere to skip
				</p>
			</div>
		</div>
	);
};

export default Loading;
