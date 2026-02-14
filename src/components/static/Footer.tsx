'use client';

import Link from 'next/link';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';
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
	{ name: 'Twitter', icon: RiTwitterXFill, href: 'https://x.com/HeyAntiRaid' }
];

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-border mt-24" role="contentinfo">
			<div className="max-w-6xl mx-auto px-6 py-16">
				{/* Main Footer Content */}
				<div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Link href="/" className="flex items-center gap-2 mb-4">
							<img src="/logo.webp" alt="AntiRaid" className="h-8 w-8 rounded-lg" />
							<span className="text-lg font-semibold text-foreground">AntiRaid</span>
						</Link>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Advanced Discord server protection for modern communities.
						</p>
					</div>

					{/* Product Links */}
					<div>
						<h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
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
						<h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
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
						<h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
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
						<h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
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
						© {currentYear} AntiRaid. All rights reserved.
					</p>

					{/* Social Links */}
					<div className="flex items-center gap-4">
						{socials.map((social) => (
							<Link
								key={social.name}
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label={social.name}
							>
								<social.icon className="w-5 h-5" />
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
