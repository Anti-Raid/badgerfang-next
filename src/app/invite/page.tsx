'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDiscord } from 'react-icons/fa';
import Head from 'next/head';
import { supportConfig } from '@/lib/data/support';

export default function DiscordRedirect() {
	useEffect(() => {
		const timer = setTimeout(() => {
			window.location.href = supportConfig.invite.basic;
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground" role="status" aria-live="polite">
			<Head>
				<title>Redirecting to Discord...</title>
			</Head>

			<div className="flex flex-col items-center">
				{/* Spinning Discord Logo */}
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{
						scale: 1,
						opacity: 1,
						rotate: [0, 360]
					}}
					transition={{
						duration: 2,
						rotate: {
							duration: 1.5,
							repeat: Infinity,
							ease: 'linear'
						}
					}}
					className="text-primary mb-8"
					aria-hidden="true"
				>
					<FaDiscord size={80} />
				</motion.div>

				{/* Loading Text */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className="text-xl font-medium"
				>
					Redirecting you to the invite page!
				</motion.div>

				{/* Loading Dots */}
				<motion.div className="flex mt-4 space-x-2" aria-hidden="true">
					{[0, 1, 2].map((index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 0 }}
							animate={{
								opacity: [0, 1, 0],
								y: [0, -10, 0]
							}}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								delay: index * 0.2
							}}
							className="w-3 h-3 rounded-full bg-primary"
						/>
					))}
				</motion.div>
			</div>
		</div>
	);
}
