'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
	Home,
	Info,
	ShoppingCart,
	Terminal,
	MessageCircle,
	PaletteIcon,
	Plus,
	LogOut,
	LayoutDashboard,
	User,
	Menu,
	X
} from 'lucide-react';
import { loginUser } from '@/lib/auth/login';
import { logoutUser } from '@/lib/auth/logoutUser';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';
import { getUser } from '@/lib/auth/getUser';
import { useAuthCheck } from '@/lib/auth/checkAuthCreds';
import ThemeSelector from '@/components/static/ThemeSwitcher';

interface NavItem {
	name: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
}

const NavItems: NavItem[] = [
	{ name: 'Home', href: '/', icon: Home },
	{ name: 'About', href: '/about', icon: Info },
	{ name: 'Invite', href: '/invite', icon: Plus },
	{ name: 'Script Shop', href: '/script/shop', icon: ShoppingCart },
	{ name: 'Commands', href: '/commands', icon: Terminal },
	{ name: 'Forums', href: '/forums', icon: MessageCircle }
];

const NavBar: React.FC = () => {
	const [currentPath, setCurrentPath] = useState<string>('/');
	const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);
	const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
	const [userData, setUserData] = useState<any>(null);
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();
	const router = useRouter();

	const themeRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);

	const { authData, mutateAuth } = useAuthCheck(getAuthCreds());

	useEffect(() => {
		setCurrentPath(pathname || '/');
	}, [pathname]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				themeRef.current &&
				!themeRef.current.contains(event.target as Node) &&
				profileRef.current &&
				!profileRef.current.contains(event.target as Node)
			) {
				setIsThemeOpen(false);
				setIsProfileOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const fetchUserData = async () => {
			const authCreds = getAuthCreds();
			if (!authCreds) return;

			try {
				const cachedUser = localStorage.getItem('authUser');
				const user = cachedUser ? JSON.parse(cachedUser) : await getUser(authCreds.user_id);

				localStorage.setItem('authUser', JSON.stringify(user));
				setUserData(user);
			} catch (error) {
				console.error('Failed to fetch user data', error);
				setUserData(null);
			}
		};

		fetchUserData();
	}, [authData, pathname, router]);

	useEffect(() => {
		const checkSessionExpiry = () => {
			const authCreds = getAuthCreds();
			if (!authCreds) return;

			const sessionExpiryTime = Number(authCreds.expiry);
			const currentTime = new Date().getTime();

			if (currentTime >= sessionExpiryTime) {
				handleLogout();
			}
		};

		// Check session every 5 minutes
		const interval = setInterval(checkSessionExpiry, 300000);

		return () => clearInterval(interval);
	}, []);

	const getLogoPath = () => {
		if (theme === 'dark-red-theme') return '/AR_Logo_Red.webp';
		if (theme === 'green-theme') return '/AR_Logo_Green.webp';
		return '/logo.webp';
	};

	const toggleDropdown = (dropdown: 'theme' | 'profile') => {
		if (dropdown === 'theme') {
			setIsProfileOpen(false);
			setIsThemeOpen((prev) => !prev);
		} else {
			setIsThemeOpen(false);
			setIsProfileOpen((prev) => !prev);
		}
	};

	const handleLogout = async () => {
		await logoutUser();
		router.push('/');
		setUserData(null); // Clear user data on logout
	};

	const ProfileMenu = () => (
		<AnimatePresence>
			{(isProfileOpen || isMobileMenuOpen) && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="absolute right-0 top-full mt-2 w-64 bg-card rounded-lg shadow-xl ring-1 ring-border z-50"
					ref={profileRef}
				>
					<div className="py-1">
						{[
							{
								name: 'Dashboard',
								href: '/dashboard',
								icon: LayoutDashboard
							},
							{
								name: 'Developer',
								href: '/dashboard/developers',
								icon: User
							},
							{
								name: 'Logout',
								onClick: handleLogout,
								icon: LogOut
							}
						].map((item) =>
							item.href ? (
								<Link
									key={item.name}
									href={item.href}
									className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
									onClick={() => {
										setIsProfileOpen(false);
										setIsMobileMenuOpen(false);
									}}
								>
									<item.icon className="mr-3 h-5 w-5 text-muted-foreground" />
									{item.name}
								</Link>
							) : (
								<button
									key={item.name}
									onClick={item.onClick}
									className="w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
								>
									<item.icon className="mr-3 h-5 w-5 text-muted-foreground" />
									{item.name}
								</button>
							)
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	return (
		<header className="sticky top-0 z-50 backdrop-blur-md shadow-sm bg-background/75">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<nav className="flex items-center justify-between h-16">
					{/* Logo Section */}
					<div className="flex items-center space-x-2">
						<Link href="/" className="flex items-center">
							<img
								src={getLogoPath()}
								alt="AntiRaid Logo"
								className="h-8 w-auto rounded-full mr-2"
							/>
							<span className="text-xl font-bold text-foreground">AntiRaid</span>
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center space-x-2">
						<button
							onClick={() => {
								setIsMobileMenuOpen(!isMobileMenuOpen);
								setIsThemeOpen(false);
								setIsProfileOpen(false);
							}}
							className="p-2 rounded-full hover:bg-accent transition-colors"
						>
							{isMobileMenuOpen ? (
								<X className="h-6 w-6 text-muted-foreground" />
							) : (
								<Menu className="h-6 w-6 text-muted-foreground" />
							)}
						</button>
						<div className="relative">
							<ThemeSelector />
						</div>
						<div className="relative">
							{userData ? (
								<button
									onClick={() => toggleDropdown('profile')}
									className="flex items-center space-x-2"
								>
									<img
										src={userData.user?.avatar || getLogoPath()}
										alt="User Avatar"
										className="h-8 w-8 rounded-full ring-2 ring-primary"
									/>
								</button>
							) : (
								<button
									onClick={() => {
										loginUser();
										router.push('/dashboard');
									}}
									className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
								>
									Login
								</button>
							)}
							<ProfileMenu />
						</div>
					</div>

					{/* Navigation Links */}
					<div className={`hidden md:flex space-x-4`}>
						{NavItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${
										currentPath === item.href
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-accent'
									}
                `}
							>
								<motion.div whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
									<item.icon className="h-4 w-4 mr-2" />
								</motion.div>
								{item.name}
							</Link>
						))}
					</div>

					{/* Mobile Menu */}
					<AnimatePresence>
						{isMobileMenuOpen && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="md:hidden absolute top-full left-0 w-full bg-card rounded-lg shadow-xl ring-1 ring-border z-50"
							>
								<div className="py-1">
									{NavItems.map((item) => (
										<Link
											key={item.name}
											href={item.href}
											className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											<motion.div
												whileHover={{ x: 5 }}
												transition={{ type: 'spring', stiffness: 300 }}
											>
												<item.icon className="mr-3 h-5 w-5 text-muted-foreground" />
											</motion.div>
											{item.name}
										</Link>
									))}
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Action Buttons */}
					<div className="hidden md:flex items-center space-x-4">
						{/* Theme Switcher */}
						<div className="relative">
							<ThemeSelector />
						</div>

						{/* Profile/Login Section */}
						<div className="relative">
							{userData ? (
								<button
									onClick={() => toggleDropdown('profile')}
									className="flex items-center space-x-2"
								>
									<img
										src={userData.user?.avatar || getLogoPath()}
										alt="User Avatar"
										className="h-8 w-8 rounded-full ring-2 ring-primary"
									/>
								</button>
							) : (
								<button
									onClick={() => {
										loginUser();
										router.push('/dashboard');
									}}
									className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
								>
									Login
								</button>
							)}
							<ProfileMenu />
						</div>
					</div>
				</nav>
			</div>
		</header>
	);
};

export default NavBar;
