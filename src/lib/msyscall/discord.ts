import { opFetcher } from './index';

/**
 * Gets a list of all user guilds
 */
export async function getUserGuilds(refresh: boolean = false): Promise<any> {
  const res = await opFetcher("Discord", { op: "GetUserGuilds", refresh });
  return res.data;
}

/**
 * Gets information about a guild
 */
export async function getGuildInfo(guildId: string): Promise<any> {
  const res = await opFetcher("Discord", { op: "GetGuildInfo", guild_id: guildId });
  return res.data;
}
