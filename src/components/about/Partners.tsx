import React from 'react';
import { Partner } from '@/types/other/Partner';
import { Globe, ExternalLink } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import Image from 'next/image';

export const Partners = ({ isLoaded }: { isLoaded: boolean }) => {
	const partners: Partner[] = [
		{
			name: 'OmniPlex',
			description: 'Search our vast list of bots for an exciting start to your server.',
			long_description:
				'We make it easier for you to advertise and grow your bots using our vanity links, widgets, bot packs, and more!',
			logo: 'https://cdn.omniplex.gg/core/logo.webp',
			url: 'https://omniplex.gg/',
			owner: 'CodeMeAPixel',
			owner_image: 'https://codemeapixel.dev/logo.png',
			owner_website: 'https://codemeapixel.dev/',
			links: [
				{
					name: 'Website',
					icon: <Globe className="w-4 h-4" />,
					link: 'https://omniplex.gg/'
				},
				{
					name: 'Discord',
					icon: <FaDiscord className="w-4 h-4" />,
					link: 'https://discord.com/invite/KBCRuBKrHe'
				}
			]
		}
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{partners.map((partner, index) => (
				<div
					key={partner.name}
					className={`group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
					style={{ transitionDelay: `${100 + index * 100}ms` }}
				>
					{/* Subtle glow */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

					{/* Header */}
					<div className="flex items-center gap-4 mb-4">
						<div className="w-14 h-14 rounded-xl overflow-hidden border border-border flex-shrink-0">
							<Image
								src={partner.logo || '/logo.webp'}
								alt={partner.name}
								height={56}
								width={56}
								className="object-cover"
							/>
						</div>
						<div className="min-w-0">
							<h3 className="text-lg font-bold text-foreground">{partner.name}</h3>
							<p className="text-sm text-muted-foreground line-clamp-1">{partner.description}</p>
						</div>
					</div>

					{/* Description */}
					<p className="text-sm text-muted-foreground leading-relaxed mb-5 pb-5 border-b border-border">
						{partner.long_description}
					</p>

					{/* Footer */}
					<div className="flex items-center justify-between">
						{/* Owner */}
						<a
							href={partner.owner_website}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 hover:text-primary transition-colors group/owner"
						>
							<Image
								src={partner.owner_image || '/logo.webp'}
								alt={partner.owner}
								height={28}
								width={28}
								className="rounded-full border border-border group-hover/owner:border-primary/40 transition-colors"
							/>
							<span className="text-sm font-medium text-muted-foreground group-hover/owner:text-foreground transition-colors">
								{partner.owner}
							</span>
							<ExternalLink className="w-3 h-3 opacity-0 group-hover/owner:opacity-100 transition-opacity" />
						</a>

						{/* Links */}
						<div className="flex items-center gap-2">
							{partner.links.map((link) => (
								<a
									key={link.name}
									href={link.link}
									target="_blank"
									rel="noopener noreferrer"
									title={link.name}
									className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
								>
									{link.icon}
								</a>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
