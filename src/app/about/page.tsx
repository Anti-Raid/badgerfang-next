'use client';
import Breadcrumb from '@/components/Breadcrumb';
import { api_url, description, image, main_server_id, website_url } from '@/components/common';
import PartnerCard from '@/components/PartnerCard';
import { Partner } from '@/types/other/Partner';
import { Icon } from '@iconify/react';
import { Ghost, Primary, Secondary } from '@/components/Buttons';
import { toast } from 'react-toastify';
import { CiGlobe } from 'react-icons/ci';
import { FaDiscord } from 'react-icons/fa';
import { SEO } from '@/components/SEO';
import useSWR from 'swr';

const ButtonFunc = (button: string): void => {
	toast(`You have pushed the "${button}" button!`);
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
			<SEO
				title="About | AntiRaid"
				description={description}
				canonical={website_url}
				image={{
					url: `${image}`,
					width: 1920,
					height: 1080,
					alt: `${description}`
				}}
				robotsConfig={{
					index: true,
					follow: false,
					additional: ['noarchive']
				}}
				social={{
					og: {
						type: 'website',
						site_name: `About | AntiRaid`,
						locale: 'en_US'
					},
					twitter: {
						card: 'summary_large_image',
						site: `@About | AntiRaid`
					}
				}}
				structuredData={{
					'@context': 'https://schema.org',
					'@type': 'WebPage',
					name: `About | AntiRaid`,
					description: `${description}`
				}}
				additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
			/>
			{features.map((p, index) => (
				<div
					key={index}
					className="block bg-white bg-opacity-5 border border-white border-opacity-5 px-4 py-4 rounded-md"
				>
					<dt>
						<div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-primary/45 text-foreground">
							<Icon icon={p.Icon} className="text-2xl" />
						</div>
						<p className="ml-16 text-xl font-cabin text-left font-extrabold leading-6 text-foreground">
							{p.Title}
						</p>
					</dt>

					<dd className="mt-3 ml-16 text-foreground text-monster">
						<p
							className="text-xs/4 md:text-sm lg:text-md font-normal font-inter opacity-80 text-justify"
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
			description:
				'Connect, Share, Grow. NetSocial empowers communities to be who they want to be.',
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
					icon: <CiGlobe size={25} />,
					link: 'https://netsocial.app/'
				},
				{
					name: 'Discord',
					icon: <FaDiscord size={25} />,
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
					icon: <CiGlobe size={25} />,
					link: 'https://infinitybots.gg/'
				},
				{
					name: 'Discord',
					icon: <FaDiscord size={25} />,
					link: 'https://discord.com/invite/KBCRuBKrHe'
				}
			]
		}
	];

	return (
		<>
			<div className="flex flex-row flex-wrap gap-5 ">
				{partners.map((partner) => (
					<PartnerCard key={partner.name} partner={partner} />
				))}
			</div>
		</>
	);
};

const TeamMembers = () => {
	interface APIResponse {
		members: any[];
		roles: any[];
	}

	interface TeamMember {
		DisplayName: string | undefined;
		Username: string | undefined;
		Role: string;
		DisplayRoles: [string, number][];
		Avatar: string | undefined;
	}

	const { data, error, isLoading } = useSWR<APIResponse>(
		`${api_url}/guilds/${main_server_id}/staff-team`
	);
	if (isLoading) return toast('Loading data...');
	if (error) return toast('There was an error loading Team Members: ', error);

	let teamMembers: TeamMember[] = [];
	if (data) {
		for (let member of data.members) {
			let display_roles: [string, number][] = [];

			for (let role of member.role) {
				let roleData = data.roles.find((r: any) => r.role_id === role);
				if (roleData) display_roles.push([roleData.display_name?.toString() || '', roleData.index]);
			}

			display_roles.sort((a, b) => a[1] - b[1]);

			teamMembers.push({
				DisplayName: member.user?.display_name,
				Username: member.user?.username,
				Role: display_roles.map((x) => x[0]).join(', '),
				DisplayRoles: display_roles,
				Avatar: member?.user?.avatar
			});
		}

		teamMembers = teamMembers.sort((a, b) => {
			let highestIndexA = a.DisplayRoles[0][1];
			let highestIndexB = b.DisplayRoles[0][1];

			for (let i = 1; i < a.DisplayRoles.length; i++) {
				if (a.DisplayRoles[i][1] < highestIndexA) highestIndexA = a.DisplayRoles[i][1];
			}
			for (let i = 1; i < b.DisplayRoles.length; i++) {
				if (b.DisplayRoles[i][1] < highestIndexB) highestIndexB = b.DisplayRoles[i][1];
			}

			return 10 * (highestIndexA - highestIndexB) - (a.DisplayRoles.length - b.DisplayRoles.length);
		});
	}

	return (
		<>
			<div className="mt-5 flex flex-row flex-wrap w-full gap-4">
				{teamMembers.length > 0 ? (
					teamMembers.map((member, index) => (
						<div
							key={index}
							className="flex grow p-2 bg-white bg-opacity-5 overflow-hidden rounded-md border border-white border-opacity-5"
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
									<p className="text-sm font-inter text-foreground">
										<span className="font-normal opacity-80">@{member.Username}</span> -{' '}
										<span className="text-primary font-semibold">{member.Role}</span>
									</p>
								</div>
							</div>
						</div>
					))
				) : (
					<p className="text-center text-foreground opacity-75">No team members found.</p>
				)}
			</div>
		</>
	);
};

