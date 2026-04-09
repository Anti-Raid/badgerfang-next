'use client';

import Link from 'next/link';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';
import { ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const footerLinks = {
	product: [
		{ name: 'Features', href: '/#features' },
		{ name: 'Commands', href: '/commands' },
		{ name: 'Script Shop', href: '/script/shop' },
		{ name: 'Status', href: '/status' }
	],
	resources: [
		{ name: 'Documentation', href: 'https://docs.antiraid.xyz', external: true },
		{ name: 'API Reference', href: `${API_BASE_URL}/docs/splashtail`, external: true },
		{ name: 'Developer Portal', href: '/dashboard/developers' }
	],
	company: [
		{ name: 'About', href: '/about' },
		{ name: 'Blog', href: '/blogs' },
		{ name: 'Team', href: '/about#staff' }
	],
	legal: [
		{ name: 'Terms', href: 'https://purrquinox.com/terms', external: true },
		{ name: 'Privacy', href: 'https://purrquinox.com/privacy', external: true }
	]
};

const socials = [
	{ name: 'GitHub', icon: FaGithub, href: 'https://github.com/Anti-Raid' },
	{ name: 'Discord', icon: FaDiscord, href: '/discord' },
	{ name: 'Twitter/X', icon: RiTwitterXFill, href: 'https://x.com/HeyAntiRaid' }
];

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="relative mt-24 overflow-hidden" role="contentinfo">
			{/* Gradient top border */}
			<div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

			{/* Subtle background glow */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.06),transparent)] pointer-events-none" />

			<div className="relative max-w-6xl mx-auto px-6 py-16">
				{/* CTA Banner */}
				<div className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-blue-500/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
					<div>
						<p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
							Get started for free
						</p>
						<h3 className="text-xl font-bold text-foreground">Protect your server today.</h3>
						<p className="text-sm text-muted-foreground mt-1">
							No credit card required. Setup in under 60 seconds.
						</p>
					</div>
					<Link
						href="/invite"
						className="group flex-shrink-0 inline-flex items-center gap-2.5 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all"
					>
						<FaDiscord className="w-4 h-4" />
						Add to Discord
						<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
					</Link>
				</div>

				{/* Main Footer Content */}
				<div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Link href="/" className="flex items-center gap-2 mb-4">
							<img src="/logo.webp" alt="AntiRaid" className="h-8 w-8 rounded-lg" />
							<span className="text-lg font-bold text-foreground">AntiRaid</span>
						</Link>
						<p className="text-sm text-muted-foreground leading-relaxed mb-5">
							Advanced Discord server protection for modern communities.
						</p>
						{/* Socials */}
						<div className="flex items-center gap-2">
							{socials.map((social) => (
								<Link
									key={social.name}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
									aria-label={social.name}
								>
									<social.icon className="w-4 h-4" />
								</Link>
							))}
						</div>
					</div>

					{/* Product Links */}
					<div>
						<h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">
							Product
						</h3>
						<ul className="space-y-3">
							{footerLinks.product.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Resources Links */}
					<div>
						<h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">
							Resources
						</h3>
						<ul className="space-y-3">
							{footerLinks.resources.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										target={link.external ? '_blank' : undefined}
										rel={link.external ? 'noopener noreferrer' : undefined}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">
							Company
						</h3>
						<ul className="space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal Links */}
					<div>
						<h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">
							Legal
						</h3>
						<ul className="space-y-3">
							{footerLinks.legal.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										target={link.external ? '_blank' : undefined}
										rel={link.external ? 'noopener noreferrer' : undefined}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
					<p className="text-sm text-muted-foreground">
						© {currentYear} AntiRaid · Built by{' '}
						<Link
							href="https://purrquinox.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
						>
							Purrquinox
						</Link>
					</p>
					<p className="text-xs text-muted-foreground/60">Not affiliated with Discord Inc.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
