import React from 'react';
import { FaChartLine, FaCube, FaServer, FaClock } from 'react-icons/fa';
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
import { motion } from 'framer-motion';

interface ShardDetails {
	real_latency: number;
	guilds: number;
	status: string;
	uptime: number;
	total_uptime: number;
}

interface BotStatusData {
	resp: {
		shard_conns: Record<string, ShardDetails>;
		total_guilds: number;
		uptime: number;
		managers?: Array<{
			display_name: string;
			shard_groups: Array<{
				shards: Array<[number, number, number, number, number, number]>;
			}>;
		}>;
	};
}

interface StatusCardProps {
	icon: React.ReactNode;
	title: string;
	value: string;
}

const formatUptime = (uptimeSeconds: number): string => {
	const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
	const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
	const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
	const seconds = Math.floor(uptimeSeconds % 60);

	const parts: string[] = [];

	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

	return parts.join(' ');
};

const StatusCard: React.FC<StatusCardProps> = React.memo(({ icon, title, value }) => (
	<motion.div
		whileHover={{ scale: 1.05 }}
		whileTap={{ scale: 0.95 }}
		className="bg-card p-6 rounded-md shadow-md flex items-center space-x-4 transition-all border border-border"
	>
		<div className="text-3xl text-primary">{icon}</div>
		<div>
			<h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
			<p className="text-2xl font-bold text-foreground">{value}</p>
		</div>
	</motion.div>
));

const ShardLatencyChart: React.FC<{ data: BotStatusData }> = React.memo(({ data }) => {
	const chartData = Object.entries(data.resp.shard_conns).map(([shard, details]) => ({
		name: `Shard ${shard}`,
		latency: details.real_latency,
		guilds: details.guilds,
		status: details.status
	}));

	return (
		<div className="bg-card p-6 rounded-md shadow-md border border-border">
			<h2 className="text-xl font-bold mb-4 flex items-center">
				<FaChartLine className="mr-2 text-primary" /> <span className="text-foreground">Shard Latency</span>
			</h2>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" opacity={0.5} stroke="hsl(var(--border))" />
					<XAxis
						dataKey="name"
						tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
						axisLine={{ stroke: 'hsl(var(--border))' }}
					/>
					<YAxis
						label={{
							value: 'Latency (ms)',
							angle: -90,
							position: 'insideLeft',
							fill: 'hsl(var(--foreground))',
							fontSize: 12
						}}
						tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
						axisLine={{ stroke: 'hsl(var(--border))' }}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: 'hsl(var(--card))',
							borderColor: 'hsl(var(--border))',
							borderRadius: '0.5rem',
							padding: '0.5rem'
						}}
						labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
						itemStyle={{ color: 'hsl(var(--foreground))' }}
					/>
					<Legend wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: 12 }} />
					<Line
						type="monotone"
						dataKey="latency"
						stroke="hsl(var(--primary))"
						strokeWidth={2}
						activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' }}
						dot={{ fill: 'hsl(var(--primary))', r: 4 }}
						animationDuration={1500}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
});

const GuildDistributionChart: React.FC<{ data: BotStatusData }> = React.memo(({ data }) => {
	const chartData = Object.entries(data.resp.shard_conns).map(([shard, details]) => ({
		name: `Shard ${shard}`,
		guilds: details.guilds
	}));

	return (
		<div className="bg-card p-6 rounded-md shadow-md border border-border">
			<h2 className="text-xl font-bold mb-4 flex items-center">
				<FaCube className="mr-2 text-extra" /> <span className="text-foreground">Guild Distribution</span>
			</h2>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" opacity={0.5} stroke="hsl(var(--border))" />
					<XAxis
						dataKey="name"
						tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
						axisLine={{ stroke: 'hsl(var(--border))' }}
					/>
					<YAxis
						label={{
							value: 'Guilds',
							angle: -90,
							position: 'insideLeft',
							fill: 'hsl(var(--foreground))',
							fontSize: 12
						}}
						tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
						axisLine={{ stroke: 'hsl(var(--border))' }}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: 'hsl(var(--card))',
							borderColor: 'hsl(var(--border))',
							borderRadius: '0.5rem',
							padding: '0.5rem'
						}}
						labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
						itemStyle={{ color: 'hsl(var(--foreground))' }}
					/>
					<Legend wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: 12 }} />
					<Line
						type="monotone"
						dataKey="guilds"
						stroke="hsl(var(--extra))"
						strokeWidth={2}
						activeDot={{ r: 8, fill: 'hsl(var(--extra))', stroke: 'hsl(var(--background))' }}
						dot={{ fill: 'hsl(var(--extra))', r: 4 }}
						animationDuration={1500}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
});

const ShardStatusList: React.FC<{ data: BotStatusData }> = React.memo(({ data }) => {
	return (
		<div className="bg-card p-6 rounded-md shadow-md border border-border">
			<h2 className="text-xl font-bold mb-4 flex items-center">
				<FaServer className="mr-2 text-primary" /> <span className="text-foreground">Shard Status</span>
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{Object.entries(data.resp.shard_conns).map(([shard, details]) => (
					<motion.div
						key={shard}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: Number(shard) * 0.05 }}
						className="bg-secondary p-4 rounded-md border border-border"
					>
						<div className="flex justify-between items-center mb-2">
							<span className="font-semibold text-foreground">Shard {shard}</span>
							<span
								className={`inline-block w-3 h-3 rounded-full ${
									details.status === 'Connected'
										? 'bg-green-500'
										: details.status === 'MarkedForClosure'
											? 'bg-yellow-500'
											: 'bg-red-500'
								}`}
							/>
						</div>
						<div className="text-sm text-muted-foreground">
							<div className="flex justify-between mb-1">
								<span>Latency:</span>
								<span className="font-medium">{details.real_latency}ms</span>
							</div>
							<div className="flex justify-between">
								<span>Guilds:</span>
								<span className="font-medium">{details.guilds}</span>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
});

const BotStatusSummary: React.FC<{ data: BotStatusData }> = React.memo(({ data }) => {
	const totalShards = Object.keys(data.resp.shard_conns).length;
	const totalGuilds = data.resp.total_guilds;
	const uptime = formatUptime(data.resp.uptime);

	const avgLatency = Math.round(
		Object.values(data.resp.shard_conns).reduce((sum, shard) => sum + shard.real_latency, 0) /
			totalShards
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
		>
			<StatusCard icon={<FaServer />} title="Total Shards" value={totalShards.toString()} />
			<StatusCard icon={<FaCube />} title="Total Servers" value={totalGuilds.toLocaleString()} />
			<StatusCard icon={<FaClock />} title="Total Uptime" value={uptime} />
			<StatusCard icon={<FaChartLine />} title="Avg. Latency" value={`${avgLatency} ms`} />
		</motion.div>
	);
});

const Status: React.FC<{ data: BotStatusData }> = ({ data }) => {
	return (
		<div className="container mx-auto p-6 space-y-8">
			<motion.h1
				className="text-3xl font-bold mb-8 text-foreground"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				AntiRaid Status
			</motion.h1>

			<BotStatusSummary data={data} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<ShardLatencyChart data={data} />
				<GuildDistributionChart data={data} />
			</div>

			<ShardStatusList data={data} />
		</div>
	);
};

export default Status;