'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from '@/components/ui/motion';
import { useTheme } from 'next-themes';
import {
	Home,
	Info,
	ShoppingCart,
	Terminal,
	User,
	Menu,
	X,
	LayoutDashboard,
	LogOut,
	LogIn,
	ChevronDown,
	Plus
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

interface NavItem {
	name: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	needsFFlag?: FFlag;
}

const NavItems: NavItem[] = [
	{ name: 'Home', href: '/', icon: Home },
	{ name: 'About', href: '/about', icon: Info },
	{ name: 'Invite', href: '/invite', icon: Plus },
	{
		name: 'Script Shop',
		href: '/script/shop',
		icon: ShoppingCart,
		needsFFlag: FFlag.Header_ScriptShopVisible
	},
	{ name: 'Commands', href: '/commands', icon: Terminal }
];

const NavBar: React.FC = () => {
	const [currentPath, setCurrentPath] = useState<string>('/');
	const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);
	const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
	const [userData, setUserData] = useState<PartialUser | null>(null);
	const [scrolled, setScrolled] = useState(false);
	const { theme } = useTheme();
	const navigate = useNavigate();
	const { location } = useRouterState();
	const pathname = location.pathname;

	const themeRef = useRef<HTMLDivElement>(null);
	const desktopThemeRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);

	const { authData } = useAuthCheck();
	const { fflags, isLoaded } = useFFlags();

	useEffect(() => {
		setCurrentPath(pathname || '/');
		setIsProfileOpen(false);
		setIsMobileMenuOpen(false);
		setIsThemeOpen(false);
	}, [pathname]);

	// Handle scroll effect for glassmorphism intensity
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const isOutsideTheme =
				(!themeRef.current || !themeRef.current.contains(target)) &&
				(!desktopThemeRef.current || !desktopThemeRef.current.contains(target));
			const isOutsideProfile = !profileRef.current || !profileRef.current.contains(target);

			if (isOutsideTheme && isOutsideProfile) {
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
				const user = cachedUser ? cachedUser : null;
				if (user) {
					setUserData(JSON.parse(user));
				}
			} catch (error) {
				console.error('Failed to fetch user data', error);
				setUserData(null);
			}
		};
		fetchUserData();
	}, [authData, pathname, navigate]);

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
		setIsProfileOpen(false);
		setIsMobileMenuOpen(false);
		navigate({ to: '/' });
		setUserData(null);
	};

	const ProfileMenu = () => (
		<AnimatePresence>
			{isProfileOpen && (
				<motion.div
					initial={{ opacity: 0, y: 10, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 10, scale: 0.95 }}
					transition={{ duration: 0.2 }}
					className="absolute right-0 top-full mt-4 w-60 bg-background/95 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
					ref={profileRef}
				>
					<div className="p-2 space-y-1">
						{[
							{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
							{ name: 'Developer', href: '/dashboard/developers', icon: Terminal },
							{ name: 'Logout', onClick: handleLogout, icon: LogOut, danger: true }
						].map((item) =>
							item.href ? (
								<Link
									key={item.name}
									to={item.href}
									className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/5 rounded-xl transition-all group"
									onClick={() => {
										setIsProfileOpen(false);
										setIsMobileMenuOpen(false);
									}}
								>
									<item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
									{item.name}
								</Link>
							) : (
								<button
									key={item.name}
									onClick={item.onClick}
									className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all group text-left ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-foreground/80 hover:text-foreground hover:bg-white/5'}`}
								>
									<item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
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
		<header
			className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'pt-4' : 'pt-6'}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				<motion.nav
					layout
					className={`
                        relative flex items-center justify-between
                        h-14 md:h-16 px-2 md:px-4
                        bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30
                        border border-white/10
                        rounded-full
                        shadow-[0_8px_32px_-12px_rgba(0,0,0,0.3)]
                        transition-all duration-500
                    `}
				>
					{/* Logo */}
					<div className="flex-1 flex items-center pl-2 lg:pl-4">
						<Link to="/" className="flex items-center gap-2 group relative">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<motion.img
									whileHover={{ rotate: 360, scale: 1.1 }}
									transition={{ duration: 0.5 }}
									src={getLogoPath()}
									alt="AntiRaid"
									className="h-8 w-8 lg:h-9 lg:w-9 rounded-full relative z-10"
								/>
							</div>
							<span className="text-lg lg:text-xl font-bold font-monster tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary/80 group-hover:to-primary transition-all duration-300">
								AntiRaid
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex flex-[3] items-center justify-center">
						<div className="flex items-center gap-1 lg:gap-1.5 p-1 bg-white/[0.03] backdrop-blur-2xl rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
							{NavItems.filter((x) => !x.needsFFlag || !isLoaded || fflags.has(x.needsFFlag!)).map(
								(item) => {
									const isActive = currentPath === item.href;
									return (
										<Link
											key={item.name}
											to={item.href}
											className={`
                                            relative px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-300
                                            flex items-center gap-2 lg:gap-2.5 whitespace-nowrap group/nav
                                            ${isActive ? 'text-primary-foreground' : 'text-foreground/70 hover:text-foreground'}
                                        `}
										>
											{isActive && (
												<motion.div
													layoutId="nav-pill"
													className="absolute inset-0 bg-primary shadow-[0_4px_16px_rgba(var(--primary),0.4)] rounded-full"
													initial={false}
													transition={{ type: 'spring', stiffness: 400, damping: 30 }}
												/>
											)}
											<span className="relative z-10 flex items-center gap-2 lg:gap-2.5">
												<item.icon
													className={`w-4 h-4 lg:w-4.5 lg:h-4.5 transition-transform duration-300 ${isActive ? '' : 'group-hover/nav:scale-110'}`}
												/>
												{item.name}
											</span>
										</Link>
									);
								}
							)}
						</div>
					</div>

					{/* Right Actions */}
					<div className="flex-1 flex items-center justify-end gap-2 pr-2 lg:pr-4">
						{/* Desktop Theme Toggle */}
						<div className="hidden md:block" ref={desktopThemeRef}>
							<ThemeSelector
								isOpen={isThemeOpen}
								onOpenChange={setIsThemeOpen}
								variant="dropdown"
							/>
						</div>

						<div className="h-6 w-px bg-white/10 hidden md:block" />

						{/* Profile / Login */}
						<div className="relative">
							{userData ? (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => toggleDropdown('profile')}
									className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-secondary/30 hover:bg-secondary/50 border border-white/5 transition-all"
								>
									<img
										src={userData ? getAvatarUrl(userData) : getLogoPath()}
										alt="User"
										className="h-7 w-7 rounded-full ring-2 ring-primary/20"
									/>
									<span className="text-sm font-medium max-w-[80px] truncate hidden md:block">
										{userData.username}
									</span>
									<ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
								</motion.button>
							) : (
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => {
										loginUser();
										navigate({ to: '/dashboard' });
									}}
									className="group relative px-5 py-2 rounded-full overflow-hidden bg-primary"
								>
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
									<span className="relative flex items-center gap-2 text-sm font-bold text-primary-foreground">
										Login <LogIn className="w-3 h-3" />
									</span>
								</motion.button>
							)}
							<ProfileMenu />
						</div>

						{/* Mobile Menu Toggle */}
						<div className="md:hidden ml-2">
							<motion.button
								whileTap={{ scale: 0.9 }}
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="p-2 rounded-full bg-secondary/30 text-foreground"
							>
								{isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
							</motion.button>
						</div>
					</div>
				</motion.nav>
			</div>

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -20, scale: 0.95 }}
						className="absolute top-24 inset-x-4 p-4 bg-background/98 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40 md:hidden flex flex-col gap-2"
					>
						<div className="flex items-center justify-between mb-4 px-2">
							<span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
								Navigation
							</span>
							<div ref={themeRef}>
								<ThemeSelector isOpen={isThemeOpen} onOpenChange={setIsThemeOpen} variant="sheet" />
							</div>
						</div>
						{NavItems.map((item) => (
							<Link
								key={item.name}
								to={item.href}
								onClick={() => setIsMobileMenuOpen(false)}
								className={`
                                    flex items-center gap-3 p-3 rounded-xl transition-all
                                    ${currentPath === item.href ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'}
                                `}
							>
								<item.icon className="w-5 h-5" />
								{item.name}
							</Link>
						))}
						<div className="h-px bg-white/5 my-2" />

						{userData ? (
							<div className="flex flex-col gap-1">
								<div className="px-3 py-2 flex items-center gap-3">
									<img src={getAvatarUrl(userData)} className="w-8 h-8 rounded-full" alt="" />
									<div className="flex flex-col">
										<span className="text-sm font-bold">{userData.username}</span>
										<span className="text-[10px] text-muted-foreground uppercase tracking-widest">
											Account
										</span>
									</div>
								</div>
								{[
									{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
									{ name: 'Developer', href: '/dashboard/developers', icon: Terminal },
									{ name: 'Logout', onClick: handleLogout, icon: LogOut, danger: true }
								].map((item) =>
									item.href ? (
										<Link
											key={item.name}
											to={item.href}
											onClick={() => setIsMobileMenuOpen(false)}
											className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
										>
											<item.icon className="w-5 h-5" />
											{item.name}
										</Link>
									) : (
										<button
											key={item.name}
											onClick={item.onClick}
											className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
										>
											<item.icon className="w-5 h-5" />
											{item.name}
										</button>
									)
								)}
							</div>
						) : (
							<button
								onClick={() => {
									loginUser();
									setIsMobileMenuOpen(false);
								}}
								className="flex items-center gap-3 p-3 rounded-xl bg-primary text-primary-foreground font-bold"
							>
								<LogIn className="w-5 h-5" />
								Login
							</button>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
};

export default NavBar;
