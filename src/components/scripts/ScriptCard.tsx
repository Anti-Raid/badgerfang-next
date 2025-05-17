'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
	FiPackage,
	FiClock,
	FiGitBranch,
	FiServer,
	FiDownload,
	FiStar,
	FiEye,
	FiZap
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import type { TemplateShopProps } from '@/types/script';
import { anonuserDetails } from '@/lib/api';
import { format, isValid } from 'date-fns';

interface CommonCardProps {
	template: TemplateShopProps;
}

interface CreatorDetails {
	username: string;
	avatar: string;
}

export const CommonCard = ({ template }: CommonCardProps) => {
	const router = useRouter();
	const [creator, setCreator] = useState<CreatorDetails | null>(null);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		const fetchCreator = async () => {
			try {
				const data = await anonuserDetails(template.created_by);
				setCreator({
					username: data.user.username,
					avatar: data.user.avatar
				});
			} catch (error) {
				console.error('Failed to fetch creator details:', error);
			}
		};

		if (template.created_by) {
			fetchCreator();
		}
	}, [template.created_by]);

	const handleViewClick = () => {
		router.push(`/script/auto-slowdown`);
	};

	const truncate = (str: string, maxLength: number) => {
		return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
	};

	const convertToISO = (dateString: string) => {
		// Remove the ' UTC' suffix and replace space with 'T'
		return dateString.replace(' UTC', '').replace(' ', 'T') + 'Z';
	};

	const safeFormatDate = (dateString: string) => {
		const isoDateString = convertToISO(dateString);
		const date = new Date(isoDateString);
		if (isValid(date)) {
			return format(date, 'MMM d, yyyy');
		} else {
			console.error(`Invalid date string: ${dateString}`);
			return 'Invalid Date';
		}
	};

	const formattedCreatedDate = safeFormatDate(template.created_at);
	const formattedUpdatedDate = safeFormatDate(template.last_updated_at);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			className="group relative bg-card rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border border-primary/20 hover:border-primary/40"
			style={{
				boxShadow: isHovered
					? '0 25px 50px -12px rgba(var(--primary), 0.25), 0 0 15px rgba(var(--primary), 0.1)'
					: '0 10px 30px -15px rgba(0, 0, 0, 0.2)'
			}}
		>
			{/* Animated gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			{/* Glowing border effect on hover */}
			<div
				className="absolute -inset-[1px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"
				style={{ animationDuration: '3s' }}
			></div>

			<div className="relative">
				<div className="relative bg-gradient-to-r from-primary to-accent p-6 overflow-hidden">
					{/* Animated background elements */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-3xl"></div>

					{/* Cyberpunk grid overlay */}
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTM5IDFIMXYzOGgzOFYxeiIgZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>

					<div className="flex items-start justify-between mb-4 relative z-10">
						<div className="flex items-center space-x-3">
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ type: 'spring', stiffness: 500 }}
								className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 group-hover:border-white/30 transition-all duration-300"
							>
								<FiPackage className="w-7 h-7 text-white" />
							</motion.div>
							<motion.h3
								initial={{ x: -10, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.1 }}
								className="font-monster font-bold text-xl text-white"
							>
								{template.name}
							</motion.h3>
						</div>
						<motion.span
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-sm font-monster font-semibold rounded-full shadow-lg border border-white/20 group-hover:border-white/30 transition-all duration-300"
						>
							v{template.version}
						</motion.span>
					</div>

					<motion.p
						initial={{ y: 10, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="text-white/90 text-base font-inter line-clamp-2 ml-[52px]"
					>
						{template.description}
					</motion.p>

					{template.tags && (
						<motion.div
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="flex flex-wrap gap-2 mt-3 ml-[52px]"
						>
							{template.tags.map((tag, index) => (
								<motion.span
									key={index}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ delay: 0.4 + index * 0.1 }}
									whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
									className="px-3 py-1 bg-white/10 text-white/90 text-xs font-monster rounded-full border border-white/10 backdrop-blur-sm shadow-sm"
								>
									{tag}
								</motion.span>
							))}
						</motion.div>
					)}
				</div>

				<div className="p-6 space-y-6 relative">
					<div className="grid grid-cols-2 gap-6">
						<div className="space-y-4">
							<motion.div
								initial={{ x: -10, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.5 }}
								className="flex items-center space-x-3"
							>
								<div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors duration-300">
									<FiServer className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-inter">Server</p>
									<p className="font-monster font-semibold text-foreground">
										{template.owner_guild.length > 10
											? `${template.owner_guild.slice(0, 10)}...`
											: template.owner_guild}
									</p>
								</div>
							</motion.div>

							<motion.div
								initial={{ x: -10, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.6 }}
								className="flex items-center space-x-3"
							>
								{creator?.avatar && (
									<motion.img
										src={creator.avatar}
										alt="Creator Avatar"
										className="w-10 h-10 rounded-xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-md"
										whileHover={{ scale: 1.1 }}
									/>
								)}
								<div>
									<p className="text-muted-foreground text-sm font-inter">Creator</p>
									<p className="font-monster font-semibold text-foreground max-w-[150px] truncate">
										{creator ? truncate(creator.username, 12) : 'Unknown'}
									</p>
								</div>
							</motion.div>
						</div>

						<div className="space-y-4">
							<motion.div
								initial={{ x: 10, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.5 }}
								className="flex items-center space-x-3"
							>
								<div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors duration-300">
									<FiClock className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-inter">Created</p>
									<p className="font-monster font-semibold text-foreground">
										{formattedCreatedDate}
									</p>
								</div>
							</motion.div>

							<motion.div
								initial={{ x: 10, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.6 }}
								className="flex items-center space-x-3"
							>
								<div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors duration-300">
									<FiGitBranch className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-inter">Updated</p>
									<p className="font-monster font-semibold text-foreground">
										{formattedUpdatedDate}
									</p>
								</div>
							</motion.div>
						</div>
					</div>

					{(template.downloads !== undefined || template.rating !== undefined) && (
						<motion.div
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.7 }}
							className="flex items-center justify-between px-4 py-3 bg-muted/40 rounded-xl backdrop-blur-sm border border-border/50 group-hover:border-primary/20 transition-all duration-300"
						>
							{template.downloads !== undefined && (
								<div className="flex items-center space-x-2">
									<FiDownload className="text-primary" />
									<span className="text-foreground font-medium">
										{template.downloads.toLocaleString()}
									</span>
								</div>
							)}

							{template.rating !== undefined && (
								<div className="flex items-center space-x-2">
									<FiStar className="text-yellow-500" />
									<span className="text-foreground font-medium">{template.rating.toFixed(1)}</span>
								</div>
							)}
						</motion.div>
					)}

					<motion.div
						initial={{ y: 10, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.8 }}
						className="flex gap-3"
					>
						<motion.button
							whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(var(--primary), 0.3)' }}
							whileTap={{ scale: 0.98 }}
							onClick={handleViewClick}
							className="relative flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden group"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
							<FiEye className="w-4 h-4 relative z-10" />
							<span className="relative z-10">View Details</span>
						</motion.button>

						<motion.button
							whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(var(--primary), 0.2)' }}
							whileTap={{ scale: 0.98 }}
							className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group"
						>
							<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							<FiZap className="w-4 h-4 relative z-10" />
						</motion.button>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
};
