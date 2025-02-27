export interface StatisticsData {
  resp: {
    uptime: number;
    managers: {
      display_name: string;
      shard_groups: {
        shards: Array<[number, number, number, number, number, number]>; // shards' data structure
      }[];
    }[];
  };
  shard_conns: {
    [key: number]: {
      status: 'MarkedForClosure' | 'Active';
      real_latency: number;
      guilds: number;
      uptime: number;
      total_uptime: number;
    };
  };
  total_guilds: number;
}