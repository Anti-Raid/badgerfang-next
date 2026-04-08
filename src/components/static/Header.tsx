'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X, LayoutDashboard, LogOut, LogIn, ChevronDown, Terminal, ArrowRight } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
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
				scrolled
					? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm shadow-black/10'
					: 'bg-transparent'
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
					<Link href="/" className="flex items-center gap-2.5 group">
						<div className="relative">
							<img
								src={getLogoPath()}
								alt="AntiRaid"
								className="h-8 w-8 rounded-lg group-hover:shadow-md group-hover:shadow-primary/30 transition-shadow"
							/>
						</div>
						<span className="text-lg font-bold text-foreground tracking-tight">AntiRaid</span>
					</Link>

					{/* Desktop Nav */}
					<div className="hidden md:flex items-center gap-0.5">
						{NavItems.filter((x) => !x.needsFFlag || !isLoaded || fflags.has(x.needsFFlag!)).map(
							(item) => {
								const isActive = currentPath === item.href;
								return (
									<Link
										key={item.name}
										href={item.href}
										className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
											isActive
												? 'text-primary bg-primary/10 border border-primary/20'
												: 'text-muted-foreground hover:text-foreground hover:bg-accent'
										}`}
									>
										{item.name}
									</Link>
								);
							}
						)}
					</div>

					{/* Right Actions */}
					<div className="flex items-center gap-2.5">
						{/* Theme Toggle */}
						<div className="hidden md:block" ref={themeRef}>
							<ThemeSelector
								isOpen={isThemeOpen}
								onOpenChange={setIsThemeOpen}
								variant="dropdown"
							/>
						</div>

						{/* Invite shortcut (desktop) */}
						<Link
							href="/invite"
							className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all"
						>
							<FaDiscord className="w-4 h-4" />
							Add to Server
						</Link>

						{/* Profile / Login */}
						<div className="relative hidden md:block" ref={profileRef}>
							{userData ? (
								<>
									<button
										onClick={() => setIsProfileOpen(!isProfileOpen)}
										className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent transition-colors border border-transparent hover:border-border"
									>
										<img
											src={getAvatarUrl(userData)}
											alt=""
											className="h-7 w-7 rounded-full ring-2 ring-primary/20"
										/>
										<span className="text-sm font-semibold text-foreground max-w-[100px] truncate">
											{userData.username}
										</span>
										<ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
									</button>

									{/* Profile dropdown */}
									<div
										className={`absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden transition-all duration-150 origin-top-right ${
											isProfileOpen
												? 'opacity-100 scale-100 pointer-events-auto'
												: 'opacity-0 scale-95 pointer-events-none'
										}`}
									>
										{/* User info */}
										<div className="px-4 py-3 border-b border-border bg-accent/30">
											<p className="text-xs text-muted-foreground">Signed in as</p>
											<p className="text-sm font-bold text-foreground truncate">
												{userData.username}
											</p>
										</div>
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
									</div>
								</>
							) : (
								<button
									onClick={() => {
										loginUser();
										router.push('/dashboard');
									}}
									className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
								>
									Login
								</button>
							)}
						</div>

						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="md:hidden p-2.5 rounded-xl hover:bg-accent transition-colors"
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
			<div
				className={`md:hidden bg-background/95 backdrop-blur-xl border-t border-border overflow-hidden transition-all duration-250 ${
					isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				<div className="px-6 py-5 space-y-1.5">
					{NavItems.filter((x) => !x.needsFFlag || !isLoaded || fflags.has(x.needsFFlag!)).map(
						(item) => (
							<Link
								key={item.name}
								href={item.href}
								onClick={() => setIsMobileMenuOpen(false)}
								className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
									currentPath === item.href
										? 'bg-primary/10 text-primary border border-primary/20'
										: 'text-muted-foreground hover:bg-accent hover:text-foreground'
								}`}
							>
								{item.name}
								{currentPath === item.href && (
									<span className="w-1.5 h-1.5 rounded-full bg-primary" />
								)}
							</Link>
						)
					)}

					<div className="h-px bg-border my-4" />

					{/* Theme */}
					<div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-accent/30">
						<span className="text-sm font-semibold text-foreground">Theme</span>
						<ThemeSelector isOpen={isThemeOpen} onOpenChange={setIsThemeOpen} variant="sheet" />
					</div>

					<div className="h-px bg-border my-4" />

					{/* Auth */}
					{userData ? (
						<>
							<div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/30">
								<img
									src={getAvatarUrl(userData)}
									alt=""
									className="h-10 w-10 rounded-full ring-2 ring-primary/20"
								/>
								<div className="min-w-0">
									<p className="font-bold text-foreground truncate">{userData.username}</p>
									<p className="text-xs text-muted-foreground">Signed in</p>
								</div>
							</div>
							<Link
								href="/dashboard"
								onClick={() => setIsMobileMenuOpen(false)}
								className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
							>
								<LayoutDashboard className="w-5 h-5" />
								Dashboard
							</Link>
							<button
								onClick={handleLogout}
								className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-destructive hover:bg-destructive/10 transition-colors"
							>
								<LogOut className="w-5 h-5" />
								Logout
							</button>
						</>
					) : (
						<button
							onClick={() => {
								loginUser();
								setIsMobileMenuOpen(false);
							}}
							className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-bold"
						>
							<LogIn className="w-5 h-5" />
							Login with Discord
						</button>
					)}

					{/* Mobile invite CTA */}
					<Link
						href="/invite"
						onClick={() => setIsMobileMenuOpen(false)}
						className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-card border border-border rounded-xl text-base font-bold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
					>
						<FaDiscord className="w-5 h-5 text-primary" />
						Add AntiRaid to Your Server
						<ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
					</Link>
				</div>
			</div>
		</header>
	);
};

export default NavBar;
