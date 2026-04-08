'use client';

import { useState, useEffect } from 'react';
import { Archive, Zap, Shield, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaDiscord } from 'react-icons/fa';
import { HistoryTimeline } from '@/components/about/history-timeline';
import { Partners } from '@/components/about/Partners';
import { TeamMembers } from '@/components/about/TeamCard';
import { ColorPalette, Typography, Buttons } from '@/components/about/DesignGuide';

const AboutLayout = () => {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

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
			icon: Archive,
			title: 'Customizable Backups',
			description:
				'Download and restore server backups with complete control over your data. Local backups ensure you never lose important configurations.'
		},
		{
			icon: Zap,
			title: 'Powerful Scripting',
			description:
				'Write custom scripts in Luau or JavaScript to automate moderation and create unique server experiences.'
		},
		{
			icon: Shield,
			title: 'Raid Prevention',
			description:
				'Advanced lockdown settings, automatic member controls, and instant alerts to protect your server during attacks.'
		},
		{
			icon: Code,
			title: 'Developer Friendly',
			description:
				'Full API access for managing backups, settings, and data exports. No vendor lock-in, complete flexibility.'
		}
	];

	return (
		<div className="min-h-screen">
			{/* ── Hero Section ── */}
			<section className="relative py-24 lg:py-32 px-6 overflow-hidden">
				{/* Background */}
				<div className="absolute inset-0 -z-10 pointer-events-none">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.18),transparent)]" />
					<div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] bg-[size:56px_56px]" />
				</div>

				<div className="max-w-4xl mx-auto text-center">
					<motion.p
						custom={0}
						variants={fadeUp}
						initial="hidden"
						animate={isLoaded ? 'visible' : 'hidden'}
						className="text-sm font-bold text-primary uppercase tracking-widest mb-4"
					>
						About AntiRaid
					</motion.p>

					<motion.h1
						custom={0.1}
						variants={fadeUp}
						initial="hidden"
						animate={isLoaded ? 'visible' : 'hidden'}
						className="text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6"
					>
						Built to protect
						<br />
						<span className="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent">
							modern communities.
						</span>
					</motion.h1>

					<motion.p
						custom={0.2}
						variants={fadeUp}
						initial="hidden"
						animate={isLoaded ? 'visible' : 'hidden'}
						className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
					>
						AntiRaid combines advanced automation with intuitive controls to keep your Discord server
						safe. Real-time protection, zero complexity.
					</motion.p>

					<motion.div
						custom={0.3}
						variants={fadeUp}
						initial="hidden"
						animate={isLoaded ? 'visible' : 'hidden'}
						className="flex flex-col sm:flex-row items-center justify-center gap-4"
					>
						<Link
							href="/invite"
							className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground rounded-full font-bold text-base hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
						>
							<FaDiscord className="w-4 h-4" />
							Add to Discord
							<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
						</Link>
						<Link
							href="/discord"
							className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-foreground"
						>
							Join Community
						</Link>
					</motion.div>
				</div>
			</section>

			{/* ── Mission Section ── */}
			<section id="about" className="py-24 px-6 border-t border-border">
				<div className="max-w-3xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center"
					>
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
							Our Mission
						</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
							Security that just works
						</h2>
						<p className="text-lg text-muted-foreground leading-relaxed">
							We believe every Discord community deserves enterprise-grade security without the
							enterprise complexity. AntiRaid provides powerful, automated protection that adapts to
							your server's unique needs—from small gaming groups to large-scale professional
							communities.
						</p>
					</motion.div>
				</div>
			</section>

			{/* ── Features Section ── */}
			<section id="features" className="py-24 px-6 bg-card/30 border-y border-border">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
							What we offer
						</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
							Everything your server needs
						</h2>
						<p className="text-lg text-muted-foreground">
							Built by Discord enthusiasts, for Discord enthusiasts.
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 gap-6">
						{features.map((feature, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: i * 0.1 }}
								viewport={{ once: true }}
								className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
							>
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<feature.icon className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
								<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Timeline Section */}
			<HistoryTimeline />

			{/* Partners Section */}
			<section id="partners" className="py-24 px-6">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Partners</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
							Organizations that support us
						</h2>
						<p className="text-lg text-muted-foreground">
							Helping make AntiRaid possible.
						</p>
					</motion.div>

					<Partners isLoaded={isLoaded} />
				</div>
			</section>

			{/* Team Section */}
			<section id="staff" className="py-24 px-6 bg-card/30 border-y border-border">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Team</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Meet the Team</h2>
						<p className="text-lg text-muted-foreground">
							The people behind AntiRaid.{' '}
							<Link href="/discord" className="text-primary hover:underline underline-offset-4">
								Join our Discord
							</Link>{' '}
							to connect with us.
						</p>
					</motion.div>

					<TeamMembers isLoaded={isLoaded} />
				</div>
			</section>

			{/* Style Guide Section */}
			<section id="style-guide" className="py-24 px-6">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
							Design System
						</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Style Guide</h2>
						<p className="text-lg text-muted-foreground">Our design language and visual identity.</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
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
