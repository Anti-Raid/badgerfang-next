'use client';
import { useState, useEffect } from 'react';
import { Archive, Zap, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { HistoryTimeline } from '@/components/about/history-timeline';
import { FeatureCard } from '@/components/about/FeatureCard';
import { Partners } from '@/components/about/Partners';
import { TeamMembers } from '@/components/about/TeamCard';
import { ColorPalette, Typography, Buttons } from '@/components/about/DesignGuide';
import React from 'react';

const AboutLayout = () => {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	return (
		<div className="min-h-screen pt-20 bg-gradient-to-br from-background to-background/80 text-foreground">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
				<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-background/80"></div>

				<div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
						transition={{ duration: 0.5 }}
						className="max-w-4xl"
					>
						<h1 className="text-5xl md:text-7xl font-monster font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-extra">
							About AntiRaid
						</h1>
						<p className="text-xl md:text-2xl font-cabin text-foreground/80 max-w-3xl">
							Advanced protection for your Discord server with powerful, automated security
							features.
						</p>

						<div className="mt-10 flex flex-wrap gap-4">
							<a href="#about">
								<button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(var(--primary)/30%)] hover:shadow-[0_0_25px_rgba(var(--primary)/40%)]">
									Get Started
								</button>
							</a>
							<a href="#timeline">
								<button className="px-6 py-3 bg-background/30 backdrop-blur-sm border border-primary/30 hover:border-primary/50 text-foreground rounded-md font-semibold transition-all">
									Learn More
								</button>
							</a>
						</div>
					</motion.div>
				</div>
			</section>

			{/* About Section */}
			<section id="about" className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: isLoaded ? 1 : 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="max-w-3xl mx-auto text-center"
				>
					<h2 className="text-3xl md:text-4xl font-monster font-bold mb-6">Powerful Protection</h2>
					<p className="text-lg text-foreground/80 leading-relaxed">
						AntiRaid offers powerful, automated protection for your Discord server. Designed to
						combat spam, harmful bots, and disruptive behavior, our advanced moderation technology
						ensures a safe and welcoming environment. With AntiRaid, you can focus on engaging with
						your community while we handle the security, providing real-time defense against
						potential threats.
					</p>
				</motion.div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-16 bg-accent/5">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-monster font-bold mb-3">Features</h2>
						<p className="text-lg text-foreground/70">What do we have to offer?</p>
						<div className="w-20 h-1 bg-primary mx-auto mt-6"></div>
					</div>

					<div className="grid md:grid-cols-2 gap-8">
						<FeatureCard
							icon={<Archive className="w-6 h-6" />}
							title="Customizable Backups"
							description="AntiRaid offers you with customizable and downloadable server backups allowing you to both backup exactly what you need and control your server's data if you want to including local backups and restores!"
							delay={0.3}
							isLoaded={isLoaded}
						/>
						<FeatureCard
							icon={<Zap className="w-6 h-6" />}
							title="Unrivaled Scripting"
							description="Our scripting system, based on Luau, a superset of Lua created by Roblox, allows you to customize AntiRaid to the specific needs of your server instead of being yet another generic discord bot"
							delay={0.4}
							isLoaded={isLoaded}
						/>
						<FeatureCard
							icon={<Shield className="w-6 h-6" />}
							title="Raid Prevention"
							description="AntiRaid offers advanced raid protection with customizable lockdown settings to secure your server during a raid. Automatically prevent new members from joining, control access to specific channels, and receive instant alerts."
							delay={0.5}
							isLoaded={isLoaded}
						/>
						<FeatureCard
							icon={<User className="w-6 h-6" />}
							title="User/Developer Friendly"
							description="Unlike most other bots, AntiRaid provides an API for extensive control, allowing you to manage backups and settings, and export your data. This ensures flexibility and helps you avoid vendor-locking."
							delay={0.6}
							isLoaded={isLoaded}
						/>
					</div>
				</div>
			</section>

			{/* History Timeline Section */}
			<HistoryTimeline />

			{/* Partners Section */}
			<section id="partners" className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-monster font-bold mb-3">Partners</h2>
						<p className="text-lg text-foreground/70">
							Take a look at our amazing partners, that help us stand where we are today!
						</p>
						<div className="w-20 h-1 bg-primary mx-auto mt-6"></div>
					</div>

					<Partners isLoaded={isLoaded} />
				</div>
			</section>

			{/* Team Section */}
			<section id="staff" className="py-16 bg-accent/5">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-monster font-bold mb-3">Meet the Team</h2>
						<p className="text-lg text-foreground/70">
							Interested in joining our team? Join our{' '}
							<Link
								to="/discord"
								className="text-primary font-bold hover:text-extra transition-colors"
							>
								Discord Server
							</Link>
						</p>
						<div className="w-20 h-1 bg-primary mx-auto mt-6"></div>
					</div>

					<TeamMembers isLoaded={isLoaded} />
				</div>
			</section>

			{/* Style Guide Section */}
			<section id="style-guide" className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-monster font-bold mb-3">Style Guide</h2>
						<p className="text-lg text-foreground/70">
							Information about our{' '}
							<span className="text-primary font-bold">Styling and Designing</span>.
						</p>
						<div className="w-20 h-1 bg-primary mx-auto mt-6"></div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<ColorPalette />
						<Typography />
						<Buttons />
					</div>
				</div>
			</section>
		</div>
	);
};

export default AboutLayout;
