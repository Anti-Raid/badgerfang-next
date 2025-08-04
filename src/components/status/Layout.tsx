'use client';
import type React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell
} from 'recharts';
import { getBotStats } from '@/lib/api';
import {
	ArrowUpCircle,
	Server,
	Clock,
	Activity,
	BarChart2,
	Shield,
	CheckCircle,
	AlertCircle,
	XCircle
} from 'lucide-react';
import { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import { ShardConn } from '@/types/api/bindings/ShardConn';

// Utility function to format uptime
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

// Get status color based on status string
const getStatusColor = (status: string): string => {
	switch (status) {
		case 'Ready':
			return 'hsl(var(--primary))';
		case 'Connected':
			return 'hsl(142, 76%, 36%)';
		case 'MarkedForClosure':
			return 'hsl(38, 92%, 50%)';
		default:
			return 'hsl(var(--destructive))';
	}
};

// Get status icon based on status string
const StatusIcon = ({ status }: { status: string }) => {
	switch (status) {
		case 'Ready':
		case 'Connected':
			return <CheckCircle className="w-5 h-5" />;
		case 'MarkedForClosure':
			return <AlertCircle className="w-5 h-5" />;
		default:
			return <XCircle className="w-5 h-5" />;
	}
};

// Stat Card Component
interface StatCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
	delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, delay = 0 }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.4, delay }}
		className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/80 p-6 shadow-lg border border-border/50"
	>
		<div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{ color }}>
			<div className="w-full h-full flex items-center justify-center text-5xl">{icon}</div>
		</div>
		<div className="flex items-center gap-4">
			<div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20`, color }}>
				{icon}
			</div>
			<div>
				<h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
				<p className="text-2xl font-bold mt-1">{value}</p>
			</div>
		</div>
	</motion.div>
);

// Shard Status Card Component
interface ShardCardProps {
	shard: string;
	details: {
		status: string;
		real_latency: number;
		guilds: number;
		uptime: number;
		total_uptime: number;
	};
	index: number;
}

const ShardCard: React.FC<ShardCardProps> = ({ shard, details, index }) => {
	const statusColor = getStatusColor(details.status);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/80 p-4 shadow-md border border-border/50"
		>
			<div className="flex justify-between items-center mb-3">
				<div className="flex items-center gap-2">
					<Server className="w-4 h-4 text-muted-foreground" />
					<h3 className="font-semibold">Shard {shard}</h3>
				</div>
				<div className="flex items-center gap-2" style={{ color: statusColor }}>
					<StatusIcon status={details.status} />
					<span className="text-xs font-medium">{details.status}</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 mt-2">
				<div className="bg-secondary/50 rounded-lg p-2">
					<p className="text-xs text-muted-foreground">Latency</p>
					<p className="text-lg font-bold">{details.real_latency} ms</p>
				</div>
				<div className="bg-secondary/50 rounded-lg p-2">
					<p className="text-xs text-muted-foreground">Guilds</p>
					<p className="text-lg font-bold">{details.guilds}</p>
				</div>
			</div>

			<div className="mt-3 bg-secondary/50 rounded-lg p-2">
				<p className="text-xs text-muted-foreground">Uptime</p>
				<p className="text-sm font-medium">{formatUptime(details.uptime)}</p>
			</div>
		</motion.div>
	);
};

// Main Status Component
const Status: React.FC = () => {
	const [data, setData] = useState<GetStatusResponse | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [activeTab, setActiveTab] = useState<'overview' | 'shards' | 'charts'>('overview');

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const response = await getBotStats();
				setData(response);
			} catch (err) {
				setError(err as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		// Refresh data every 30 seconds
		const interval = setInterval(fetchData, 30000);
		return () => clearInterval(interval);
	}, []);

	// Derived data for charts
	const chartData = useMemo(() => {
		if (!data) return { latencyData: [], guildData: [], statusData: [] };

		const latencyData = Object.entries(data.shard_conns).map(([shard, details]) => ({
			name: `Shard ${shard}`,
			latency: details?.real_latency
		}));

		const guildData = Object.entries(data.shard_conns).map(([shard, details]) => ({
			name: `Shard ${shard}`,
			guilds: details?.guilds
		}));

		const statusCounts = Object.values(data.shard_conns).reduce(
			(acc, shard) => {
				if (!shard) return acc;
				acc[shard.status] = (acc[shard.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const statusData = Object.entries(statusCounts).map(([status, count]) => ({
			name: status,
			value: count
		}));

		return { latencyData, guildData, statusData };
	}, [data]);

	// Calculate summary metrics
	const summaryMetrics = useMemo(() => {
		if (!data) return null;

		const totalShards = Object.keys(data.shard_conns).length;
		const totalGuilds = data.total_guilds;

		const avgLatency = Math.round(
			Object.values(data.shard_conns).reduce((sum, shard) => sum + (shard?.real_latency || 0), 0) /
				totalShards
		);

		const readyShards = Object.values(data.shard_conns).filter(
			(shard) => shard?.status === 'Ready' || shard?.status === 'Connected'
		).length;

		const healthPercentage = Math.round((readyShards / totalShards) * 100);

		return {
			totalShards,
			totalGuilds,
			avgLatency,
			readyShards,
			healthPercentage
		};
	}, [data]);

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="relative w-16 h-16">
						<div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
						<div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
					</div>
					<p className="text-lg font-medium">Loading status data...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="bg-card p-8 rounded-xl border border-destructive/50 max-w-md">
					<div className="flex items-center gap-3 text-destructive mb-4">
						<XCircle className="w-8 h-8" />
						<h2 className="text-xl font-bold">Error Loading Data</h2>
					</div>
					<p className="text-muted-foreground mb-4">
						We encountered an error while fetching the bot status data:
					</p>
					<div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm overflow-auto">
						{error.message}
					</div>
					<button
						onClick={() => window.location.reload()}
						className="mt-6 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	// No data state
	if (!data) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="bg-card p-8 rounded-xl border border-border max-w-md">
					<div className="flex items-center gap-3 text-muted-foreground mb-4">
						<AlertCircle className="w-8 h-8" />
						<h2 className="text-xl font-bold">No Data Available</h2>
					</div>
					<p className="text-muted-foreground mb-4">
						We couldn't retrieve any status data for the bot at this time.
					</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
					>
						Refresh
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-8"
			>
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold">AntiRaid Status</h1>
						<p className="text-muted-foreground mt-1">
							Real-time monitoring dashboard for all bot shards and services
						</p>
					</div>
					<div className="flex items-center gap-3 bg-card rounded-lg p-1.5 border border-border">
						<button
							onClick={() => setActiveTab('overview')}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTab === 'overview'
									? 'bg-primary text-primary-foreground'
									: 'hover:bg-secondary'
							}`}
						>
							Overview
						</button>
						<button
							onClick={() => setActiveTab('shards')}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTab === 'shards' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
							}`}
						>
							Shards
						</button>
						<button
							onClick={() => setActiveTab('charts')}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTab === 'charts' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
							}`}
						>
							Charts
						</button>
					</div>
				</div>

				<div className="mt-6 p-4 bg-card rounded-xl border border-border/50">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-full bg-primary/20 text-primary">
							<Clock className="w-5 h-5" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Last updated</p>
							<p className="font-medium">{new Date().toLocaleTimeString()}</p>
						</div>
						<div className="ml-auto flex items-center gap-2">
							<div
								className="w-3 h-3 rounded-full animate-pulse"
								style={{
									backgroundColor:
										summaryMetrics!.healthPercentage > 90
											? 'hsl(142, 76%, 36%)'
											: 'hsl(38, 92%, 50%)'
								}}
							></div>
							<span className="text-sm font-medium">
								{summaryMetrics!.healthPercentage}% Healthy
							</span>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<StatCard
					title="Total Shards"
					value={summaryMetrics!.totalShards}
					icon={<Server />}
					color="hsl(var(--primary))"
					delay={0.1}
				/>
				<StatCard
					title="Total Servers"
					value={summaryMetrics!.totalGuilds.toLocaleString()}
					icon={<Shield />}
					color="hsl(var(--extra))"
					delay={0.2}
				/>
				{/*<StatCard
					title="Uptime"
					value={summaryMetrics!.uptime}
					icon={<ArrowUpCircle />}
					color="hsl(142, 76%, 36%)"
					delay={0.3}
				/>*/}
				<StatCard
					title="Avg. Latency"
					value={`${summaryMetrics!.avgLatency} ms`}
					icon={<Activity />}
					color="hsl(var(--destructive))"
					delay={0.4}
				/>
			</div>

			{/* Tab Content */}
			<AnimatePresence mode="wait">
				{activeTab === 'overview' && (
					<motion.div
						key="overview"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Health Overview */}
							<div className="lg:col-span-1 bg-card rounded-xl border border-border/50 p-6 shadow-lg">
								<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
									<Shield className="w-5 h-5 text-extra" />
									System Health
								</h2>

								<div className="space-y-6">
									<div>
										<div className="flex justify-between mb-2">
											<span className="text-sm text-muted-foreground">Shard Health</span>
											<span className="text-sm font-medium">
												{summaryMetrics!.readyShards}/{summaryMetrics!.totalShards} Ready
											</span>
										</div>
										<div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
											<div
												className="h-full rounded-full"
												style={{
													width: `${summaryMetrics!.healthPercentage}%`,
													backgroundColor:
														summaryMetrics!.healthPercentage > 90
															? 'hsl(142, 76%, 36%)'
															: summaryMetrics!.healthPercentage > 70
																? 'hsl(38, 92%, 50%)'
																: 'hsl(var(--destructive))'
												}}
											></div>
										</div>
									</div>

									<div>
										<div className="flex justify-between mb-2">
											<span className="text-sm text-muted-foreground">Average Latency</span>
											<span className="text-sm font-medium">{summaryMetrics!.avgLatency} ms</span>
										</div>
										<div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
											<div
												className="h-full rounded-full"
												style={{
													width: `${Math.min(100, (summaryMetrics!.avgLatency / 100) * 100)}%`,
													backgroundColor:
														summaryMetrics!.avgLatency < 50
															? 'hsl(142, 76%, 36%)'
															: summaryMetrics!.avgLatency < 80
																? 'hsl(38, 92%, 50%)'
																: 'hsl(var(--destructive))'
												}}
											></div>
										</div>
									</div>

									<div className="pt-4 border-t border-border">
										<h3 className="text-sm font-medium mb-3">Shard Status Distribution</h3>
										<ResponsiveContainer width="100%" height={200}>
											<PieChart>
												<Pie
													data={chartData.statusData}
													cx="50%"
													cy="50%"
													innerRadius={50}
													outerRadius={70}
													paddingAngle={5}
													dataKey="value"
													label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
													labelLine={false}
												>
													{chartData.statusData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
													))}
												</Pie>
												<Tooltip
													formatter={(value) => [`${value} shards`, 'Count']}
													contentStyle={{
														backgroundColor: 'hsl(var(--card))',
														borderColor: 'hsl(var(--border))',
														borderRadius: '0.5rem',
														color: 'hsl(var(--foreground))'
													}}
												/>
											</PieChart>
										</ResponsiveContainer>
									</div>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6 shadow-lg">
								<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
									<BarChart2 className="w-5 h-5 text-primary" />
									Performance Metrics
								</h2>

								<div className="h-[400px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={chartData.latencyData.slice(0, 10)} // Show only first 10 shards for clarity
											margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="hsl(var(--border))"
												opacity={0.3}
											/>
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
											/>
											<YAxis
												label={{
													value: 'Latency (ms)',
													angle: -90,
													position: 'insideLeft',
													style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
												}}
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
											/>
											<Tooltip
												formatter={(value) => [`${value} ms`, 'Latency']}
												contentStyle={{
													backgroundColor: 'hsl(var(--card))',
													borderColor: 'hsl(var(--border))',
													borderRadius: '0.5rem',
													color: 'hsl(var(--foreground))'
												}}
											/>
											<Bar
												dataKey="latency"
												fill="hsl(var(--primary))"
												radius={[4, 4, 0, 0]}
												barSize={30}
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>

								<div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
									<div className="bg-secondary/50 rounded-lg p-4">
										<h3 className="text-sm text-muted-foreground mb-1">Lowest Latency</h3>
										<p className="text-xl font-bold">
											{Math.min(...Object.values(data.shard_conns).map((s) => s?.real_latency || 0))} ms
										</p>
									</div>
									<div className="bg-secondary/50 rounded-lg p-4">
										<h3 className="text-sm text-muted-foreground mb-1">Highest Latency</h3>
										<p className="text-xl font-bold">
											{Math.max(...Object.values(data.shard_conns).map((s) => s?.real_latency || 0))} ms
										</p>
									</div>
									<div className="bg-secondary/50 rounded-lg p-4">
										<h3 className="text-sm text-muted-foreground mb-1">Median Latency</h3>
										<p className="text-xl font-bold">
											{
												Object.values(data.shard_conns)
													.map((s) => s?.real_latency || 0)
													.sort((a, b) => a - b)[
													Math.floor(Object.keys(data.shard_conns).length / 2)
												]
											}{' '}
											ms
										</p>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{activeTab === 'shards' && (
					<motion.div
						key="shards"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg mb-6">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
								<h2 className="text-xl font-bold flex items-center gap-2">
									<Server className="w-5 h-5 text-primary" />
									Shard Status
								</h2>

								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[hsl(142,76%,36%)]"></div>
										<span className="text-sm">Ready</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[hsl(38,92%,50%)]"></div>
										<span className="text-sm">Marked</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[hsl(var(--destructive))]"></div>
										<span className="text-sm">Disconnected</span>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{Object.entries(data.shard_conns).filter(([_, details]) => details !== undefined).map(([shard, details], index) => (
									<ShardCard key={shard} shard={shard} details={details as ShardConn} index={index} />
								))}
							</div>
						</div>
					</motion.div>
				)}

				{activeTab === 'charts' && (
					<motion.div
						key="charts"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Latency Chart */}
							<div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg">
								<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
									<Activity className="w-5 h-5 text-primary" />
									Shard Latency
								</h2>

								<div className="h-[400px]">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={chartData.latencyData}
											margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="hsl(var(--border))"
												opacity={0.3}
											/>
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
											/>
											<YAxis
												label={{
													value: 'Latency (ms)',
													angle: -90,
													position: 'insideLeft',
													style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
												}}
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
											/>
											<Tooltip
												formatter={(value) => [`${value} ms`, 'Latency']}
												contentStyle={{
													backgroundColor: 'hsl(var(--card))',
													borderColor: 'hsl(var(--border))',
													borderRadius: '0.5rem',
													color: 'hsl(var(--foreground))'
												}}
											/>
											<Line
												type="monotone"
												dataKey="latency"
												stroke="hsl(var(--primary))"
												strokeWidth={2}
												dot={{ fill: 'hsl(var(--primary))', r: 4 }}
												activeDot={{
													r: 8,
													fill: 'hsl(var(--primary))',
													stroke: 'hsl(var(--background))'
												}}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							</div>

							{/* Guild Distribution Chart */}
							<div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg">
								<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
									<Shield className="w-5 h-5 text-extra" />
									Guild Distribution
								</h2>

								<div className="h-[400px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={chartData.guildData}
											margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="hsl(var(--border))"
												opacity={0.3}
											/>
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
											/>
											<YAxis
												label={{
													value: 'Guilds',
													angle: -90,
													position: 'insideLeft',
													style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
												}}
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
											/>
											<Tooltip
												formatter={(value) => [`${value} guilds`, 'Count']}
												contentStyle={{
													backgroundColor: 'hsl(var(--card))',
													borderColor: 'hsl(var(--border))',
													borderRadius: '0.5rem',
													color: 'hsl(var(--foreground))'
												}}
											/>
											<Bar
												dataKey="guilds"
												fill="hsl(var(--extra))"
												radius={[4, 4, 0, 0]}
												barSize={30}
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>

							{/* Uptime Comparison */}
							<div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg lg:col-span-2">
								<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
									<Clock className="w-5 h-5 text-primary" />
									Shard Uptime Comparison
								</h2>

								<div className="h-[400px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={Object.entries(data.shard_conns).map(([shard, details]) => ({
												name: `Shard ${shard}`,
												uptime: Math.round((details?.uptime || 0) / 60) // Convert to minutes for better visualization
											}))}
											margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
											layout="vertical"
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="hsl(var(--border))"
												opacity={0.3}
											/>
											<XAxis
												type="number"
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
												label={{
													value: 'Uptime (minutes)',
													position: 'insideBottom',
													offset: -10,
													style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
												}}
											/>
											<YAxis
												dataKey="name"
												type="category"
												tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
												axisLine={{ stroke: 'hsl(var(--border))' }}
												tickLine={{ stroke: 'hsl(var(--border))' }}
											/>
											<Tooltip
												formatter={(value) => [`${value} minutes`, 'Uptime']}
												contentStyle={{
													backgroundColor: 'hsl(var(--card))',
													borderColor: 'hsl(var(--border))',
													borderRadius: '0.5rem',
													color: 'hsl(var(--foreground))'
												}}
											/>
											<Bar
												dataKey="uptime"
												fill="hsl(142, 76%, 36%)"
												radius={[0, 4, 4, 0]}
												barSize={15}
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Status;
