import Link from 'next/link';
import { logo } from './common';

interface Category {
	name: string;
	items: { name: string; href: string }[];
}

interface Social {
	name: string;
	icon: string;
	href: string;
}

const categories: Category[] = [
	{
		name: 'About',
		items: [
			{ name: 'About Us', href: '/about' },
			{ name: 'Our Team', href: '/about#staff' },
			{ name: 'Documentation', href: '/docs' }
		]
	},
	{
		name: 'Developers',
		items: [
			{
				name: 'API Documentation',
				href: 'https://splashtail-staging.antiraid.xyz'
			},
			{
				name: 'Developer Portal',
				href: 'https://antiraid.xyz/dashboard/developers'
			}
		]
	},
	{
		name: 'Community',
		items: [
			{ name: 'Discord Server', href: '/discord' },
			{ name: 'AntiRaid Forums', href: '/forums' }
		]
	},
	{
		name: 'Legal',
		items: [
			{ name: 'Terms of Service', href: '/legal/terms' },
			{ name: 'Privacy Policy', href: '/legal/privacy' }
		]
	}
];

const socials: Social[] = [
	{
		name: 'Github',
		icon: 'fa-brands fa-github fa-lg',
		href: 'https://github.com/Anti-Raid'
	}
];

const Footer = () => {
	return (
		<footer className="bg-transparent text-foreground">
			<div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
				<div className="md:flex md:justify-between md:gap-9 ">
					<div className="mb-6 md:mb-0">
						<a
							href="https://antiraid.xyz/"
							className="flex items-center flex-wrap gap-2 max-[1085px]:justify-center max-[767px]:justify-normal"
						>
							<img src={logo} className="h-8 mr-1" alt="AntiRaid Logo" />
							<span className="self-center text-2xl font-semibold whitespace-nowrap text-foreground">
								AntiRaid
							</span>
						</a>
					</div>

					<div className="flex flex-row gap-5 flex-wrap ">
						{categories.map((category) => (
							<div key={category.name}>
								<h2 className="mb-4 text-md font-bold text-foreground uppercase">
									{category.name}
								</h2>
								<ul className="text-foreground/75 ">
									{category.items.map((item) => (
										<li key={item.name} className="mb-2">
											<Link
												href={item.href}
												className=" opacity-90 text-foreground hover:opacity-100 font-light text-sm hover:underline"
											>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					<hr className="hidden max-[768px]:flex my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />

					<div className="end">
						<p className="text-foreground font-monster text-md">
							&copy; 2024 Purrquinox. All Rights Reserved.
						</p>
						<small className="text-foreground font-monster text-sm">{''}</small>

						<div className="flex mt-4 justify-start sm:mt-0 md:mt-2 lg:mt-2">
							{socials.map((social) => (
								<Link
									key={social.name}
									href={social.href}
									className="text-foreground hover:text-foreground/75"
								>
									<i className={social.icon} />
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
