'use client';

import { useState, useEffect } from 'react';
import { Archive, Zap, Shield, Code, ArrowRight } from 'lucide-react';
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
			{/* Hero */}
			<section className="relative py-24 lg:py-32 px-6 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center">
					<p
						className={`text-sm font-bold text-primary uppercase tracking-widest mb-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
					>
						About AntiRaid
					</p>

					<h1
						className={`text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6 transition-all duration-700 delay-75 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
					>
						Built to protect
						<br />
						<span className="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent">
							modern communities.
						</span>
					</h1>

					<p
						className={`text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
					>
						AntiRaid combines advanced automation with intuitive controls to keep your Discord
						server safe. Real-time protection, zero complexity.
					</p>

					<div
						className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
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
					</div>
				</div>
			</section>

			{/* Mission */}
			<section id="about" className="py-24 px-6 border-t border-border">
				<div className="max-w-3xl mx-auto">
					<div className="text-center">
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
					</div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="py-24 px-6 bg-card/30 border-y border-border">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
							What we offer
						</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
							Everything your server needs
						</h2>
						<p className="text-lg text-muted-foreground">
							Built by Discord enthusiasts, for Discord enthusiasts.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						{features.map((feature, i) => (
							<div
								key={i}
								className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
							>
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<feature.icon className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
								<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Timeline Section */}
			<HistoryTimeline />

			{/* Partners Section */}
			<section id="partners" className="py-24 px-6">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
							Partners
						</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
							Organizations that support us
						</h2>
						<p className="text-lg text-muted-foreground">Helping make AntiRaid possible.</p>
					</div>

					<Partners isLoaded={isLoaded} />
				</div>
			</section>

			{/* Team Section */}
			<section id="staff" className="py-24 px-6 bg-card/30 border-y border-border">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Team</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Meet the Team</h2>
						<p className="text-lg text-muted-foreground">
							The people behind AntiRaid.{' '}
							<Link href="/discord" className="text-primary hover:underline underline-offset-4">
								Join our Discord
							</Link>{' '}
							to connect with us.
						</p>
					</div>

					<TeamMembers isLoaded={isLoaded} />
				</div>
			</section>

			{/* Style Guide Section */}
			<section id="style-guide" className="py-24 px-6">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
							Design System
						</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Style Guide</h2>
						<p className="text-lg text-muted-foreground">
							Our design language and visual identity.
						</p>
					</div>

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
