'use client';

import { useEffect, useState, useCallback } from 'react';
import { TemplateCarousel } from './scriptCarosel';
import { ReviewsCarousel } from './reviewCarosel';
import { getBotStats } from '@/lib/api';
import { motion } from 'framer-motion';
import { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import { Shield, Zap, Code, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
	const [serverCount, setServerCount] = useState(0);
	const [userCount, setUserCount] = useState(0);
	const [stats, setStats] = useState<GetStatusResponse | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
		const fetchStats = async () => {
			try {
				const data = await getBotStats();
				setStats(data);
			} catch (error) {
				console.error('Error fetching stats:', error);
			}
		};
		fetchStats();
	}, []);

	const updateServerCount = useCallback((targetCount: number, increment: number) => {
		setServerCount((prev) => {
			if (prev < targetCount) {
				const newCount = Math.ceil(prev + increment);
				return newCount >= targetCount ? targetCount : newCount;
			}
			return prev;
		});
	}, []);

	const updateUserCount = useCallback((targetCount: number, increment: number) => {
		setUserCount((prev) => {
			if (prev < targetCount) {
				const newCount = Math.ceil(prev + increment);
				return newCount >= targetCount ? targetCount : newCount;
			}
			return prev;
		});
	}, []);

	useEffect(() => {
		if (!stats?.total_guilds) return;
		const targetCount = stats.total_guilds;
		const increment = targetCount / 150;
		setServerCount(0);
		const intervalId = setInterval(() => updateServerCount(targetCount, increment), 10);
		return () => clearInterval(intervalId);
	}, [stats?.total_guilds, updateServerCount]);

	useEffect(() => {
		if (!stats?.total_users) return;
		const targetCount = stats.total_users;
		const increment = targetCount / 150;
		setUserCount(0);
		const intervalId = setInterval(() => updateUserCount(targetCount, increment), 10);
		return () => clearInterval(intervalId);
	}, [stats?.total_users, updateUserCount]);

	const fadeUp = {
		hidden: { opacity: 0, y: 30 },
		visible: (delay: number) => ({
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] as const }
		})
	};

	const features = [
		{
			icon: Shield,
			title: 'Advanced Protection',
			description:
				'Real-time threat detection and automatic response systems that adapt to your server.'
		},
		{
			icon: Zap,
			title: 'Instant Response',
			description: 'Sub-millisecond reaction times ensure threats are handled before they escalate.'
		},
		{
			icon: Code,
			title: 'Custom Scripts',
			description: 'Write powerful automation in Luau or JavaScript tailored to your needs.'
		}
	];

	const benefits = [
		'Intelligent raid detection',
		'AI-powered moderation',
		'Comprehensive logging',
		'Real-time analytics',
		'Custom automation',
		'24/7 protection'
	];

	return (
		<div className="relative">
			{/* Hero Section */}
			<section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24 lg:py-32">
				<div className="max-w-5xl mx-auto text-center">
					{/* Badge */}
					<motion.div
						custom={0}
						variants={fadeUp}
						initial="hidden"
						animate={isVisible ? 'visible' : 'hidden'}
						className="mb-8"
					>
						<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
							<span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							Protecting {serverCount.toLocaleString()}+ servers
						</span>
					</motion.div>

					{/* Main Headline */}
					<motion.h1
						custom={0.1}
						variants={fadeUp}
						initial="hidden"
						animate={isVisible ? 'visible' : 'hidden'}
						className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-8"
					>
						Discord security,
						<br />
						<span className="text-primary">reimagined.</span>
					</motion.h1>

					{/* Subtitle */}
					<motion.p
						custom={0.2}
						variants={fadeUp}
						initial="hidden"
						animate={isVisible ? 'visible' : 'hidden'}
						className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
					>
						AntiRaid is the most advanced Discord protection bot. Join {userCount.toLocaleString()}+
						users who trust us with their communities.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						custom={0.3}
						variants={fadeUp}
						initial="hidden"
						animate={isVisible ? 'visible' : 'hidden'}
						className="flex flex-col sm:flex-row items-center justify-center gap-4"
					>
						<Link
							href="/invite"
							className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
						>
							Get Started Free
							<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
						</Link>
						<Link
							href="/about"
							className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-semibold text-lg transition-all hover:bg-accent"
						>
							Learn More
						</Link>
					</motion.div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-24 px-6 border-t border-border">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center"
					>
						{[
							{ value: `${serverCount.toLocaleString()}+`, label: 'Servers Protected' },
							{ value: `${userCount.toLocaleString()}+`, label: 'Users Secured' },
							{ value: '99.9%', label: 'Uptime' },
							{ value: '<1ms', label: 'Response Time' }
						].map((stat, i) => (
							<div key={i}>
								<p className="text-4xl lg:text-5xl font-bold text-foreground mb-2">{stat.value}</p>
								<p className="text-muted-foreground font-medium">{stat.label}</p>
							</div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-32 px-6">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-20"
					>
						<h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
							Built for modern Discord servers
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Everything you need to keep your community safe, all in one place.
						</p>
					</motion.div>

					<div className="grid lg:grid-cols-3 gap-8">
						{features.map((feature, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: i * 0.1 }}
								viewport={{ once: true }}
								className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-colors"
							>
								<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
									<feature.icon className="w-7 h-7 text-primary" />
								</div>
								<h3 className="text-2xl font-semibold text-foreground mb-3">{feature.title}</h3>
								<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-32 px-6 bg-card/50">
				<div className="max-w-6xl mx-auto">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<motion.div
							initial={{ opacity: 0, x: -40 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
								Everything your server needs
							</h2>
							<p className="text-xl text-muted-foreground mb-10 leading-relaxed">
								From basic moderation to advanced threat protection, AntiRaid handles it all so you
								can focus on growing your community.
							</p>
							<div className="grid sm:grid-cols-2 gap-4">
								{benefits.map((benefit, i) => (
									<div key={i} className="flex items-center gap-3">
										<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
											<Check className="w-4 h-4 text-primary" />
										</div>
										<span className="text-foreground font-medium">{benefit}</span>
									</div>
								))}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 40 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="relative"
						>
							<div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/20 border border-border p-8 flex items-center justify-center">
								<Shield className="w-32 h-32 text-primary/30" />
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Scripting Section */}
			<section className="py-32 px-6">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
							Extend with custom scripts
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Write powerful automation in Luau or JavaScript. No limits, full control.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="grid lg:grid-cols-2 gap-6"
					>
						{[
							{
								name: 'Luau',
								desc: 'Fast, lightweight, and easy to learn',
								color: 'text-blue-500',
								bg: 'bg-blue-500/10'
							},
							{
								name: 'JavaScript',
								desc: 'Familiar syntax with rich ecosystem',
								color: 'text-yellow-500',
								bg: 'bg-yellow-500/10'
							}
						].map((lang, i) => (
							<div
								key={i}
								className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-colors"
							>
								<div
									className={`w-14 h-14 rounded-2xl ${lang.bg} flex items-center justify-center mb-6`}
								>
									<Code className={`w-7 h-7 ${lang.color}`} />
								</div>
								<h3 className={`text-2xl font-semibold ${lang.color} mb-2`}>{lang.name}</h3>
								<p className="text-muted-foreground">{lang.desc}</p>
							</div>
						))}
					</motion.div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-32 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
							Ready to secure your server?
						</h2>
						<p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
							Join thousands of communities already protected by AntiRaid. Free to get started.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/invite"
								className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
							>
								Add to Discord
								<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
							</Link>
							<Link
								href="/commands"
								className="inline-flex items-center justify-center px-8 py-4 text-foreground font-semibold text-lg hover:text-primary transition-colors"
							>
								View Commands →
							</Link>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Carousels */}
			<TemplateCarousel />
			<ReviewsCarousel />
		</div>
	);
};

export { Hero };
