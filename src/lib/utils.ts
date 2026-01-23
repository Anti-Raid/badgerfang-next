import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};


export const DISCORD_PERMISSIONS = {
	ADMINISTRATOR: BigInt(0x8),
	MANAGE_GUILD: BigInt(0x20),
	MANAGE_CHANNELS: BigInt(0x10),
	MANAGE_ROLES: BigInt(0x10000000),
	MANAGE_MESSAGES: BigInt(0x2000),
	MANAGE_WEBHOOKS: BigInt(0x80000000)
};

export function getDiscordPermissionNames(permissions: bigint): string[] {
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
}
