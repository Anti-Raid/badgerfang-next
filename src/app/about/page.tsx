import Breadcrumb from '@/components/Breadcrumb';
import { title, description, logo } from '@/components/common';
import PartnerCard from '@/components/PartnerCard';
import { Partner } from '@/types/other/Partner';
import { Icon } from '@iconify/react';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: `About Us - ${title}`,
	description: description,
	icons: [logo, '/favicon.ico']
};

// Internal Components
const BotFeatures = () => {
	const features: {
		Title: string;
		Description: string;
		Icon: string;
	}[] = [
		{
			Title: 'Customizable Backups',
			Description: `AntiRaid offers you with customizable <em>and</em> downloadable server backups allowing you to both backup exactly what you need and control your server's data if you want to including local backups and restores!`,
			Icon: 'heroicons:archive-box-arrow-down'
		},
		{
			Title: 'Unrivaled Scripting',
			Description: `Our scripting system, based on Luau, a superset of Lua created by Roblox, allows you to customize AntiRaid to the specific needs of your server instead of being <em>yet another</em> generic discord bot`,
			Icon: 'heroicons-outline:bolt'
		},
		{
			Title: 'Raid Prevention',
			Description: `AntiRaid offers advanced raid protection with customizable lockdown settings to secure your server during a raid. Automatically prevent new members from joining, control access to specific channels, and receive instant alerts to stay informed and manage disruptions effectively.`,
			Icon: 'heroicons-outline:globe-alt'
		},
		{
			Title: 'User/Developer Friendly',
			Description: `Unlike most other bots, AntiRaid provides an API for extensive control, allowing you to manage backups and settings, and export your data. This ensures flexibility and helps you avoid vendor-locking by easily switching to other solutions if needed.`,
			Icon: 'mdi:user'
		}
	];

	return (
		<>
			{features.map((p, index) => (
				<div
					key={index}
					className="block bg-secondary/65 hover:bg-secondary/45 px-2 py-4 rounded-md"
				>
					<dt>
						<div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-primary/45 text-foreground">
							<Icon icon={p.Icon} className="text-2xl" />
						</div>
						<p className="ml-16 text-xl font-cabin font-extrabold leading-6 text-foreground">
							{p.Title}
						</p>
					</dt>

					<dd className="mt-2 ml-16 text-foreground text-monster">
						<p
							className="text-xs/4 md:text-sm lg:text-base font-medium font-monster tracking-tight"
							dangerouslySetInnerHTML={{ __html: p.Description }}
						></p>
					</dd>
				</div>
			))}
		</>
	);
};

const Partners = () => {
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

	return (
		<>
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{partners.map((partner) => (
					<PartnerCard key={partner.name} partner={partner} />
				))}
			</div>
		</>
	);
};

const TeamMembers = () => {
	const members = [
		{
			DisplayName: 'KANG HAE-RIN',
			Username: 'haerin',
			Role: 'OWNER',
			DisplayRoles: [['OWNER', 1]],
			Avatar: 'https://i.pinimg.com/originals/23/70/0c/23700c1a59c3c0a77c1745d732e0a7d3.jpg'
		},
		{
			DisplayName: 'DANIELLE MARSH',
			Username: 'danielle',
			Role: 'CO-OWNER',
			DisplayRoles: [['CO-OWNER', 2]],
			Avatar: 'https://th.bing.com/th/id/OIP.RmQ7EeISagCf7bKtKLeeCQHaJ4?rs=1&pid=ImgDetMain'
		}
	];

	return (
		<>
			<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{members.map((member, index) => (
					<div
						key={index}
						className="inline-block p-2 max-w-sm mx-5 bg-secondary/90 hover:bg-secondary/50 overflow-hidden rounded-l-full rounded-r-md"
					>
						<div className="flex items-center">
							<img
								className="h-16 w-16 rounded-full"
								src={member.Avatar || '/logo.webp'}
								alt={`${member.DisplayName}'s Avatar`}
							/>
							<div className="inline-block ml-3">
								<h3 className="text-lg font-monster font-semibold leading-7 overflow-clip tracking-tight text-foreground">
									{member.DisplayName}
								</h3>
								<p className="text-sm font-monster font-semibold text-foreground">
									@{member.Username}
								</p>
								<p className="text-md font-cabin font-semibold leading-6 text-purple-600">
									{member.Role}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

// Page
const AboutPage = () => {
	return (
		<>
			<section>
				<div className="text-center md:text-left">
					<h1 className="text-4xl font-monster font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
						<span className="block text-foreground xl:inline">&#128075; About Us</span>
					</h1>
					<p className="mt-3 text-base text-center md:text-left text-foreground font-semibold font-cabin ml-3 sm:mt-5 sm:text-lg md:ml-0 md:mt-5 md:text-xl lg:ml-0 lg:mx-0">
						Learn more about <span className="text-purple-600 font-bold">AntiRaid</span> and our
						team!
					</p>
				</div>

				<div className="p-4" />

				<p className="text-md md:text-xl text-foreground font-cabin font-semibold text-center md:text-left">
					AntiRaid offers powerful, automated protection for your Discord server. Designed to combat
					spam, harmful bots, and disruptive behavior, our advanced moderation technology ensures a
					safe and welcoming environment. With AntiRaid, you can focus on engaging with your
					community while we handle the security, providing real-time defense against potential
					threats. Invite AntiRaid today for reliable and effortless server protection.
				</p>

				<div className="p-3" />

				{/* Features Section */}
				<section id="features">
					<Breadcrumb Title="Features" Description="What do we have to offer?" />

					<div className="p-2" />

					<center>
						<dl className="mx-2.5 space-y-4 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
							<BotFeatures />
						</dl>
					</center>
				</section>

				<div className="p-3" />

				{/* Partners Section */}
				<section id="partners">
					<Breadcrumb
						Title="Partners"
						Description="Take a look at our amazing partners, that help us stand where we are today!"
					/>

					<div className="p-2" />

					<Partners />
				</section>

				<div className="p-3" />

				{/* Team Section */}
				<section id="staff">
					<Breadcrumb
						Title="Meet the Team!"
						Description="Interested in joining our team? Join our
								<a
									href='/discord'
									className='text-purple-600 font-bold xl:inline hover:text-red-600'
								>
									Discord Server
								</a>"
					/>

					{/* Display Team Members */}
					<TeamMembers />
				</section>
			</section>
		</>
	);
};

export default AboutPage;
