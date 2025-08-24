'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TemplateCarousel } from './scriptCarosel';
import { Primary, Secondary } from '../ui/Buttons';
import { GoArrowUpRight } from 'react-icons/go';
import { ReviewsCarousel } from './reviewCarosel';
import { getBotStats } from '@/lib/api';
import { motion, Variants } from 'framer-motion';
import { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';

const ServerIcons = () => {
	const servers = [
		{ name: 'Purrquinox', icon: 'https://purrquinox.com/_next/image?url=%2Flogo.png&w=32&q=75' },
		{ name: 'Server 2', icon: null },
		{ name: 'Server 3', icon: null },
		{ name: 'Server 4', icon: null }
	];

	const FallbackSVG = () => (
		<svg
			className="w-8 h-8 text-primary/80 group-hover:text-primary transition-all duration-300"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
		</svg>
	);

	return (
		<div className="flex justify-center gap-6 mt-8">
			{servers.map((server, index) => (
				<div
					key={index}
					className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-md overflow-hidden group relative"
				>
					{server.icon ? (
						<img src={server.icon} alt={server.name} className="w-8 h-8" />
					) : (
						<FallbackSVG />
					)}
					<div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-bold">
						{server.name}
					</div>
				</div>
			))}
		</div>
	);
};

const Hero = () => {
	const [serverCount, setServerCount] = useState(0);
	const [stats, setStats] = useState<GetStatusResponse | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const heroRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsVisible(true);
		const fetchStats = async () => {
			try {
				const botState = await getBotStats();
				const data = botState;
				setStats(data);
			} catch (error) {
				console.error('Error fetching stats:', error);
			}
		};
		fetchStats();
	}, []);

	const updateCount = useCallback((targetCount: number, increment: number) => {
		setServerCount((prevCount) => {
			if (prevCount < targetCount) {
				const newCount = Math.ceil(prevCount + increment);
				return newCount >= targetCount ? targetCount : newCount;
			}
			return prevCount;
		});
	}, []);

	useEffect(() => {
		if (!stats?.total_guilds) return;

		const targetCount = stats.total_guilds;
		const increment = targetCount / 150;

		// Reset server count when target changes
		setServerCount(0);

		const intervalId = setInterval(() => updateCount(targetCount, increment), 10);
		return () => clearInterval(intervalId);
	}, [stats?.total_guilds, updateCount]);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2
			}
		}
	};

	const itemVariants: Variants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: 'spring', stiffness: 100 }
		}
	};

	return (
		<>
			<section className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 pt-10 pb-0">
				{/* Animated background elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div
						className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse"
						style={{ animationDuration: '8s' }}
					></div>
					<div
						className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse"
						style={{ animationDuration: '10s' }}
					></div>
					<div
						className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px] animate-pulse"
						style={{ animationDuration: '12s' }}
					></div>

					{/* Grid overlay */}
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iIzI3MjUzRiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgc3Ryb2tlPSIjMjcyNTNGIiBzdHJva2Utb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
				</div>

				<main className="container mx-auto px-4 py-16 relative z-10" ref={heroRef}>
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate={isVisible ? 'visible' : 'hidden'}
						className="text-center mb-8"
					>
						<motion.div
							variants={itemVariants}
							className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-8 shadow-lg shadow-primary/5"
						>
							<span className="h-px w-5 bg-gradient-to-r from-transparent to-primary"></span>
							<span className="text-primary/90 font-monster text-sm font-medium tracking-wider uppercase">
								Most Advanced Security
							</span>
							<span className="h-px w-5 bg-gradient-to-r from-primary to-transparent"></span>
						</motion.div>

						{/* Hero Section */}
						<div className="max-w-4xl relative mx-auto text-center space-y-8">
							<motion.h1
								variants={itemVariants}
								className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 font-monster"
							>
								Protect Your Discord Server with{' '}
								<span className="relative">
									<span className="absolute -inset-1 blur-md bg-gradient-to-r from-primary to-accent opacity-30 rounded-lg"></span>
									<span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-lora italic">
										AntiRaid
									</span>
								</span>
							</motion.h1>

							<motion.p
								variants={itemVariants}
								className="text-muted-foreground mb-10 font-inter text-lg md:text-xl"
							>
								Join the other{' '}
								<span className="relative inline-block">
									<span className="absolute inset-0 bg-primary/10 blur-md rounded-md"></span>
									<span className="relative font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
										{serverCount.toLocaleString('en-US')}+
									</span>
								</span>{' '}
								servers that trust AntiRaid to protect their communities
							</motion.p>

							{/* CTA Buttons */}
							<motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.98 }}
									transition={{ type: 'spring', stiffness: 400, damping: 10 }}
								>
									<Primary
										Title="Invite now"
										onClick={() => (window.location.href = '/invite')}
										icon={GoArrowUpRight}
									/>
								</motion.div>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.98 }}
									transition={{ type: 'spring', stiffness: 400, damping: 10 }}
								>
									<Secondary
										Title="Learn more"
										onClick={() => (window.location.href = '/about')}
										icon={GoArrowUpRight}
									/>
								</motion.div>
							</motion.div>
						</div>

						{/* Trusted By Section */}
						<motion.div variants={itemVariants} className="mt-16 text-center">
							<div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-accent/10 backdrop-blur-sm border border-accent/20 mb-8 shadow-lg shadow-accent/5">
								<span className="h-px w-5 bg-gradient-to-r from-transparent to-primary"></span>
								<span className="text-primary font-monster text-sm font-medium tracking-wider uppercase">
									Trusted by top servers
								</span>
								<span className="h-px w-5 bg-gradient-to-r from-primary to-transparent"></span>
							</div>

							{/* Discord Server Icons */}
							<ServerIcons />
						</motion.div>
					</motion.div>
				</main>

				{/* Curved divider */}
				<div className="relative h-24 mt-10">
					<svg
						className="absolute bottom-0 w-full h-24 fill-background"
						viewBox="0 0 1440 74"
						preserveAspectRatio="none"
					>
						<path d="M0,0 C240,70 480,70 720,40 C960,10 1200,10 1440,40 L1440,74 L0,74 Z" />
					</svg>
				</div>

				<TemplateCarousel />
				<ReviewsCarousel />
			</section>
		</>
	);
};

export { Hero };
