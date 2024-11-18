'use client';
import { useState, useEffect } from 'react';

interface LoadingProps {
	onClose: () => void;
}

const Loading: React.FC<LoadingProps> = ({ onClose }) => {
	const words: string[] = [
		'Hello',
		'નમસ્તે',
		'CIAO',
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

	useEffect(() => {
		const switchWord = () => {
			setIntervalDuration(200 - index * 10);

			if (index >= words.length - 1) {
				setTimeout(() => {
					setIsFinished(true);
					onClose();
				}, 2000);
			} else setIndex((prevIndex) => prevIndex + 1);

			setWord(words[index]);
		};

		const run = setInterval(switchWord, intervalDuration);
		return () => clearInterval(run);
	}, [index, intervalDuration, words]);

	const close = () => {
		setIsFinished(true);
		onClose();
	};

	useEffect(() => {
		document.body.addEventListener('click', close);
		return () => document.body.removeEventListener('click', close);
	}, []);

	return (
		<div className="bg-purple-600/50 grid place-items-center min-h-screen overflow-none">
			<ol className="list-disc">
				<li className="text-foreground font-cursive non-italic font-extrabold text-5xl">{word}</li>
			</ol>
		</div>
	);
};

export default Loading;
