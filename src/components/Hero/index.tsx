'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { botStatsOptions } from '@/lib/api';
import { motion, Variants } from '@/components/ui/motion';
import { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import { Archive, Zap, Shield, User } from 'lucide-react';
import { FeatureCard } from '@/components/about/FeatureCard';
import { Primary, Secondary } from '../ui/Buttons';
import { GoArrowUpRight } from 'react-icons/go';

const TemplateCarousel = React.lazy(() => import('./scriptCarosel').then(m => ({ default: m.TemplateCarousel })));
const ReviewsCarousel = React.lazy(() => import('./reviewCarosel').then(m => ({ default: m.ReviewsCarousel })));
import {
	MdOutlineSettings,
	MdSecurity,
	MdSpeed,
	MdBarChart,
	MdPeople,
	MdNotifications,
	MdChat,
	MdAutoFixHigh
} from 'react-icons/md';
import { HiLightningBolt } from 'react-icons/hi';
import { IoMdSettings } from 'react-icons/io';
import { SiLua, SiJavascript } from 'react-icons/si';
import { FaCode } from 'react-icons/fa';

const ServerIcons = () => {
	const servers = [
		{ name: 'Purrquinox', icon: 'https://purrquinox.com/_next/image?url=%2Flogo.png&w=32&q=75' },
		{ name: 'ByteBrush Studios', icon: 'https://bytebrush.dev/logo.png' },
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
					className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-md group relative"
				>
					{server.icon ? (
						<img src={server.icon} alt={server.name} className="w-8 h-8" loading="lazy" />
					) : (
						<FallbackSVG />
					)}
					<div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 glass">
						{server.name}
					</div>
				</div>
			))}
		</div>
	);
};

