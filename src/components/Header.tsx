'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { logo } from './common';

interface NavButtonProps {
	current: boolean;
	title: string;
	href?: string;
	onClick?: () => void;
	disabled?: boolean;
	extClass?: string;
}

interface ProfileNavigationItem {
	name: string;
	href?: string;
	onclick?: () => void;
}

interface UserData {
	user: {
		avatar: string;
		name: string;
	};
	profileNavigation: ProfileNavigationItem[];
}

interface OpenElementsState {
	mobileMenu: { open: boolean };
	profileMenu: { open: boolean };
	themeMenu: { open: boolean };
}

interface Theme {
	id: string;
	color: string;
	label: string;
}

interface ThemerProps {
	isOpen: boolean;
}

const themes: Theme[] = [
	{ id: 'rocket', color: 'rocket', label: 'Rocket' },
	{ id: 'skeleton', color: 'skeleton', label: 'Skeleton' },
	{ id: 'wintry', color: 'wintry', label: 'Wintry' },
	{ id: 'modern', color: 'modern', label: 'Modern' },
	{ id: 'seafoam', color: 'seafoam', label: 'Seafoam' },
	{ id: 'vintage', color: 'vintage', label: 'Vintage' },
	{ id: 'sahara', color: 'sahara', label: 'Sahara' },
	{ id: 'hamlindigo', color: 'hamlindigo', label: 'Hamlindigo' },
	{ id: 'gold-nouveau', color: 'gold-nouveau', label: 'Gold Nouveau' },
	{ id: 'crimson', color: 'crimson', label: 'Crimson' }
];

const NavButton: React.FC<NavButtonProps> = ({
	current,
	title,
	href = '',
	onClick,
	disabled = false,
	extClass = ''
}) => {
	const classes = useMemo(() => {
		const baseClasses = current
			? ' py-2 text-sm font-light opacity-70 hover:opacity-100 hover:underline text-center text-foreground rounded-lg cursor-pointer bg-slate-700 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-white'
			: ' py-2 text-sm font-light opacity-70 hover:opacity-100 hover:underline text-left text-foreground transition-colors duration-150 bg-transparent rounded-lg cursor-pointer  focus:outline-none focus:ring-1 focus:ring-inset focus:ring-white';

		// Add disabled state classes if disabled
		const disabledClasses = disabled ? ' opacity-50 cursor-not-allowed' : '';

		return baseClasses + disabledClasses + (extClass ? ` ${extClass}` : '');
	}, [current, disabled, extClass]);

	if (href) {
		return (
			<a
				href={href}
				aria-current={current ? 'page' : undefined}
				onClick={onClick}
				className={classes}
			>
				{title}
			</a>
		);
	}

	return (
		<button
			aria-current={current ? 'page' : undefined}
			disabled={disabled}
			onClick={onClick}
			className={classes}
		>
			{title}
		</button>
	);
};

