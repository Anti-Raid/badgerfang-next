import { useRouter } from 'next/navigation';
import { DashboardGuild } from '@/types/api/bindings/DashboardGuild';
import { supportConfig } from '@/lib/data/support';
import logger from '@/lib/logger';
import { getIconUrl } from '@/lib/auth/getIconUrl';
import { FaDiscord } from 'react-icons/fa';
import { Shield, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const DISCORD_PERMISSIONS = {
	ADMINISTRATOR: BigInt(0x8),
	MANAGE_GUILD: BigInt(0x20),
	MANAGE_CHANNELS: BigInt(0x10),
	MANAGE_ROLES: BigInt(0x10000000),
	MANAGE_MESSAGES: BigInt(0x2000),
	MANAGE_WEBHOOKS: BigInt(0x80000000)
};

export const getPermissionNames = (permissions: bigint): string[] => {
	const permNames: string[] = [];

	if (permissions & DISCORD_PERMISSIONS.ADMINISTRATOR) {
		return ['Administrator'];
	}

	if (permissions & DISCORD_PERMISSIONS.MANAGE_GUILD) permNames.push('Manage Server');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_CHANNELS) permNames.push('Manage Channels');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_ROLES) permNames.push('Manage Roles');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_MESSAGES) permNames.push('Manage Messages');
	if (permissions & DISCORD_PERMISSIONS.MANAGE_WEBHOOKS) permNames.push('Manage Webhooks');

	return permNames.length ? permNames : ['Limited Access'];
};

export const ServerCard: React.FC<{ server: DashboardGuild; showViewButton: boolean }> = ({
	server,
	showViewButton
}) => {
	const router = useRouter();

	let permBit = BigInt(0);
	try {
		permBit = BigInt(server.permissions);
	} catch (error) {
		logger.error('ServerCard', 'Failed to parse permissions for server:', server.id, error);
	}

	const permissionNames = getPermissionNames(permBit);
	const isAdministrator = permissionNames.includes('Administrator');

	const handleViewClick = () => {
		router.push(`/dashboard/guilds/?id=${server.id}`);
	};

	const handleInviteClick = () => {
		const inviteUrl = supportConfig.invite.full.replace('{guild_id}', server.id);
		window.location.href = inviteUrl;
	};

	return (
		<div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
			<div className="flex items-start gap-4 mb-4">
				<div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
					<Image
						src={getIconUrl(server.id, server.icon) || '/logo.webp'}
						alt={server.name}
						fill
						className="object-cover"
					/>
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="font-semibold text-foreground truncate">{server.name}</h3>
					<p className="text-xs text-muted-foreground">ID: {server.id.slice(0, 8)}...</p>
				</div>
			</div>

			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-1.5">
					{isAdministrator ? (
						<span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded">
							<Shield size={12} />
							Admin
						</span>
					) : (
						<span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded">
							{permissionNames[0]}
						</span>
					)}
				</div>
			</div>

			<button
				onClick={showViewButton ? handleViewClick : handleInviteClick}
				className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
					showViewButton
						? 'bg-muted text-foreground hover:bg-muted/80'
						: 'bg-primary text-primary-foreground hover:bg-primary/90'
				}`}
			>
				{showViewButton ? (
					<>
						<ExternalLink size={16} />
						Manage
					</>
				) : (
					<>
						<FaDiscord size={16} />
						Add Bot
					</>
				)}
			</button>
		</div>
	);
};
