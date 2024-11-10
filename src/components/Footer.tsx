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

export const getVersion = () => {
	return `v${process.env.NEXT_PUBLIC_VERSION}-${process.env.NEXT_PUBLIC_COMMIT?.substring(
		0,
		7
	)}-${process.env?.NEXT_PUBLIC_BUILD_ENV?.substring(0, 3)} (${process.env?.NEXT_PUBLIC_LASTMOD})`;
};

const Footer = () => {
	return (
		<footer className="bg-background text-foreground">
			<div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
				<div className="md:flex md:justify-between">
					<div className="mb-6 md:mb-0">
						<a href="https://antiraid.xyz/" className="flex items-center">
							<img src={logo} className="h-8 mr-3" alt="AntiRaid Logo" />
							<span className="self-center text-2xl font-semibold whitespace-nowrap text-foreground">
								AntiRaid
							</span>
						</a>
					</div>

					<div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 md:ml-6 lg:ml-6">
						{categories.map((category) => (
							<div key={category.name}>
								<h2 className="mb-6 text-sm font-semibold text-foreground uppercase">
									{category.name}
								</h2>
								<ul className="text-foreground/75 font-medium">
									{category.items.map((item) => (
										<li key={item.name} className="mb-4">
											<a href={item.href} className="hover:underline">
												{item.name}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					<hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />

					<div className="end">
						<p className="text-foreground font-monster text-md">
							&copy; 2024 Purrquinox. All Rights Reserved.
						</p>
						<small className="text-foreground font-monster text-sm">{getVersion()}</small>

						<div className="flex mt-4 justify-start sm:mt-0 md:mt-2 lg:mt-2">
							{socials.map((social) => (
								<a
									key={social.name}
									href={social.href}
									className="text-foreground hover:text-white/75"
								>
									<i className={social.icon} />
									<span className="sr-only">{social.name}</span>
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
