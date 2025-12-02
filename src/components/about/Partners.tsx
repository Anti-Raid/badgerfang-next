import React from 'react';
import { Partner } from '@/types/other/Partner';
import { Globe } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Partners Component
export const Partners = ({ isLoaded }: { isLoaded: boolean }) => {
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
					icon: <FaDiscord className="w-5 h-5" />,
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
						<div className="relative w-16 h-16 mr-4">
							<Image
								src={partner.logo || '/placeholder.svg'}
								alt={partner.name}
								height={64}
								width={64}
								className="rounded-lg object-cover"
							/>
						</div>
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
							<div className="relative w-8 h-8 mr-2">
								<Image
									src={partner.owner_image || '/placeholder.svg'}
									alt={partner.owner}
									height={32}
									width={32}
									className="rounded-full object-cover"
								/>
							</div>
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