const Themer: React.FC<ThemerProps> = ({ isOpen }) => {
	const [theme, setTheme] = useState<string>('gold-nouveau');

	// Load theme from localStorage on component mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme->antiraid');
			if (savedTheme) {
				setTheme(savedTheme);
				document.querySelector('#antiraid')?.setAttribute('data-theme', savedTheme);
			} else {
				// Set default theme if no theme is saved in localStorage
				document.querySelector('#antiraid')?.setAttribute('data-theme', 'gold-nouveau');
			}
		}
	}, []);

	// Change theme and save to localStorage
	const changeColor = (th: string) => {
		setTheme(th);
		document.querySelector('#antiraid')?.setAttribute('data-theme', th);
		localStorage.setItem('theme->antiraid', th);
	};

	return (
		<>
			{isOpen && (
				<div className="absolute z-50 transition transform translate-y-0 opacity-100 w-56 lg:w-72 -right-5 md:right-0 sm:px-0">
					<div className="overflow-x-hidden overflow-y-scroll bg-background text-foreground rounded-lg shadow-lg dropdown-container ring-1 ring-primary ring-opacity-5">
						<div className="px-1 py-2 space-y-1">
							{themes.map((th) => (
								<button
									key={th.id}
									onClick={() => changeColor(th.id)}
									className={`group flex rounded-md items-center w-full px-3 py-2 transition-all duration-150 ${
										theme === th.id
											? `text-foreground bg-secondary shadow-md shadow-violet-500/10 hover:bg-primary/75`
											: 'text-foreground/75 hover:text-white/100 hover:bg-primary-800/20'
									}`}
								>
									<div data-theme={th.color} className="flex items-center justify-between w-full">
										<span
											className={`text-foreground font-bold font-cabin tracking-tight hover:bg-background-500`}
										>
											{th.label}
										</span>
										<Icon
											icon="ic:round-circle"
											className={`${
												theme === th.id ? 'border-white dark:border-black' : 'border-black/0'
											} border-2 rounded-full bg-secondary/80 mr-1`}
										/>
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const Header = () => {
	const [open, setOpen] = useState<string>('');
	const [openElements, setOpenElements] = useState<OpenElementsState>({
		mobileMenu: { open: false },
		profileMenu: { open: false },
		themeMenu: { open: false }
	});
	const [userData, setUserData] = useState<UserData | null>(null);

	const navigation = [
		{ name: 'Home', href: '/' },
		{ name: 'About', href: '/about' },
		{ name: 'Invite', href: '/invite' },
		{ name: 'Commands', href: '/commands' },
		{ name: 'Forums', href: '/forums' }
	];

	const getAuthCreds = (): any => {
		/* Implementation */
	};
	const getUser = async (userId: string): Promise<any> => {
		/* Implementation */
	};
	const logoutUser = (): void => {
		/* Implementation */
	};
	const loginUser = (): void => {
		/* Implementation */
	};

	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			for (let key in openElements) {
				if (!e.target) return;
				if (
					openElements[key as keyof OpenElementsState].open &&
					!(e.target as HTMLElement).closest(`#${key}-menu`)
				) {
					setOpenElements((prevState) => ({
						...prevState,
						[key]: { open: false }
					}));
				}
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [openElements]);

	useEffect(() => {
		const getLoginData = async () => {
			const authCreds = getAuthCreds();
			if (!authCreds) return null;

			let cachedAuthUser = localStorage.getItem('authUser');
			if (!cachedAuthUser) {
				const userRes = await getUser(authCreds.user_id);
				cachedAuthUser = JSON.stringify(userRes);
				localStorage.setItem('authUser', cachedAuthUser);
			}

			const user = JSON.parse(cachedAuthUser);

			if (!user) {
				logoutUser();
				return;
			}

			const data: UserData = {
				profileNavigation: [
					{ name: 'Dashboard', href: '/dashboard' },
					{ name: 'Developers', href: '/dashboard/developers' },
					{
						name: 'Logout',
						onclick: () => {
							logoutUser();
							window.location.reload();
						}
					}
				],
				user
			};
			setUserData(data);
		};

		getLoginData();
	}, []);

	useEffect(() => {
		navigation.map((p) => {
			if (p.href === window.location.href) setOpen(p.name);
		});
	}, [usePathname()]);

	return (
		<header className="bg-background top-0 w-full my-3">
			<div className="max-w-7xl px-3 mx-auto py-3 flex items-center justify-between">
				<Link href="/">
					<div className="flex items-center space-x-1">
						<img className="h-8 w-auto" src={logo} alt="AntiRaid" />
						<p className="text-md text-foreground font-monster font-semibold tracking-tight">
							AntiRaid
						</p>
					</div>
				</Link>

				<div className="flex items-center space-x-2 relative">
					<div className="flex items-center justify-center space-x-8">
						{navigation.map((item) => (
							<NavButton
								key={item.name}
								title={item.name}
								href={item.href}
								current={item.name === open}
								onClick={() =>
									setOpenElements((prev) => ({
										...prev,
										mobileMenu: { open: false }
									}))
								}
								extClass="hidden md:block"
							/>
						))}
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<button
						type="button"
						className="block md:hidden rounded-md p-2 font-medium text-left text-foreground focus:outline-none"
						onClick={() =>
							setOpenElements((prev) => ({
								...prev,
								mobileMenu: { open: !prev.mobileMenu.open }
							}))
						}
						aria-controls="mobile-menu"
						aria-expanded={openElements.mobileMenu.open}
					>
						<span className="sr-only">Open main menu</span>
						{openElements.mobileMenu.open ? (
							<Icon icon="fa-solid:times" width="15px" />
						) : (
							<Icon icon="fa-solid:bars" width="16px" />
						)}
					</button>

					<span className="relative">
						<button
							name="themer-pane"
							aria-label="View Themes"
							onClick={() =>
								setOpenElements((prev) => ({
									...prev,
									themeMenu: { open: !prev.themeMenu.open }
								}))
							}
							className={
								openElements.themeMenu.open
									? 'px-3 py-2 text-center text-foreground rounded-md bg-secondary bg-opacity-20'
									: 'px-3 py-2 text-center text-foreground bg-transparent rounded-md hover:text-foreground/50'
							}
						>
							<Icon
								icon="mdi:palette"
								className="text-2xl text-foreground hover:text-foreground/50"
							/>
						</button>
						<div id="theme-menu" className="themer-div text-left">
							<Themer isOpen={openElements.themeMenu.open} />
						</div>
					</span>

					{userData ? (
						<div className="w-full">
							<button
								type="button"
								className="flex rounded-full hover:bg-background-200 text-foreground hover:text-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
								onClick={() =>
									setOpenElements((prev) => ({
										...prev,
										profileMenu: { open: !prev.profileMenu.open }
									}))
								}
							>
								<span className="sr-only">Open user menu</span>
								<img
									className="h-8 w-8 rounded-full"
									src={userData.user.avatar}
									alt="User Avatar"
								/>
							</button>

							{openElements.profileMenu.open && (
								<div
									id="profile-menu"
									className="absolute right-0 z-50 w-96 max-w-sm px-4 mt-3 transform -right-0 opacity-100 translate-y-0"
								>
									<div className="dropdown-container overflow-hidden rounded-lg shadow-lg ring-1 ring-black bg-black ring-opacity-5">
										<div className="relative w-full">
											{userData.profileNavigation.map((item) => (
												<div key={item.name}>
													{item.href ? (
														<Link href={item.href} passHref>
															<a
																onClick={() =>
																	setOpenElements((prev) => ({
																		...prev,
																		profileMenu: { open: false }
																	}))
																}
																className="block hover:bg-slate-800 p-7"
															>
																{item.name}
															</a>
														</Link>
													) : (
														<button
															onClick={() => item.onclick && item.onclick()}
															className="text-left block w-full hover:bg-slate-800 p-7"
														>
															{item.name}
														</button>
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					) : (
						<button
							type="button"
							onClick={loginUser}
							className="px-5 py-2 text-sm font-medium text-left text-gray-50 rounded-sm cursor-pointer bg-indigo-600 hover:bg-indigo-800 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-white"
						>
							Login
						</button>
					)}
				</div>
			</div>

			{openElements.mobileMenu.open && (
				<div id="mobile-menu" className="md:hidden">
					<div className="space-y-1 px-2 pt-2 pb-3 mx-5">
						{navigation.map((item) => (
							<NavButton
								key={item.name}
								title={item.name}
								href={item.href}
								current={item.name === open}
								onClick={() =>
									setOpenElements((prev) => ({
										...prev,
										mobileMenu: { open: false }
									}))
								}
								extClass="block"
							/>
						))}
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
