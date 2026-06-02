'use client';

import { useState } from 'react';
import { FiPackage, FiClock, FiGitBranch, FiServer, FiEye, FiZap, FiUser } from 'react-icons/fi';
import { useRouter } from '@tanstack/react-router';
import { format, isValid } from 'date-fns';
import type { ScriptShopTemplate } from '@/types/script/shop';

interface CommonCardProps {
	template: ScriptShopTemplate;
}

export const CommonCard = ({ template }: CommonCardProps) => {
	const router = useRouter();
	const [isHovered, setIsHovered] = useState(false);

	const truncate = (str: string, maxLength: number) => {
		return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
	};

	const safeFormatDate = (dateString: string) => {
		const date = new Date(dateString);
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
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="group relative bg-card rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border border-primary/20 hover:border-primary/40 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
			style={{
				boxShadow: isHovered
					? '0 25px 50px -12px rgba(var(--primary), 0.25), 0 0 15px rgba(var(--primary), 0.1)'
					: '0 10px 30px -15px rgba(0, 0, 0, 0.2)'
			}}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			<div
				className="absolute -inset-[1px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"
				style={{ animationDuration: '3s' }}
			></div>

			<div className="relative">
				<div className="relative bg-gradient-to-r from-primary to-accent p-6 overflow-hidden">
					<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-3xl"></div>

					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTM5IDFIMXYzOGgzOFYxeiIgZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>

					<div className="flex items-start justify-between mb-4 relative z-10">
						<div className="flex items-center space-x-3">
							<div className="animate-in zoom-in-95 fade-in duration-300 p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 group-hover:border-white/30 transition-all duration-300">
								<FiPackage className="w-7 h-7 text-white" />
							</div>
							<h3 className="animate-in fade-in slide-in-from-left-2 duration-300 delay-75 fill-mode-both font-monster font-bold text-xl text-white">
								{template.name}
							</h3>
						</div>
						<span className="animate-in fade-in slide-in-from-top-2 duration-300 delay-150 fill-mode-both px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-sm font-monster font-semibold rounded-full shadow-lg border border-white/20 group-hover:border-white/30 transition-all duration-300">
							{template.version}
						</span>
					</div>

					<p className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-both text-white/90 text-base font-inter line-clamp-2 ml-[52px]">
						{template.description}
					</p>

					{template.tags && (
						<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300 fill-mode-both flex flex-wrap gap-2 mt-3 ml-[52px]">
							{template.tags.map((tag, index) => (
								<span
									key={index}
									style={{ animationDelay: `${350 + index * 40}ms` }}
									className="animate-in zoom-in-95 fade-in fill-mode-both duration-200 px-3 py-1 bg-white/10 text-white/90 text-xs font-monster rounded-full border border-white/10 backdrop-blur-sm shadow-sm transition-colors hover:bg-white/20 hover:scale-105"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				<div className="p-6 space-y-6 relative">
					<div className="grid grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-300 fill-mode-both flex items-center space-x-3">
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
							</div>

							<div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-400 fill-mode-both flex items-center space-x-3">
								<div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors duration-300">
									<FiUser className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-inter">Owned by</p>
									<p className="font-monster font-semibold text-foreground max-w-[150px] truncate">
										{truncate(template.owner_guild, 12) || 'Unknown'}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="animate-in fade-in slide-in-from-right-2 duration-300 delay-300 fill-mode-both flex items-center space-x-3">
								<div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors duration-300">
									<FiClock className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-inter">Created</p>
									<p className="font-monster font-semibold text-foreground">{formattedCreatedDate}</p>
								</div>
							</div>

							<div className="animate-in fade-in slide-in-from-right-2 duration-300 delay-400 fill-mode-both flex items-center space-x-3">
								<div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors duration-300">
									<FiGitBranch className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-inter">Updated</p>
									<p className="font-monster font-semibold text-foreground">{formattedUpdatedDate}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-500 fill-mode-both flex gap-3">
						<button
							type="button"
							onClick={() =>
								router.navigate({
									to: '/script/$name',
									params: { name: template.id }
								})
							}
							className="relative flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden group hover:scale-[1.02] active:scale-[0.98]"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
							<FiEye className="w-4 h-4 relative z-10" />
							<span className="relative z-10">View Details</span>
						</button>

						<button
							type="button"
							className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98]"
						>
							<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							<FiZap className="w-4 h-4 relative z-10" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
