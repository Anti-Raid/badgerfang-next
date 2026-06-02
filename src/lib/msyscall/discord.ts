import { opFetcher } from './index';
import type { DashboardGuildData as LegacyDashboardGuildData } from '../../types/api/bindings/DashboardGuildData';
import type { BaseGuildUserInfo } from '../../types/api/bindings/BaseGuildUserInfo';

/**
 * Gets a list of all user guilds
 */
export async function getUserGuilds(refresh: boolean = false): Promise<LegacyDashboardGuildData> {
  const res = await opFetcher<'Discord'>("Discord", { op: "GetUserGuilds", refresh });
  if (res.op !== "UserGuilds") {
    throw new Error(`Unexpected discord response: ${res.op}`);
  }

  const data = res.data as typeof res.data & { bot_in_guilds?: string[] };
  const botInGuilds = data.bot_in_guilds ?? data.guilds
    .filter((guild, index) => Boolean(data.guilds_exist[index]))
    .map((guild) => guild.id);

  return {
    guilds: data.guilds.map((guild) => ({
      ...guild,
      icon: guild.icon ?? null
    })),
    bot_in_guilds: botInGuilds
  };
}

/**
 * Gets information about a guild
 */
export async function getGuildInfo(guildId: string): Promise<BaseGuildUserInfo> {
  const res = await opFetcher<'Discord'>("Discord", { op: "GetGuildInfo", guild_id: guildId });
  if (res.op !== "GuildInfo") {
    throw new Error(`Unexpected discord response: ${res.op}`);
  }

  return res.data as BaseGuildUserInfo;
}
