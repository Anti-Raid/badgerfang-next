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
	FiEye
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { TemplateShopProps } from '@/types/script';
import { anonuserDetails } from '@/lib/api';

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
		router.push(`/script/${template.name}`);
	};

	const truncate = (str: string, maxLength: number) => {
		return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="group relative bg-card rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40"
		>
			<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			<div className="relative bg-gradient-to-r from-primary to-accent p-6">
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="p-2.5 bg-background/10 rounded-xl backdrop-blur-sm shadow-lg">
							<FiPackage className="w-7 h-7 text-white" />
						</div>
						<h3 className="font-monster font-bold text-xl text-white">{template.name}</h3>
					</div>
					<span className="px-4 py-1.5 bg-background/20 backdrop-blur-sm text-white text-sm font-monster font-semibold rounded-full shadow-lg border border-white/20">
						v{template.version}
					</span>
				</div>

				<p className="text-white/90 text-base font-inter line-clamp-2 ml-[52px]">
					{template.description}
				</p>

				{template.tags && (
					<div className="flex flex-wrap gap-2 mt-3 ml-[52px]">
						{template.tags.map((tag, index) => (
							<span
								key={index}
								className="px-2 py-0.5 bg-white/10 text-white/90 text-xs font-monster rounded-full"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</div>

			<div className="p-6 space-y-6">
				<div className="grid grid-cols-2 gap-6">
					<div className="space-y-4">
						<div className="flex items-center space-x-3">
							<div className="p-2.5 bg-primary/10 rounded-xl">
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
						</div>

						<div className="flex items-center space-x-3">
							{creator?.avatar && (
								<img src={creator.avatar} alt="Creator Avatar" className="w-8 h-8 rounded-full" />
							)}
							<div>
								<p className="text-muted-foreground text-sm font-inter">Creator</p>
								<p className="font-monster font-semibold text-foreground max-w-[150px] truncate">
									{creator ? truncate(creator.username, 12) : 'Unknown'}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center space-x-3">
							<div className="p-2.5 bg-primary/10 rounded-xl">
								<FiClock className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm font-inter">Created</p>
								<p className="font-monster font-semibold text-foreground">
									{format(new Date(template.last_updated_at.replace(' UTC', 'Z')), 'MMM d, yyyy')}
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-3">
							<div className="p-2.5 bg-primary/10 rounded-xl">
								<FiGitBranch className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm font-inter">Updated</p>
								<p className="font-monster font-semibold text-foreground">
									{format(new Date(template.last_updated_at), 'MMM d, yyyy')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{(template.downloads !== undefined || template.rating !== undefined) && (
					<div className="flex items-center justify-between px-2 py-3 bg-muted/40 rounded-lg">
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
					</div>
				)}

				<div className="flex gap-3">
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleViewClick}
						className="relative flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-md font-medium transition-colors hover:bg-primary/90"
					>
						<FiEye className="w-4 h-4" />
						View
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 rounded-md font-medium transition-colors"
					>
						<FiDownload className="w-4 h-4" />
					</motion.button>
				</div>
			</div>
		</motion.div>
	);
};
