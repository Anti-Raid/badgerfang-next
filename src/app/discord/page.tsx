'use client';
import { useEffect } from 'react';
import { FaDiscord } from 'react-icons/fa';
import Head from 'next/head';

export default function DiscordRedirect() {
	const DISCORD_URL = 'https://discord.gg/rCtD9RqWJf';

	useEffect(() => {
		const timer = setTimeout(() => {
			window.location.href = DISCORD_URL;
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground"
			role="status"
			aria-live="polite"
		>
			<Head>
				<title>Redirecting to Discord...</title>
			</Head>

			<div className="flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-500">
				{/* Spinning Discord Logo */}
				<div
					className="text-primary mb-8 animate-spin"
					style={{ animationDuration: '1.5s' }}
					aria-hidden="true"
				>
					<FaDiscord size={80} />
				</div>

				{/* Loading Text */}
				<div className="text-xl font-medium animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
					Redirecting you to our Discord server!
				</div>

				{/* Loading Dots */}
				<div className="flex mt-4 space-x-2" aria-hidden="true">
					{[0, 1, 2].map((index) => (
						<div
							key={index}
							className="w-3 h-3 rounded-full bg-primary animate-bounce"
							style={{ animationDelay: `${index * 0.2}s`, animationDuration: '1.5s' }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
