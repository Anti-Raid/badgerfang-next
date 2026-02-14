'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
				<div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-extra/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
			</div>

			{/* Main content */}
			<div className="relative flex flex-col items-center gap-8">
				{/* Animated logo */}
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					className="relative"
				>
					<div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
					<img
						src="/logo.webp"
						alt="AntiRaid"
						className="w-20 h-20 relative z-10 rounded-full"
					/>
				</motion.div>

				{/* Animated greeting */}
				<AnimatePresence mode="wait">
					<motion.h1
						key={word}
						initial={{ y: 20, opacity: 0, scale: 0.9 }}
						animate={{ y: 0, opacity: 1, scale: 1 }}
						exit={{ y: -20, opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className="text-5xl md:text-6xl font-bold text-foreground tracking-tight"
					>
						{word}
					</motion.h1>
				</AnimatePresence>

				{/* Loading indicator */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="flex items-center gap-1.5"
				>
					{[0, 1, 2].map((i) => (
						<motion.span
							key={i}
							className="w-2 h-2 bg-primary rounded-full"
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.5, 1, 0.5]
							}}
							transition={{
								duration: 0.8,
								repeat: Infinity,
								delay: i * 0.15
							}}
						/>
					))}
				</motion.div>

				{/* Skip hint */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.5 }}
					transition={{ delay: 1 }}
					className="absolute bottom-[-4rem] text-sm text-muted-foreground"
				>
					Click anywhere to skip
				</motion.p>
			</div>
		</div>
	);
};

export default Loading;
