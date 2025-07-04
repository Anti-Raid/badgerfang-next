'use client';
import { useState, useEffect } from 'react';
import { Archive, Zap, Shield, User, Globe, MessageSquare, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import type { Partner } from '@/types/other/Partner';
import useSWR from 'swr';
import { HistoryTimeline } from '@/components/about/history-timeline';

const ButtonFunc = (button: string): void => {
	toast(`You have pushed the "${button}" button!`);
};

const AboutLayout = () => {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground">
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
							<button
								onClick={() => ButtonFunc('Get Started')}
								className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(var(--primary)/30%)] hover:shadow-[0_0_25px_rgba(var(--primary)/40%)]"
							>
								Get Started
							</button>
							<button
								onClick={() => ButtonFunc('Learn More')}
								className="px-6 py-3 bg-background/30 backdrop-blur-sm border border-primary/30 hover:border-primary/50 text-foreground rounded-md font-semibold transition-all"
							>
								Learn More
							</button>
						</div>
					</motion.div>
				</div>
			</section>

			{/* About Section */}
			<section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
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
							<a
								href="/discord"
								className="text-primary font-bold hover:text-extra transition-colors"
							>
								Discord Server
							</a>
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

// Feature Card Component
type FeatureCardProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
	delay: number;
	isLoaded: boolean;
};

const FeatureCard = ({ icon, title, description, delay, isLoaded }: FeatureCardProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
			transition={{ duration: 0.5, delay }}
			className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6 hover:border-primary/30 transition-all hover:shadow-[0_5px_15px_rgba(var(--primary)/10%)] group"
		>
			<div className="flex items-start">
				<div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-all">
					{icon}
				</div>
				<div className="ml-5">
					<h3 className="text-xl font-monster font-bold mb-2">{title}</h3>
					<p className="text-foreground/70 leading-relaxed">{description}</p>
				</div>
			</div>
		</motion.div>
	);
};

// Partners Component
const Partners = ({ isLoaded }: { isLoaded: boolean }) => {
	const partners: Partner[] = [
		{
			name: 'Infinity List',
			description: 'Search our vast list of bots for an exciting start to your server.',
			long_description:
				'We make it easier for you to advertise and grow your bots using our vanity links, widgets, bot packs, and more!',
			logo: 'https://cdn.infinitybots.gg/core/logo.webp',
			url: 'https://infinitybots.gg/',
			owner: 'CodeMeAPixel',
			owner_image: 'https://codemeapixel.dev/logo.png',
			owner_website: 'https://codemeapixel.dev/',
			links: [
				{
					name: 'Website',
					icon: <Globe className="w-5 h-5" />,
					link: 'https://infinitybots.gg/'
				},
				{
					name: 'Discord',
					icon: <MessageSquare className="w-5 h-5" />,
					link: 'https://discord.com/invite/KBCRuBKrHe'
				}
			]
		}
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			{partners.map((partner, index) => (
				<motion.div
					key={partner.name}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
					transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
					className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6 hover:border-primary/30 transition-all hover:shadow-[0_5px_15px_rgba(var(--primary)/10%)]"
				>
					<div className="flex items-center mb-4">
						<img
							src={partner.logo || '/placeholder.svg'}
							alt={partner.name}
							className="w-16 h-16 rounded-lg object-cover mr-4"
						/>
						<div>
							<h3 className="text-xl font-monster font-bold">{partner.name}</h3>
							<p className="text-foreground/70 text-sm">{partner.description}</p>
						</div>
					</div>

					<div className="mb-4 pb-4 border-b border-border/20">
						<p className="text-foreground/80">{partner.long_description}</p>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<img
								src={partner.owner_image || '/placeholder.svg'}
								alt={partner.owner}
								className="w-8 h-8 rounded-full mr-2"
							/>
							<span className="text-sm text-foreground/70">{partner.owner}</span>
						</div>

						<div className="flex space-x-2">
							{partner.links.map((link) => (
								<a
									key={link.name}
									href={link.link}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2 bg-background/50 rounded-full text-foreground/70 hover:text-primary transition-colors"
									title={link.name}
								>
									{link.icon}
								</a>
							))}
						</div>
					</div>
				</motion.div>
			))}
		</div>
	);
};

