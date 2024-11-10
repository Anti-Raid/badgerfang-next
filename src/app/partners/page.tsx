import Breadcrumb from '@/components/Breadcrumb';
import { logo, title } from '@/components/common';
import PartnerCard from '@/components/PartnerCard';
import { Partner } from '@/types/Partner';
import { Metadata } from 'next';

const partners: Partner[] = [
	{
		name: 'NetSocial',
		description: 'Connect, Share, Grow.',
		long_description:
			'NetSocial empowers communities to be who they want to be, no more bots, paywalls and obscene content!',
		logo: 'https://cdn.netsocial.app/logos/netsocial.png',
		url: 'https://netsocial.app/',
		owner: 'Ranveer Soni',
		owner_image: 'https://avatars.githubusercontent.com/u/87431619?v=4',
		owner_website: 'https://maya25-me.vercel.app/',
		links: [
			{
				name: 'Website',
				emoji: '👀',
				link: 'https://netsocial.app/'
			},
			{
				name: 'Discord',
				emoji: 'fa-brands fa-discord',
				link: 'https://discord.gg/Tf6PCgDwa5'
			}
		]
	},
	{
		name: 'Infinity List',
		description: 'Search our vast list of bots for an exciting start to your server.',
		long_description:
			'We make it easier for you to advertise and grow your bots using our vanity links, widgets, bot packs, and more!',
		logo: 'https://cdn.infinitybots.gg/core/full_logo.webp',
		url: 'https://infinitybots.gg/',
		owner: 'Toxic Dev',
		owner_image:
			'https://res.cloudinary.com/dh30c3f52/image/upload/v1707465896/immhuag1zamm3juw2mn8.jpg',
		owner_website: 'https://toxicdev.me/',
		links: [
			{
				name: 'Website',
				emoji: '👀',
				link: 'https://infinitybots.gg/'
			},
			{
				name: 'Discord',
				emoji: 'fa-brands fa-discord',
				link: 'https://discord.com/invite/KBCRuBKrHe'
			}
		]
	}
];

export const metadata: Metadata = {
	title: `Partners - ${title}`,
	description: 'Take a look at our amazing partners, that help us stand where we are today!',
	icons: [logo, '/favicon.ico']
};

const Partners: React.FC = () => (
	<>
		<section id="partners">
			<Breadcrumb
				Title="Partners"
				Description="Take a look at our amazing partners, that help us stand where we are today!"
			/>

			<div className="p-3" />

			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{partners.map((partner) => (
					<PartnerCard key={partner.name} partner={partner} />
				))}
			</div>
		</section>
	</>
);

export default Partners;
