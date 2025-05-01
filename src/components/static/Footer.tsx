import Link from 'next/link';
import { FaGithub, FaDiscord, FaForumbee } from 'react-icons/fa';
import { RiTwitterXFill, RiTeamFill, RiBook2Fill, RiShieldCheckFill } from 'react-icons/ri';
import { TbApi } from 'react-icons/tb';
import { logo } from '../common';

interface Category {
	name: string;
	icon: JSX.Element;
	items: { name: string; href: string }[];
}

interface Social {
	name: string;
	icon: JSX.Element;
	href: string;
}

const categories: Category[] = [
	{
		name: 'About',
		icon: <RiTeamFill size={20} />,
		items: [
			{ name: 'About Us', href: '/about' },
			{ name: 'Our Team', href: '/about#staff' },
			{ name: 'Documentation', href: 'https://docs.antiraid.xyz' }
		]
	},
	{
		name: 'Developers',
		icon: <TbApi size={20} />,
		items: [
			{
				name: 'API Documentation',
				href: 'https://splashtail-staging.antiraid.xyz/docs/splashtail'
			},
			{
				name: 'Developer Portal',
				href: 'https://antiraid.xyz/dashboard/developers'
			},
			{
				name: 'Status',
				href: '/status'
			}
		]
	},
	{
		name: 'Community',
		icon: <FaDiscord size={20} />,
		items: [
			{ name: 'Discord Server', href: '/discord' },
			{ name: 'AntiRaid Forums', href: '/forums' },
			{ name: 'AntiRaid Blogs', href: '/blogs' }
		]
	},
	{
		name: 'Legal',
		icon: <RiShieldCheckFill size={20} />,
		items: [
			{ name: 'Terms of Service', href: '/legal/terms' },
			{ name: 'Privacy Policy', href: '/legal/privacy' }
		]
	}
];

const socials: Social[] = [
	{
		name: 'Github',
		icon: <FaGithub size={20} />,
		href: 'https://github.com/Anti-Raid'
	},
	{
		name: 'Twitter',
		icon: <RiTwitterXFill size={20} />,
		href: 'https://x.com/HeyAntiRaid'
	}
];

const Footer = () => {
	return (
		<footer className="bg-transparent text-foreground mt-20">
			<div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
				<div className="flex flex-col md:flex-row md:justify-between md:gap-9">
					{/* Logo Section */}
					<div className="mb-8 md:mb-0">
						<Link href="https://antiraid.xyz/" className="flex items-center gap-2">
							<img src={logo} className="h-8 mr-1" alt="AntiRaid Logo" />
							<div className="flex flex-col">
								<span className="self-center text-2xl font-semibold whitespace-nowrap text-foreground">
									AntiRaid
								</span>
							</div>
						</Link>
					</div>

					{/* Categories Section - Better mobile layout */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 md:mb-0">
						{categories.map((category) => (
							<div key={category.name} className="min-w-max">
								<h2 className="mb-3 text-md font-bold text-foreground uppercase flex items-center gap-2">
									{category.icon} {category.name}
								</h2>
								<ul className="text-foreground/75">
									{category.items.map((item) => (
										<li key={item.name} className="mb-2">
											<Link
												href={item.href}
												className="opacity-90 text-foreground hover:opacity-100 font-light text-sm hover:underline"
											>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					{/* Divider for mobile */}
					<hr className="w-full my-6 border-gray-200 dark:border-gray-700 md:hidden" />

					{/* Copyright and Social Section */}
					<div className="w-full md:w-auto">
						<p className="text-foreground font-monster text-md">
							&copy; 2024 Purrquinox. All Rights Reserved.
						</p>
						<small className="text-foreground font-monster text-sm">{''}</small>

						<div className="flex mt-4 space-x-4">
							{socials.map((social) => (
								<Link
									key={social.name}
									href={social.href}
									className="text-foreground hover:text-foreground/75 flex items-center"
									aria-label={social.name}
								>
									{social.icon}
									<span className="sr-only">{social.name}</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
