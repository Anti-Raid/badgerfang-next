import { useRouter } from '@tanstack/react-router';
import { DashboardGuild } from '@/types/api/bindings/DashboardGuild';
import { supportConfig } from '@/lib/data/support';
import logger from '@/lib/logger';
import { getIconUrl } from '@/lib/auth/getIconUrl';
import { FaDiscord } from 'react-icons/fa';
import { Shield } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Image } from '@unpic/react';
import React from 'react';
import { getDiscordPermissionNames } from '@/lib/utils';

export const ServerCard: React.FC<{ server: DashboardGuild; showViewButton: boolean }> = ({
	server,
	showViewButton
}) => {
	let permBit = BigInt(0);
	try {
		permBit = BigInt(server.permissions);
	} catch (error) {
		logger.error('ServerCrd', 'Failed to parse permissions for server:', server.id, error);
	}

	const router = useRouter();
	const permissionNames = getDiscordPermissionNames(permBit);
	const isAdministrator = permissionNames.includes('Administrator');

	const handleViewClick = () => {
		// Ensure id is a string without quotes and handle potential double quoting
		const guildId = String(server.id).replace(/^["']|["']$/g, '').replace(/^["']|["']$/g, '');
		router.navigate({ 
			to: '/dashboard/guilds', 
			search: { id: guildId },
			params: {}
		});
	};

	const handleInviteClick = () => {
		const inviteUrl = supportConfig.invite.full.replace('{guild_id}', server.id);
		window.location.href = inviteUrl;
	};

	return (
		<div className="group relative">
			<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-extra/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
			<div className="relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border/30 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/20 group-hover:-translate-y-1">
				<div className="h-20 bg-gradient-to-r from-primary/80 via-primary/50 to-extra/80 relative overflow-hidden">
					<div className="absolute inset-0 opacity-10 mix-blend-overlay"></div>
					<div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/5"></div>
				</div>
				<div className="p-6 pt-0 -mt-10">
					<div className="flex items-start gap-3 mb-4">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-primary to-extra rounded-xl blur-sm opacity-70"></div>
							<Image
								src={getIconUrl(server.id, server.icon) || '/logo.webp'}
								alt={`${server.name} icon`}
								height={64}
								width={64}
								className="relative w-16 h-16 rounded-xl border-2 border-card bg-accent object-cover"
							/>
						</div>
						<div className="mt-10">
							<h3 className="text-foreground font-bold text-lg truncate max-w-[180px]">
								{server.name}
							</h3>
						</div>
					</div>

					<div className="flex items-center justify-between mb-5">
						<div className="flex items-center gap-1">
							{isAdministrator ? (
								<div className="bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-primary flex items-center gap-1 font-medium">
									<FaDiscord className="h-3 w-3" />
									<span>Administrator</span>
								</div>
							) : (
								<div className="bg-accent/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-1">
									<Shield className="h-3 w-3" />
									<span>{permissionNames[0]}</span>
								</div>
							)}
						</div>
						<div className="text-xs text-muted-foreground">ID: {server.id.slice(0, 8)}...</div>
					</div>

					<button
						className={`flex items-center gap-2 px-4 py-3 rounded-lg w-full justify-center transition-all duration-300 ${
							showViewButton
								? 'bg-accent/80 backdrop-blur-sm text-foreground hover:bg-accent/60 hover:shadow-md'
								: 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-primary/20 hover:shadow-md'
						}`}
						onClick={showViewButton ? handleViewClick : handleInviteClick}
					>
						{showViewButton ? (
							<>
								<Eye className="h-4 w-4" /> <span className="font-medium">Manage Server</span>
							</>
						) : (
							<>
								<FaDiscord className="h-4 w-4" /> <span className="font-medium">Add Bot</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};
