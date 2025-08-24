export const getIconUrl = (guildid: string, icon_hash: string | null): string => {
	if (!guildid || !icon_hash) {
		return '/logo.webp'; // Default icon if guild ID or icon hash is not provided
	}

	const baseUrl = 'https://cdn.discordapp.com';
	const iconUrl = `${baseUrl}/icons/${guildid}/${icon_hash}.webp?size=512`;

	return iconUrl;
};
