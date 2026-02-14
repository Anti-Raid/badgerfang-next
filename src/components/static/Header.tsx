'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
	Menu,
	X,
	LayoutDashboard,
	LogOut,
	LogIn,
	ChevronDown,
	Terminal
} from 'lucide-react';
import { loginUser } from '@/lib/auth/login';
import { logoutUser } from '@/lib/auth/logoutUser';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';
import { useAuthCheck } from '@/lib/auth/checkAuthCreds';
import ThemeSelector from '@/components/static/ThemeSwitcher';
import { getAvatarUrl } from '@/lib/auth/getAvatarUrl';
import { PartialUser } from '@/types/api/bindings/PartialUser';
import { FFlag } from '@/lib/fflags/fflags';
import { useFFlags } from '../ui/FFlagProvider';

const NavItems = [
	{ name: 'Home', href: '/' },
	{ name: 'About', href: '/about' },
	{ name: 'Commands', href: '/commands' },
	{ name: 'Invite', href: '/invite' },
	{ name: 'Script Shop', href: '/script/shop', needsFFlag: FFlag.Header_ScriptShopVisible }
];

const NavBar: React.FC = () => {
	const [currentPath, setCurrentPath] = useState<string>('/');
	const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);
	const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
	const [userData, setUserData] = useState<PartialUser | null>(null);
	const [scrolled, setScrolled] = useState(false);
	const { theme } = useTheme();
	const pathname = usePathname();
	const router = useRouter();

	const themeRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);

	const { authData } = useAuthCheck();
	const { fflags, isLoaded } = useFFlags();

	useEffect(() => {
		setCurrentPath(pathname || '/');
		setIsProfileOpen(false);
		setIsMobileMenuOpen(false);
		setIsThemeOpen(false);
	}, [pathname]);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				profileRef.current &&
				!profileRef.current.contains(target) &&
				themeRef.current &&
				!themeRef.current.contains(target)
			) {
				setIsThemeOpen(false);
				setIsProfileOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		const fetchUserData = async () => {
			const authCreds = getAuthCreds();
			if (!authCreds) return;
			try {
				const cachedUser = localStorage.getItem('authUser');
				if (cachedUser) setUserData(JSON.parse(cachedUser));
			} catch (error) {
				console.error('Failed to fetch user data', error);
				setUserData(null);
			}
		};
		fetchUserData();
	}, [authData, pathname, router]);

	const getLogoPath = () => {
		if (theme === 'dark-red-theme') return '/AR_Logo_Red.webp';
		if (theme === 'green-theme') return '/AR_Logo_Green.webp';
		return '/logo.webp';
	};

	const handleLogout = async () => {
		await logoutUser();
		setIsProfileOpen(false);
		setIsMobileMenuOpen(false);
		router.push('/');
		setUserData(null);
	};

	return (
		<header
			className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
				scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'
			}`}
			role="banner"
		>
			<div className="max-w-6xl mx-auto px-6">
				<nav
					className="flex items-center justify-between h-16"
					role="navigation"
					aria-label="Main navigation"
				>
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3">
						<img
							src={getLogoPath()}
							alt="AntiRaid"
							className="h-8 w-8 rounded-lg"
						/>
						<span className="text-lg font-semibold text-foreground">AntiRaid</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-1">
						{NavItems.filter(
							(x) => !x.needsFFlag || !isLoaded || fflags.has(x.needsFFlag!)
						).map((item) => {
							const isActive = currentPath === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
										isActive
											? 'text-foreground bg-accent'
											: 'text-muted-foreground hover:text-foreground'
									}`}
								>
									{item.name}
								</Link>
							);
						})}
					</div>

					{/* Right Actions */}
					<div className="flex items-center gap-3">
						{/* Theme Toggle */}
						<div className="hidden md:block" ref={themeRef}>
							<ThemeSelector
								isOpen={isThemeOpen}
								onOpenChange={setIsThemeOpen}
								variant="dropdown"
							/>
						</div>

						{/* Profile / Login */}
						<div className="relative hidden md:block" ref={profileRef}>
							{userData ? (
								<button
									onClick={() => setIsProfileOpen(!isProfileOpen)}
									className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent transition-colors"
								>
									<img
										src={getAvatarUrl(userData)}
										alt=""
										className="h-7 w-7 rounded-full"
									/>
									<span className="text-sm font-medium text-foreground max-w-[100px] truncate">
										{userData.username}
									</span>
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								</button>
							) : (
								<button
									onClick={() => {
										loginUser();
										router.push('/dashboard');
									}}
									className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
								>
									Login
								</button>
							)}

							{/* Profile Dropdown */}
							<AnimatePresence>
								{isProfileOpen && userData && (
									<motion.div
										initial={{ opacity: 0, y: 8, scale: 0.96 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 8, scale: 0.96 }}
										transition={{ duration: 0.15 }}
										className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
									>
										<div className="p-1">
											<Link
												href="/dashboard"
												onClick={() => setIsProfileOpen(false)}
												className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
											>
												<LayoutDashboard className="w-4 h-4" />
												Dashboard
											</Link>
											<Link
												href="/dashboard/developers"
												onClick={() => setIsProfileOpen(false)}
												className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
											>
												<Terminal className="w-4 h-4" />
												Developer
											</Link>
											<div className="h-px bg-border my-1" />
											<button
												onClick={handleLogout}
												className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
											>
												<LogOut className="w-4 h-4" />
												Logout
											</button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
							aria-label="Toggle menu"
						>
							{isMobileMenuOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</button>
					</div>
				</nav>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="md:hidden bg-background border-t border-border overflow-hidden"
					>
						<div className="px-6 py-4 space-y-1">
							{NavItems.filter(
								(x) => !x.needsFFlag || !isLoaded || fflags.has(x.needsFFlag!)
							).map((item) => (
								<Link
									key={item.name}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
										currentPath === item.href
											? 'bg-accent text-foreground'
											: 'text-muted-foreground hover:bg-accent hover:text-foreground'
									}`}
								>
									{item.name}
								</Link>
							))}

							<div className="h-px bg-border my-4" />

							<div className="flex items-center justify-between px-4 py-2">
								<span className="text-sm text-muted-foreground">Theme</span>
								<ThemeSelector
									isOpen={isThemeOpen}
									onOpenChange={setIsThemeOpen}
									variant="sheet"
								/>
							</div>

							<div className="h-px bg-border my-4" />

							{userData ? (
								<>
									<div className="flex items-center gap-3 px-4 py-3">
										<img
											src={getAvatarUrl(userData)}
											alt=""
											className="h-10 w-10 rounded-full"
										/>
										<div>
											<p className="font-medium text-foreground">{userData.username}</p>
											<p className="text-sm text-muted-foreground">Logged in</p>
										</div>
									</div>
									<Link
										href="/dashboard"
										onClick={() => setIsMobileMenuOpen(false)}
										className="block px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
									>
										Dashboard
									</Link>
									<button
										onClick={handleLogout}
										className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
									>
										Logout
									</button>
								</>
							) : (
								<button
									onClick={() => {
										loginUser();
										setIsMobileMenuOpen(false);
									}}
									className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-base font-semibold"
								>
									<LogIn className="w-5 h-5" />
									Login
								</button>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
};

export default NavBar;
