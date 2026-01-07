'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { RiTwitterXFill, RiTeamFill, RiShieldCheckFill } from 'react-icons/ri';
import { TbApi } from 'react-icons/tb';
import { logo } from '../common';
import { API_BASE_URL } from '@/lib/api';
import { Box, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';


interface Category {
	name: string;
	icon: React.ReactNode;
	items: { name: string; href: string; external?: boolean }[];
}

interface Social {
	name: string;
	icon: React.ReactNode;
	href: string;
	color: string;
}

const categories: Category[] = [
	{
		name: 'Product',
		icon: <Box className="w-4 h-4" />,
		items: [
			{ name: 'Features', href: '/#features' },
			{ name: 'Script Shop', href: '/script/shop' },
			{ name: 'Status', href: '/status', external: true },
		],
	},
	{
		name: 'Resources',
		icon: <TbApi size={18} />,
		items: [
			{ name: 'Documentation', href: 'https://docs.antiraid.xyz', external: true },
			{ name: 'API Reference', href: `${API_BASE_URL}/docs/splashtail`, external: true },
			{ name: 'Developer Portal', href: '/dashboard/developers', external: true },
		],
	},
	{
		name: 'Company',
		icon: <RiTeamFill size={18} />,
		items: [
			{ name: 'About Us', href: '/about' },
			{ name: 'Our Team', href: '/about#staff' },
			{ name: 'Blog', href: '/blogs' },
		],
	},
	{
		name: 'Legal',
		icon: <RiShieldCheckFill size={18} />,
		items: [
			{ name: 'Terms of Service', href: '/legal/terms' },
			{ name: 'Privacy Policy', href: '/legal/privacy' },
			{ name: 'Cookie Policy', href: '/legal/cookies' },
		],
	},
];

const socials: Social[] = [
	{
		name: 'Github',
		icon: <FaGithub size={20} />,
		href: 'https://github.com/Anti-Raid',
		color: 'hover:text-white',
	},
	{
		name: 'Discord',
		icon: <FaDiscord size={20} />,
		href: '/discord',
		color: 'hover:text-[#5865F2]',
	},
	{
		name: 'Twitter',
		icon: <RiTwitterXFill size={20} />,
		href: 'https://x.com/HeyAntiRaid',
		color: 'hover:text-[#1DA1F2]',
	},
];
const Footer = () => {
	const currentYear = new Date().getFullYear();

	const [status, setStatus] = useState<{ label: string; color: string }>({
		label: 'Systems Operational',
		color: 'bg-green-500'
	});

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const res = await fetch('/api/get/status');
				const data = await res.json();
				const pageStatus = data.page?.status;

				if (pageStatus === 'UP') {
					setStatus({ label: 'Systems Operational', color: 'bg-green-500' });
				} else if (pageStatus?.includes('MAINTENANCE')) {
					setStatus({ label: 'Maintenance in Progress', color: 'bg-amber-500' });
				} else if (pageStatus?.includes('OUTAGE') || pageStatus?.includes('ISSUES')) {
					setStatus({ label: 'Systems Experiencing Issues', color: 'bg-red-500' });
				} else {
					setStatus({ label: 'Systems Operational', color: 'bg-green-500' });
				}
			} catch (e) {
				// Silently fail and keep default
			}
		};
		fetchStatus();
	}, []);

	return (
		<footer className="relative mt-20 pt-16 pb-8 overflow-hidden">
			{/* Decorative Background Elements */}
			<div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
			<div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
			<div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
					
					{/* Brand Section */}
					<div className="lg:col-span-5 space-y-6">
						<Link href="/" className="inline-flex items-center gap-3 group" aria-label="AntiRaid Home">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all duration-300" />
								<img src={logo} className="h-10 relative z-10" alt="AntiRaid Logo" />
							</div>
							<div className="flex flex-col">
								<span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
									AntiRaid
								</span>
								<span className="text-xs text-muted-foreground tracking-widest uppercase">
									Protect & Serve
								</span>
							</div>
						</Link>
						
						<p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
							The ultimate security solution for your Discord server. 
							Protect your community from raids, spam, and malicious actors with advanced automated systems.
						</p>

						<div className="flex items-center gap-3">
							{socials.map((social) => (
								<Link
									key={social.name}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className={`p-2 rounded-lg bg-white/5 border border-white/5 transition-all duration-300 transform hover:scale-110 hover:border-white/10 ${social.color}`}
									aria-label={social.name}
								>
									{social.icon}
								</Link>
							))}
						</div>
					</div>

					{/* Links Grid */}
					<div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
						{categories.map((category) => (
							<div key={category.name} className="space-y-4">
								<h3 className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-wider uppercase">
									<span className="p-1 rounded bg-primary/10 text-primary">
										{category.icon}
									</span>
									{category.name}
								</h3>
								<ul className="space-y-2">
									{category.items.map((item) => (
										<li key={item.name}>
											<Link
												href={item.href}
												target={item.external ? '_blank' : undefined}
												aria-label={`Navigate to ${item.name}`}
												className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group whitespace-nowrap"
											>
												<span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 h-[1px] bg-primary mr-0 group-hover:mr-2" />
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-muted-foreground">
						&copy; {currentYear} Purrquinox. All rights reserved.
					</p>
					
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<Link
							href="https://status.purrquinox.com"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 hover:text-primary transition-colors group/status"
						>
							<div className={`w-2 h-2 rounded-full ${status.color} animate-pulse group-hover/status:scale-125 transition-transform`} />
							{status.label}
						</Link>
						<span className="text-white/10">|</span>
						<p className="flex items-center gap-1">
							Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" aria-hidden="true" /> by Purrquinox Team
						</p>
					</div>
				</div>
			</div>

		</footer>
	);
};

export default Footer;