// Page
const AboutPage = () => {
	return (
		<>
			<section className="flex flex-col gap-8 mx-4">
				<div className="text-center md:text-left">
					<h1 className="text-4xl font-monster font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
						<span className="block text-foreground xl:inline">&#128075; About Us</span>
					</h1>
					<p className="mt-3 text-base text-center md:text-left text-foreground font-semibold font-cabin ml-3 sm:mt-5 sm:text-lg md:ml-0 md:mt-5 md:text-xl lg:ml-0 lg:mx-0">
						Learn more about <span className="text-purple-600 font-bold">AntiRaid</span> and our
						team!
					</p>
				</div>

				{/* <div className="p-4" /> */}

				<p className="text-md md:text-md text-foreground font-cabin opacity-80 text-center md:text-left">
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
						<dl className="space-y-4 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
							<BotFeatures />
						</dl>
					</center>
				</section>

				<div className="p-3" />

				{/* Partners Section */}
				<section id="partners" className="w-full">
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

				<div className="p-3" />

				{/* Design Guidelines */}
				<Breadcrumb
					Title="Style Guide"
					Description="Information about our <span class='text-purple-600 font-bold'>Styling and Designing</span>."
				></Breadcrumb>

				<section className="ml-6" id="design-guide">
					<div className="flex flex-col gap-10">
						<div className="flex justify-between flex-wrap  gap-10">
							<div className="flex flex-1 flex-col gap-10">
								{/* Color Palette */}
								<div className="flex flex-col gap-3">
									<h2 className="text-2xl font-inter font-semibold">Color Palette</h2>
									<div className="flex flex-col gap-3 ml-[1rem]">
										<div className="flex items-center gap-3">
											<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-primary"></div>
											<p className="font-inter font-normal">Brand #8100BD</p>
										</div>
										<div className="flex items-center gap-3">
											<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-secondary "></div>
											<p className="font-inter font-normal">Secondary #262428</p>
										</div>
										<div className="flex items-center gap-3">
											<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-background"></div>
											<p className="font-inter font-normal">Base #0A0118</p>
										</div>
										<div className="flex items-center gap-3">
											<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-foreground"></div>
											<p className="font-inter font-normal">Text #FAFAFA</p>
										</div>
										<div className="flex items-center gap-3">
											<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-extra"></div>
											<p className="font-inter font-normal">Extra #5046EF</p>
										</div>
									</div>
								</div>

								{/* Fonts */}
								<div className="flex flex-col gap-3">
									<h2 className="text-2xl font-inter font-semibold">Fonts</h2>
									<div className="flex flex-col gap-3  ml-[1rem]">
										{/* Inter */}
										<p className="flex flex-col font-inter font-normal">
											1. Inter
											<span className="ml-7">
												Bold - <br />{' '}
												<span className="ml-4 font-bold">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
											<span className="ml-7">
												Medium - <br />{' '}
												<span className="ml-4 font-medium">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
											<span className="ml-7">
												Thin - <br />{' '}
												<span className="ml-4 font-thin">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
										</p>

										{/* Monster */}
										<p className="flex flex-col font-monster font-normal">
											2. Monster
											<span className="ml-7">
												Bold - <br />{' '}
												<span className="ml-4 font-bold">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
											<span className="ml-7">
												Medium - <br />{' '}
												<span className="ml-4 font-medium">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
											<span className="ml-7">
												Thin - <br />{' '}
												<span className="ml-4 font-thin">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
										</p>

										{/* Cabin*/}
										<p className="flex flex-col font-cabin font-normal">
											3. Cabin
											<span className="ml-7">
												Bold - <br />{' '}
												<span className="ml-4 font-bold">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
											<span className="ml-7">
												Medium - <br />{' '}
												<span className="ml-4 font-medium">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
											<span className="ml-7">
												Thin - <br />{' '}
												<span className="ml-4 font-thin">
													The quick brown fox jumps over the lazy dog.!?#@:;
												</span>
											</span>
										</p>
									</div>
								</div>
							</div>

							<div className="flex flex-1 flex-col gap-10">
								{/* Typography */}
								<div className="flex flex-col gap-3">
									<h2 className="text-2xl font-inter font-semibold">Typography</h2>
									<div className="flex flex-col gap-3 ml-[1rem]">
										<p className="font-normal font-monster text-[50px]">
											<span className="font-bold ">Heading 1</span> - 50px
										</p>
										<p className="font-normal font-monster text-[38px]">
											<span className="font-bold">Heading 2</span> - 38px
										</p>
										<p className="font-normal font-monster text-[32px]">
											<span className="font-bold">Heading 3</span> - 32px
										</p>
										<p className="font-normal font-monster text-[28px]">
											<span className="font-bold">Heading 4</span> - 28px
										</p>
										<p className="font-normal font-monster text-[22px]">
											<span className="font-bold">Heading 5</span> - 22px
										</p>
										<p className="font-normal font-monster text-[20px]">
											<span className="font-bold">Heading 6</span> - 20px
										</p>
										<p className="font-normal text-justify font-monster text-[14px]">
											<span className="text-justify">
												Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam eveniet
												repellendus et nesciunt esse sed autem, itaque deleniti dicta doloribus
												quasi nihil molestias necessitatibus quisquam illum perferendis! Cumque,
												dicta officia illum incidunt cum qui aliquam deserunt sint molestiae eaque,
												dolorem nam soluta, suscipit dolorum veniam laborum eos repellat
												consequuntur. Quidem laborum quos asperiores et voluptas neque suscipit qui
												ab corrupti.
											</span>{' '}
											- 14px
										</p>
									</div>
								</div>

								{/* Unordered List */}
								<div className="flex flex-col gap-3">
									<h2 className="text-2xl font-monster font-semibold">Unordered List</h2>
									<p className="text-sm font-normal">Font: Monster, Regular, 14px, color: Text</p>
									<div className="flex flex-col gap-3  ml-[1rem]">
										<ul className="list-disc font-monster font-normal  ml-5">
											<li>Unordered List Item</li>
											<li>Unordered List Item</li>
											<li>Unordered List Item</li>
										</ul>
									</div>
								</div>

								{/* Ordered List */}
								<div className="flex flex-col gap-3">
									<h2 className="text-2xl font-monster font-semibold">Ordered List</h2>
									<p className="text-sm font-normal">Font: Monster, Regular, 14px, color: Text</p>
									<div className="flex flex-col gap-3  ml-[1rem]">
										<ol className="list-decimal font-monster font-normal ml-5">
											<li>Ordered List Item</li>
											<li>Ordered List Item</li>
											<li>Ordered List Item</li>
										</ol>
									</div>
								</div>
							</div>
						</div>
						<div className="w-full h-[1px] bg-white opacity-15"></div>

						{/* buttons */}
						<div className="flex flex-col gap-5">
							<h2 className="text-2xl font-monster font-semibold">Buttons</h2>
							<div className="flex flex-row flex-wrap justify-between gap-5">
								{/* Primary */}
								<div className="flex flex-col gap-3">
									<p className="text-sm font-normal">Font: Monster, Semibold, 18px, color: Text</p>
									<div className="flex flex-col gap-3">
										<div>
											<Primary Title="Primary Button" onClick={() => ButtonFunc('Primary')} />
										</div>
									</div>
								</div>

								{/* Secondary */}
								<div className="flex flex-col gap-3">
									<p className="text-sm font-normal">Font: Monster, Semibold, 18px, color: Text</p>
									<div className="flex flex-col gap-3">
										<div>
											<Secondary Title="Secondary Button" onClick={() => ButtonFunc('Secondary')} />
										</div>
									</div>
								</div>

								{/* Ghost */}
								<div className="flex flex-col gap-3">
									<p className="text-sm font-normal">Font: Monster, Semibold, 18px, color: Text</p>
									<div>
										<Ghost Title="Ghost Button" onClick={() => ButtonFunc('Ghost')} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</section>
		</>
	);
};

export default AboutPage;