const Hero = () => {
	const [serverCount, setServerCount] = useState(0);
	const [userCount, setUserCount] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const heroRef = useRef<HTMLDivElement>(null);

	const { data: stats } = useQuery(botStatsOptions);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	const updateServerCount = useCallback((targetCount: number, increment: number) => {
		setServerCount((prevCount) => {
			if (prevCount < targetCount) {
				const newCount = Math.ceil(prevCount + increment);
				return newCount >= targetCount ? targetCount : newCount;
			}
			return prevCount;
		});
	}, []);

	const updateUserCount = useCallback((targetCount: number, increment: number) => {
		setUserCount((prevCount) => {
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

		const intervalId = setInterval(() => updateServerCount(targetCount, increment), 10);
		return () => clearInterval(intervalId);
	}, [stats?.total_guilds, updateServerCount]);

	useEffect(() => {
		if (!stats?.total_users) return;

		const targetCount = stats.total_users;
		const increment = targetCount / 150;

		// Reset server count when target changes
		setUserCount(0);

		const intervalId = setInterval(() => updateUserCount(targetCount, increment), 10);
		return () => clearInterval(intervalId);
	}, [stats?.total_users, updateUserCount]);

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
								<span className="relative inline-block">
									<span className="absolute -inset-1 blur-2xl bg-gradient-to-r from-primary to-accent opacity-50 rounded-lg animate-pulse"></span>
									<span className="relative bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent font-lora italic drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
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
								servers and{' '}
								<span className="relative inline-block">
									<span className="absolute inset-0 bg-primary/10 blur-md rounded-md"></span>
									<span className="relative font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
										{userCount.toLocaleString('en-US')}+
									</span>
								</span>{' '}
								users that trust AntiRaid to protect their communities
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
										className="!px-8 !py-4 !text-base shadow-primary/40 hover:shadow-primary/60"
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
										className="!px-8 !py-4 !text-base"
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

						{/* Scripting Languages Section */}
						<motion.div variants={itemVariants} className="mt-24 max-w-4xl mx-auto">
							<div className="text-center mb-8">
								<div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm border border-primary/20 mb-4 shadow-lg shadow-primary/5">
									<FaCode className="w-4 h-4 text-primary" />
									<span className="text-primary font-monster text-sm font-medium tracking-wider uppercase">
										Powerful Scripting
									</span>
								</div>
								<h3 className="text-2xl md:text-3xl font-bold font-monster mb-3">
									Write Custom Scripts in{' '}
									<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
										Your Language
									</span>
								</h3>
								<p className="text-muted-foreground text-base max-w-2xl mx-auto">
									Create powerful automation and custom commands using Luau or JavaScript
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Luau Card */}
								<motion.div
									whileHover={{ scale: 1.02, y: -5 }}
									transition={{ type: 'spring', stiffness: 300, damping: 20 }}
									className="group relative bg-gradient-to-br from-blue-500/10 via-background/50 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]"
								>
									<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
									<div className="relative z-10">
										<div className="flex items-center gap-4 mb-4">
											<div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-all">
												<SiLua className="w-8 h-8 text-blue-400" />
											</div>
											<div>
												<h4 className="text-2xl font-bold font-monster text-blue-400">Luau</h4>
												<p className="text-sm text-muted-foreground">Fast & Lightweight</p>
											</div>
										</div>
										<p className="text-foreground/80 leading-relaxed mb-4">
											Leverage the power of Luau for blazing-fast script execution with a simple,
											easy-to-learn syntax
										</p>
										<div className="flex flex-wrap gap-2">
											<span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
												High Performance
											</span>
											<span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
												Easy to Learn
											</span>
										</div>
									</div>
								</motion.div>

								{/* JavaScript Card */}
								<motion.div
									whileHover={{ scale: 1.02, y: -5 }}
									transition={{ type: 'spring', stiffness: 300, damping: 20 }}
									className="group relative bg-gradient-to-br from-yellow-500/10 via-background/50 to-yellow-600/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-8 hover:border-yellow-500/40 transition-all hover:shadow-[0_10px_30px_rgba(234,179,8,0.15)]"
								>
									<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
									<div className="relative z-10">
										<div className="flex items-center gap-4 mb-4">
											<div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-all">
												<SiJavascript className="w-8 h-8 text-yellow-400" />
											</div>
											<div>
												<h4 className="text-2xl font-bold font-monster text-yellow-400">
													JavaScript
												</h4>
												<p className="text-sm text-muted-foreground">Familiar & Powerful</p>
											</div>
										</div>
										<p className="text-foreground/80 leading-relaxed mb-4">
											Use JavaScript's rich ecosystem and familiar syntax to build complex
											automation workflows
										</p>
										<div className="flex flex-wrap gap-2">
											<span className="px-3 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
												Rich Ecosystem
											</span>
											<span className="px-3 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
												Widely Known
											</span>
										</div>
									</div>
								</motion.div>
							</div>
						</motion.div>

						{/* Features Section */}
						<motion.div variants={itemVariants} className="mt-24 max-w-7xl mx-auto">
							<div className="text-center mb-12">
								<div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6 shadow-lg shadow-primary/5">
									<span className="h-px w-5 bg-gradient-to-r from-transparent to-primary"></span>
									<span className="text-primary font-monster text-sm font-medium tracking-wider uppercase">
										Powerful Features
									</span>
									<span className="h-px w-5 bg-gradient-to-r from-primary to-transparent"></span>
								</div>
								<h2 className="text-4xl md:text-5xl font-bold font-monster mb-4">
									Everything You Need to{' '}
									<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
										Secure Your Server
									</span>
								</h2>
								<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
									Advanced protection, intelligent moderation, and powerful automation tools all in
									one place
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								<FeatureCard
									icon={<Shield className="w-6 h-6" />}
									title="Advanced Anti-Raid"
									description="Intelligent raid detection and prevention with real-time threat analysis and automatic response systems"
									delay={0}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<Zap className="w-6 h-6" />}
									title="Lightning Fast"
									description="Blazing fast response times with optimized performance to handle servers of any size"
									delay={0.05}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<User className="w-6 h-6" />}
									title="Smart Moderation"
									description="AI-powered moderation tools that learn from your server's patterns and adapt to your needs"
									delay={0.1}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<Archive className="w-6 h-6" />}
									title="Comprehensive Logging"
									description="Detailed audit logs with advanced filtering and search capabilities for complete transparency"
									delay={0.15}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<MdOutlineSettings className="w-6 h-6" />}
									title="Fully Customizable"
									description="Tailor every aspect of the bot to match your server's unique requirements and workflow"
									delay={0.2}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<MdSecurity className="w-6 h-6" />}
									title="Auto-Moderation"
									description="Automated content filtering, spam detection, and rule enforcement to keep your server clean"
									delay={0.25}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<HiLightningBolt className="w-6 h-6" />}
									title="Real-Time Protection"
									description="Instant threat detection and response with zero-delay protection against malicious actors"
									delay={0.3}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<MdBarChart className="w-6 h-6" />}
									title="Advanced Analytics"
									description="Detailed insights and statistics about your server's activity, growth, and security events"
									delay={0.35}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<MdPeople className="w-6 h-6" />}
									title="Role Management"
									description="Sophisticated role-based permissions and automated role assignment based on user behavior"
									delay={0.4}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<MdNotifications className="w-6 h-6" />}
									title="Smart Alerts"
									description="Customizable notification system that keeps you informed about important server events"
									delay={0.45}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<MdChat className="w-6 h-6" />}
									title="Welcome System"
									description="Engaging welcome messages, auto-roles, and verification systems for new members"
									delay={0.5}
									isLoaded={isVisible}
								/>
								<FeatureCard
									icon={<MdAutoFixHigh className="w-6 h-6" />}
									title="Automation Tools"
									description="Powerful automation features including scheduled tasks, triggers, and custom workflows"
									delay={0.55}
									isLoaded={isVisible}
								/>
							</div>
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

				<React.Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Templates...</div>}>
					<TemplateCarousel />
				</React.Suspense>
				<React.Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Reviews...</div>}>
					<ReviewsCarousel />
				</React.Suspense>
			</section>
		</>
	);
};

export { Hero };
