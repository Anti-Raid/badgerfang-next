"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FaServer,
  FaChartLine,
  FaCube,
  FaClock
} from 'react-icons/fa6';
import { motion } from 'framer-motion';

interface BotStatusProps {
  data: {
    resp: {
      uptime: number;
      total_guilds: number;
      managers: Array<{
        display_name: string;
        shard_groups: Array<{
          shards: Array<[number, number, number, number, number, number]>
        }>
      }>;
      shard_conns: {
        [key: string]: {
          status: string;
          real_latency: number;
          guilds: number;
          uptime: number;
          total_uptime: number;
        }
      }
    }
  };
}

const ShardLatencyChart: React.FC<BotStatusProps> = ({ data }) => {
  const chartData = Object.entries(data.resp.shard_conns).map(([shard, details]) => ({
    name: `Shard ${shard}`,
    latency: details.real_latency,
    guilds: details.guilds
  }));

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaChartLine className="mr-2" /> Shard Latency
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
            labelClassName="text-foreground"
          />
          <Legend />
          <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const BotStatusSummary: React.FC<BotStatusProps> = ({ data }) => {
  const totalShards = Object.keys(data.resp.shard_conns).length;
  const totalGuilds = data.resp.total_guilds;
  const uptime = formatUptime(data.resp.uptime);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <StatusCard
        icon={<FaServer />}
        title="Total Shards"
        value={totalShards.toString()}
      />
      <StatusCard
        icon={<FaCube />}
        title="Total Guilds"
        value={totalGuilds.toLocaleString()}
      />
      <StatusCard
        icon={<FaClock />}
        title="Total Uptime"
        value={uptime}
      />
    </motion.div>
  );
};

const StatusCard: React.FC<{
  icon: React.ReactNode,
  title: string,
  value: string
}> = ({ icon, title, value }) => (
  <div className="bg-card p-4 rounded-lg shadow-md flex items-center">
    <div className="text-3xl mr-4 text-primary">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const Status: React.FC<BotStatusProps> = ({ data }) => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <BotStatusSummary data={data} />
      <ShardLatencyChart data={data} />
    </div>
  );
};

function formatUptime(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return "0d 0h 0m";
  }

  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
}

export default Status;
