'use client';

import { useEffect, useState, useCallback } from 'react';
import { TemplateCarousel } from './scriptCarosel';
import { ReviewsCarousel } from './reviewCarosel';
import { getBotStats } from '@/lib/api';
import { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import { Shield, Zap, Code, ArrowRight, Check, Users, Server, Activity, Clock } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
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

	const features = [
		{
			icon: Shield,
			title: 'Advanced Protection',
			description: 'Real-time threat detection and automatic response systems that adapt to your server.'
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
		'Raid detection',
		'Automated moderation',
		'Comprehensive logging',
		'Real-time analytics',
		'Custom automation',
		'24/7 protection'
	];

	const protectionItems = [
		{ label: 'Raid Shield', icon: Shield },
		{ label: 'Automated Moderation', icon: Zap },
		{ label: 'Auto-Logging', icon: Activity },
		{ label: 'Threat Detection', icon: Clock }
	];

	return (
		<div className="relative">
			{/* Hero */}
			<section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24 lg:py-32 overflow-hidden">
				<div className="max-w-5xl mx-auto text-center">
					{/* Badge */}
					<div
						className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
					>
						<span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/25 shadow-sm shadow-primary/10">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
							</span>
							Protecting {serverCount.toLocaleString()}+ servers
						</span>
					</div>

					{/* Headline */}
					<h1
						className={`text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 transition-all duration-700 delay-75 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
					>
						<span className="text-foreground">Discord security,</span>
						<br />
						<span className="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent">
							reimagined.
						</span>
					</h1>

					{/* Subtitle */}
					<p
						className={`text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
					>
						The most advanced Discord protection bot. Join{' '}
						<span className="text-foreground font-semibold">
							{userCount.toLocaleString()}+ users
						</span>{' '}
						who trust us with their communities.
					</p>

					{/* CTA Buttons */}
					<div
						className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
					>
						<Link
							href="/invite"
							className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
						>
							<FaDiscord className="w-5 h-5" />
							Add to Discord
							<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
						</Link>
						<Link
							href="/about"
							className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-foreground"
						>
							Learn More
						</Link>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="py-16 px-6 border-y border-border bg-card/30">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{ icon: Server, value: `${serverCount.toLocaleString()}+`, label: 'Servers Protected', color: 'text-primary', glow: 'group-hover:shadow-primary/20' },
							{ icon: Users, value: `${userCount.toLocaleString()}+`, label: 'Users Secured', color: 'text-blue-400', glow: 'group-hover:shadow-blue-400/20' },
							{ icon: Activity, value: '99.9%', label: 'Uptime', color: 'text-emerald-400', glow: 'group-hover:shadow-emerald-400/20' },
							{ icon: Clock, value: '<1ms', label: 'Response Time', color: 'text-amber-400', glow: 'group-hover:shadow-amber-400/20' }
						].map((stat, i) => (
							<div
								key={i}
								className={`group flex flex-col items-center p-5 lg:p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg ${stat.glow} transition-all text-center`}
							>
								<stat.icon className={`w-5 h-5 mb-3 ${stat.color}`} />
								<p className={`text-2xl lg:text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</p>
								<p className="text-xs lg:text-sm text-muted-foreground font-medium">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-32 px-6">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Features</p>
						<h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
							Built for modern Discord servers
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Everything you need to keep your community safe, all in one place.
						</p>
					</div>

					<div className="grid lg:grid-cols-3 gap-6">
						{features.map((feature, i) => (
							<div
								key={i}
								className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
							>
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<feature.icon className="w-7 h-7 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
								<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Benefits */}
			<section className="py-32 px-6 bg-card/30 border-y border-border">
				<div className="max-w-6xl mx-auto">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						{/* Left */}
						<div>
							<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
								Why AntiRaid
							</p>
							<h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
								Everything your server needs
							</h2>
							<p className="text-xl text-muted-foreground mb-10 leading-relaxed">
								From basic moderation to advanced threat protection, AntiRaid handles it all so you
								can focus on growing your community.
							</p>
							<div className="grid sm:grid-cols-2 gap-2">
								{benefits.map((benefit, i) => (
									<div
										key={i}
										className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
									>
										<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
											<Check className="w-3.5 h-3.5 text-primary" />
										</div>
										<span className="text-foreground font-medium text-sm">{benefit}</span>
									</div>
								))}
							</div>
						</div>

						{/* Right — Protection Status mock UI */}
						<div className="relative">
							<div className="relative rounded-3xl bg-card border border-border p-6 overflow-hidden">
								<div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-2.5">
										<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
											<Shield className="w-5 h-5 text-primary" />
										</div>
										<span className="font-bold text-foreground">Protection Status</span>
									</div>
									<span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
										● Active
									</span>
								</div>

								<div className="space-y-2.5">
									{protectionItems.map((item, i) => (
										<div
											key={i}
											className="flex items-center justify-between p-3.5 rounded-xl bg-accent/40 border border-border/50"
										>
											<div className="flex items-center gap-3">
												<item.icon className="w-4 h-4 text-primary" />
												<span className="text-sm font-medium text-foreground">{item.label}</span>
											</div>
											<span className="text-xs text-emerald-400 font-semibold">✓ Enabled</span>
										</div>
									))}
								</div>

								<div className="mt-5 pt-4 border-t border-border">
									<div className="flex items-center justify-between">
										<span className="text-xs text-muted-foreground">Servers protected</span>
										<span className="text-sm font-bold text-primary">{serverCount.toLocaleString()}+</span>
									</div>
								</div>
							</div>

							{/* Floating badge */}
							<div
								className="absolute -bottom-4 -left-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-xl animate-bounce"
								style={{ animationDuration: '3s' }}
							>
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
									<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
								</span>
								<span className="text-xs font-semibold text-foreground">All systems operational</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Scripting */}
			<section className="py-32 px-6">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Scripting</p>
						<h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
							Extend with custom scripts
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Write powerful automation in Luau or JavaScript. No limits, full control.
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-6">
						{[
							{ name: 'Luau', desc: 'Fast, lightweight, and easy to learn. Roblox-compatible syntax.', color: 'text-blue-400', gradFrom: 'from-blue-500/15', gradTo: 'to-blue-500/5', borderHover: 'hover:border-blue-500/40', shadowHover: 'hover:shadow-blue-500/10' },
							{ name: 'JavaScript', desc: 'Familiar syntax with a rich ecosystem you already know.', color: 'text-amber-400', gradFrom: 'from-amber-500/15', gradTo: 'to-amber-500/5', borderHover: 'hover:border-amber-500/40', shadowHover: 'hover:shadow-amber-500/10' }
						].map((lang, i) => (
							<div
								key={i}
								className={`group p-8 rounded-3xl bg-card border border-border ${lang.borderHover} hover:-translate-y-1 hover:shadow-xl ${lang.shadowHover} transition-all duration-300`}
							>
								<div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lang.gradFrom} ${lang.gradTo} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
									<Code className={`w-7 h-7 ${lang.color}`} />
								</div>
								<h3 className={`text-2xl font-bold ${lang.color} mb-2`}>{lang.name}</h3>
								<p className="text-muted-foreground">{lang.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="relative py-32 px-6 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center">
					<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-8">
						Free to get started — no credit card needed
					</span>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
						Ready to secure your
						<br />
						<span className="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent">
							community?
						</span>
					</h2>
					<p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
						Join thousands of communities already protected by AntiRaid.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							href="/invite"
							className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
						>
							<FaDiscord className="w-5 h-5" />
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
				</div>
			</section>

			{/* Carousels */}
			<TemplateCarousel />
			<ReviewsCarousel />
		</div>
	);
};

export { Hero };
