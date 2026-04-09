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
			owner_image: 'https://codemeapixel.dev/character.png',
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
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{partners.map((partner, index) => (
				<div
					key={partner.name}
					className={`group flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card hover:border-border/60 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
					style={{ transitionDelay: `${100 + index * 100}ms` }}
				>
					{/* Header row */}
					<div className="flex items-center gap-3">
						<div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-border">
							<Image
								src={partner.logo || '/logo.webp'}
								alt={partner.name}
								height={40}
								width={40}
								className="object-cover"
							/>
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-bold text-foreground leading-tight">{partner.name}</h3>
							<p className="text-xs text-muted-foreground truncate">{partner.description}</p>
						</div>
						<div className="flex items-center gap-0.5 shrink-0">
							{partner.links.map((link) => (
								<a
									key={link.name}
									href={link.link}
									target="_blank"
									rel="noopener noreferrer"
									title={link.name}
									className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground transition-colors"
								>
									{link.icon}
								</a>
							))}
						</div>
					</div>

					{/* Description */}
					<p className="text-sm text-muted-foreground leading-relaxed flex-1">
						{partner.long_description}
					</p>

					{/* Owner byline */}
					<a
						href={partner.owner_website}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 group/owner w-fit"
					>
						<Image
							src={partner.owner_image || '/logo.webp'}
							alt={partner.owner}
							height={20}
							width={20}
							className="rounded-full"
						/>
						<span className="text-xs text-muted-foreground/50 group-hover/owner:text-muted-foreground transition-colors">
							{partner.owner}
						</span>
						<ExternalLink className="w-3 h-3 text-muted-foreground/20 opacity-0 group-hover/owner:opacity-100 transition-opacity" />
					</a>
				</div>
			))}
		</div>
	);
};