// Team Members Component
const TeamMembers = ({ isLoaded }: { isLoaded: boolean }) => {
	const userIds = [
		'728871946456137770',
		'510065483693817867',
		'775855009421066262',
		'202560656883449856',
		'1300319559844364338',
		'564164277251080208',
		'1275832535615537277',
		'787241442770419722',
		'1196897908579123273'
	];

	const fetcher = async (userIds: string[]) => {
		const data = await Promise.all(
			userIds.map(async (id) => {
				const response = await fetch(`https://japi.rest/discord/v1/user/${id}`);
				const json = await response.json();
				return json.data;
			})
		);
		return data;
	};

	const { data: usersData, error, isLoading } = useSWR(userIds, fetcher);

	if (isLoading)
		return (
			<div className="text-center py-12">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
				<p className="mt-4 text-foreground/70">Loading team members...</p>
			</div>
		);

	if (error)
		return (
			<div className="text-center py-12 text-destructive">
				<p>Error loading team members</p>
			</div>
		);

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
			{usersData?.map((user, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
					transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
					className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-4 hover:border-primary/30 transition-all hover:shadow-[0_5px_15px_rgba(var(--primary)/10%)] group"
				>
					<div className="flex flex-col items-center text-center">
						<div className="relative mb-3">
							<div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-extra opacity-0 group-hover:opacity-100 blur-md transition-opacity"></div>
							<img
								className="relative h-20 w-20 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary/70 transition-all"
								src={user.avatarURL || '/logo.webp'}
								alt={`${user.global_name || user.username}'s Avatar`}
							/>
						</div>
						<h3 className="text-lg font-monster font-semibold leading-tight">
							{user.global_name || user.username}
						</h3>
						<p className="text-sm text-foreground/60 mt-1">@{user.username}</p>
					</div>
				</motion.div>
			))}
		</div>
	);
};

// Style Guide Components
const ColorPalette = () => {
	const colors = [
		{ name: 'Primary', class: 'bg-primary' },
		{ name: 'Secondary', class: 'bg-secondary' },
		{ name: 'Accent', class: 'bg-accent' },
		{ name: 'Background', class: 'bg-background' },
		{ name: 'Foreground', class: 'bg-foreground' }
	];

	return (
		<div className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-monster font-bold mb-4">Color Palette</h3>
			<div className="space-y-3">
				{colors.map((color) => (
					<div key={color.name} className="flex items-center">
						<div className={`w-10 h-10 rounded-md ${color.class} mr-3`}></div>
						<span className="text-foreground/80">{color.name}</span>
					</div>
				))}
			</div>
		</div>
	);
};

const Typography = () => {
	return (
		<div className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-monster font-bold mb-4">Typography</h3>
			<div className="space-y-4">
				<div>
					<p className="text-sm text-foreground/70 mb-1">Heading</p>
					<p className="font-monster font-bold text-xl">Montserrat</p>
				</div>
				<div>
					<p className="text-sm text-foreground/70 mb-1">Body</p>
					<p className="font-cabin">Cabin</p>
				</div>
				<div>
					<p className="text-sm text-foreground/70 mb-1">Alternative</p>
					<p className="font-inter">Inter</p>
				</div>
			</div>
		</div>
	);
};

const Buttons = () => {
	return (
		<div className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-monster font-bold mb-4">Buttons</h3>
			<div className="space-y-4">
				<button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold">
					Primary Button
				</button>
				<button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-semibold">
					Secondary Button
				</button>
				<button className="w-full px-4 py-2 bg-background border border-primary/30 text-foreground rounded-md font-semibold">
					Outline Button
				</button>
			</div>
		</div>
	);
};

export default AboutLayout;
