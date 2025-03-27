export interface BotStats {
  uptime: number;
  managers: Array<{
    display_name: string;
    shard_groups: Array<{
      shards: number[][];
    }>;
  }>;
  shard_conns: Record<string, {
    status: string;
    real_latency: number;
    guilds: number;
    uptime: number;
    total_uptime: number;
  }>;
}