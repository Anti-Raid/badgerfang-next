/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getBotStats } from '@/lib/api';
import type { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import type { ShardConn } from '@/types/api/bindings/ShardConn';
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	LineChart,
	Line,
	RadialBarChart,
	RadialBar,
	Legend
} from 'recharts';
import {
	Shield,
	Server,
	Activity,
	Clock,
	Check,
	AlertTriangle,
	X,
	LayoutDashboard,
	BarChart3
} from 'lucide-react';

type TabKey = 'overview' | 'shards' | 'charts';

// Helpers
const formatUptime = (uptimeSeconds: number): string => {
	const d = Math.floor(uptimeSeconds / 86400);
	const h = Math.floor((uptimeSeconds % 86400) / 3600);
	const m = Math.floor((uptimeSeconds % 3600) / 60);
	const s = Math.floor(uptimeSeconds % 60);
	const parts: string[] = [];
	if (d) parts.push(`${d}d`);
	if (h) parts.push(`${h}h`);
	if (m) parts.push(`${m}m`);
	if (s || parts.length === 0) parts.push(`${s}s`);
	return parts.join(' ');
};

const statusColor = (status: string) => {
	switch (status) {
		case 'Ready':
			return 'hsl(142, 76%, 36%)'; // green
		case 'Connected':
			return 'hsl(var(--primary))'; // brand
		case 'MarkedForClosure':
			return 'hsl(38, 92%, 50%)'; // amber
		default:
			return 'hsl(var(--destructive))'; // red
	}
};

const StatusDot = ({ color }: { color: string }) => (
	<span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
);

// Cards
function StatCard({
	title,
	value,
	icon,
	accent = 'hsl(var(--primary))',
	delayMs = 0
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	accent?: string;
	delayMs?: number;
}) {
	return (
		<div
			className="relative rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
			style={{ animation: `fadeIn 400ms ease ${delayMs}ms both` as any }}
		>
			<div className="absolute -right-4 -top-4 opacity-10" style={{ color: accent }}>
				<div className="p-4">{icon}</div>
			</div>
			<div className="flex items-center gap-3">
				<div className="rounded-md p-2" style={{ backgroundColor: `${accent}20`, color: accent }}>
					{icon}
				</div>
				<div>
					<p className="text-xs text-muted-foreground">{title}</p>
					<p className="mt-1 text-2xl font-bold">{value}</p>
				</div>
			</div>
		</div>
	);
}

function ShardCard({
	shard,
	details
}: {
	shard: string;
	details: Pick<ShardConn, 'status' | 'real_latency' | 'guilds' | 'uptime'>;
}) {
	const c = statusColor(details.status);
	return (
		<div
			className="rounded-lg border border-border/60 bg-card p-4 transition-colors"
			style={{ boxShadow: `0 0 0 1px ${c}10 inset` }}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Server className="w-4 h-4 text-muted-foreground" />
					<h3 className="font-semibold">Shard {shard}</h3>
				</div>
				<div className="flex items-center gap-2 text-xs" style={{ color: c }}>
					{details.status === 'Ready' || details.status === 'Connected' ? (
						<Check />
					) : details.status === 'MarkedForClosure' ? (
						<AlertTriangle />
					) : (
						<X />
					)}
					<span className="font-medium">{details.status}</span>
				</div>
			</div>
			<div className="mt-3 grid grid-cols-2 gap-3">
				<div className="rounded-md bg-secondary/60 p-2">
					<p className="text-xs text-muted-foreground">Latency</p>
					<p className="text-lg font-bold">{details.real_latency} ms</p>
				</div>
				<div className="rounded-md bg-secondary/60 p-2">
					<p className="text-xs text-muted-foreground">Guilds</p>
					<p className="text-lg font-bold">{details.guilds}</p>
				</div>
			</div>
			<div className="mt-3 rounded-md bg-secondary/60 p-2">
				<p className="text-xs text-muted-foreground">Uptime</p>
				<p className="text-sm font-medium">{formatUptime(details.uptime)}</p>
			</div>
		</div>
	);
}

export default function StatusPage() {
	const [data, setData] = useState<GetStatusResponse | null>(null);
	const [err, setErr] = useState<string | null>(null);
	const [tab, setTab] = useState<TabKey>('overview');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		const fetchData = async () => {
			try {
				setLoading(true);
				const res = await getBotStats();
				if (mounted) {
					setData(res);
					setErr(null);
				}
			} catch (e: any) {
				if (mounted) setErr(e?.message ?? 'Failed to load');
			} finally {
				if (mounted) setLoading(false);
			}
		};
		fetchData();
		const id = setInterval(fetchData, 30000);
		return () => {
			mounted = false;
			clearInterval(id);
		};
	}, []);

	const chartData = useMemo(() => {
		if (!data)
			return {
				latency: [] as { name: string; latency: number }[],
				guilds: [] as { name: string; guilds: number }[],
				status: [] as { label: string; value: number; color: string }[],
				uptime: [] as { name: string; uptime: number }[]
			};
		const latency = Object.entries(data.shard_conns).map(([k, s]) => ({
			name: `Shard ${k}`,
			latency: s?.real_latency ?? 0
		}));
		const guilds = Object.entries(data.shard_conns).map(([k, s]) => ({
			name: `Shard ${k}`,
			guilds: s?.guilds ?? 0
		}));
		const uptime = Object.entries(data.shard_conns).map(([k, s]) => ({
			name: `Shard ${k}`,
			uptime: s?.uptime ?? 0
		}));
		const counts = Object.values(data.shard_conns).reduce(
			(acc, s) => {
				if (!s) return acc;
				acc[s.status] = (acc[s.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
		const status = Object.entries(counts).map(([label, value]) => ({
			label,
			value,
			color: statusColor(label)
		}));
		return { latency, guilds, status, uptime };
	}, [data]);

	const summary = useMemo(() => {
		if (!data) return null;
		const totalShards = Object.keys(data.shard_conns).length;
		const totalGuilds = data.total_guilds;
		const avgLatency = Math.round(
			Object.values(data.shard_conns).reduce((sum, s) => sum + (s?.real_latency ?? 0), 0) /
				Math.max(1, totalShards)
		);
		const ready = Object.values(data.shard_conns).filter(
			(s) => s?.status === 'Ready' || s?.status === 'Connected'
		).length;
		const health = Math.round((ready / Math.max(1, totalShards)) * 100);
		return { totalShards, totalGuilds, avgLatency, ready, health };
	}, [data]);

	if (loading) {
		return (
			<main className="min-h-screen grid place-items-center">
				<div className="flex flex-col items-center gap-4">
					<div className="relative h-16 w-16">
						<div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
						<div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
					</div>
					<p className="text-lg font-medium">Loading status…</p>
				</div>
			</main>
		);
	}

	if (err) {
		return (
			<main className="min-h-screen grid place-items-center">
				<div className="max-w-md rounded-xl border border-destructive/50 bg-card p-6">
					<div className="mb-3 flex items-center gap-2 text-destructive">
						<X className="w-6 h-6" />
						<h2 className="text-xl font-bold">Failed to load</h2>
					</div>
					<p className="text-sm text-muted-foreground">{err}</p>
					<button
						className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:opacity-90"
						onClick={() => location.reload()}
					>
						Retry
					</button>
				</div>
			</main>
		);
	}

	if (!data || !summary) {
		return (
			<main className="min-h-screen grid place-items-center">
				<div className="max-w-md rounded-xl border border-border bg-card p-6">
					<div className="mb-3 flex items-center gap-2 text-muted-foreground">
						<AlertTriangle className="w-6 h-6" />
						<h2 className="text-xl font-bold">No data available</h2>
					</div>
					<button
						className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:opacity-90"
						onClick={() => location.reload()}
					>
						Refresh
					</button>
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-7xl px-4 py-8">
			{/* Header */}
			<header className="mb-8">
				<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
					<div>
						<h1 className="text-balance text-3xl font-bold">AntiRaid Status</h1>
						<p className="mt-1 text-pretty text-muted-foreground">
							Real-time monitoring for all shards and services
						</p>
					</div>

					<div className="rounded-lg border border-border bg-card p-1.5">
						<nav aria-label="Tabs" className="flex items-center gap-1">
							{(['overview', 'shards', 'charts'] as TabKey[]).map((k) => {
								const isActive = tab === k;
								const Icon =
									k === 'overview' ? LayoutDashboard : k === 'shards' ? Server : BarChart3;
								return (
									<button
										key={k}
										onClick={() => setTab(k)}
										className={[
											'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
											isActive
												? 'bg-primary text-primary-foreground shadow-sm'
												: 'hover:bg-secondary'
										].join(' ')}
										aria-current={isActive ? 'page' : undefined}
									>
										<Icon className="h-4 w-4" />
										<span className="capitalize">{k}</span>
									</button>
								);
							})}
						</nav>
					</div>
				</div>

				<div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
					<div className="flex items-center gap-3">
						<span className="rounded-full bg-primary/20 p-2 text-primary">
							<Clock className="w-5 h-5" />
						</span>
						<div>
							<p className="text-xs text-muted-foreground">Last updated</p>
							<p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
						</div>
						<div className="ml-auto flex items-center gap-2">
							<span
								className="inline-block h-3 w-3 animate-pulse rounded-full"
								style={{
									backgroundColor: summary.health > 90 ? 'hsl(142,76%,36%)' : 'hsl(38,92%,50%)'
								}}
								aria-label="Health indicator"
							/>
							<span className="text-sm font-medium">{summary.health}% Healthy</span>
						</div>
					</div>
				</div>
			</header>

			{/* Summary Cards */}
			<section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Shards"
					value={summary.totalShards}
					icon={<Server className="h-5 w-5" />}
					accent="hsl(var(--primary))"
					delayMs={50}
				/>
				<StatCard
					title="Total Servers"
					value={summary.totalGuilds.toLocaleString()}
					icon={<Shield className="h-5 w-5" />}
					accent="hsl(var(--chart-2))"
					delayMs={100}
				/>
				<StatCard
					title="Avg. Latency"
					value={`${summary.avgLatency} ms`}
					icon={<Activity className="h-5 w-5" />}
					accent="hsl(var(--destructive))"
					delayMs={150}
				/>
				<StatCard
					title="Ready Shards"
					value={`${summary.ready} / ${summary.totalShards}`}
					icon={<Check className="h-5 w-5" />}
					accent="hsl(142,76%,36%)"
					delayMs={200}
				/>
			</section>

			{/* Tabs */}
			{tab === 'overview' && (
				<section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="rounded-xl border border-border/60 bg-card p-6">
						<h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
							<Shield className="w-5 h-5 text-[hsl(var(--chart-2))]" />
							System Health
						</h2>

						<div className="space-y-6">
							{/* Health radial ring */}
							<div className="relative mx-auto h-56 w-full max-w-xs">
								<ResponsiveContainer width="100%" height="100%">
									<RadialBarChart
										data={[
											{
												name: 'Health',
												value: summary.health,
												fill:
													summary.health > 90
														? 'hsl(142,76%,36%)'
														: summary.health > 70
															? 'hsl(38,92%,50%)'
															: 'hsl(var(--destructive))'
											}
										]}
										innerRadius="70%"
										outerRadius="100%"
										startAngle={90}
										endAngle={-270}
									>
										<RadialBar dataKey="value" cornerRadius={10} background />
									</RadialBarChart>
								</ResponsiveContainer>

								{/* Center label */}
								<div className="pointer-events-none absolute inset-0 grid place-items-center">
									<div className="text-center">
										<div className="text-3xl font-bold">{summary.health}%</div>
										<div className="text-xs text-muted-foreground">Overall Health</div>
									</div>
								</div>
							</div>

							{/* Average latency bar remains for quick insight */}
							<div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Average Latency</span>
									<span className="text-sm font-medium">{summary.avgLatency} ms</span>
								</div>
								<div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
									<div
										className="h-full rounded-full"
										style={{
											width: `${Math.min(100, (summary.avgLatency / 100) * 100)}%`,
											backgroundColor:
												summary.avgLatency < 50
													? 'hsl(142,76%,36%)'
													: summary.avgLatency < 80
														? 'hsl(38,92%,50%)'
														: 'hsl(var(--destructive))'
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Performance Metrics remains; uses Recharts BarChart */}
					<div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-6">
						<h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
							<Activity className="w-5 h-5 text-primary" />
							Performance Metrics
						</h2>

						{/* Replace custom Bars with Recharts BarChart (first 12 shards) */}
						<div className="h-[320px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={chartData.latency.slice(0, 12)}
									margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
									<XAxis
										dataKey="name"
										angle={-35}
										textAnchor="end"
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
									/>
									<YAxis
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
										label={{
											value: 'Latency (ms)',
											angle: -90,
											position: 'insideLeft',
											style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
										}}
									/>
									<Tooltip
										formatter={(v) => [`${v} ms`, 'Latency']}
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
										maxBarSize={28}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>

						{/* Quick stats remain */}
						<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="rounded-md bg-secondary/60 p-4">
								<h4 className="mb-1 text-sm text-muted-foreground">Lowest Latency</h4>
								<p className="text-xl font-bold">
									{Math.min(...Object.values(data.shard_conns).map((s) => s?.real_latency ?? 0))} ms
								</p>
							</div>
							<div className="rounded-md bg-secondary/60 p-4">
								<h4 className="mb-1 text-sm text-muted-foreground">Highest Latency</h4>
								<p className="text-xl font-bold">
									{Math.max(...Object.values(data.shard_conns).map((s) => s?.real_latency ?? 0))} ms
								</p>
							</div>
							<div className="rounded-md bg-secondary/60 p-4">
								<h4 className="mb-1 text-sm text-muted-foreground">Median Latency</h4>
								<p className="text-xl font-bold">
									{
										Object.values(data.shard_conns)
											.map((s) => s?.real_latency ?? 0)
											.sort((a, b) => a - b)[Math.floor(Object.keys(data.shard_conns).length / 2)]
									}{' '}
									ms
								</p>
							</div>
						</div>
					</div>
				</section>
			)}

			{tab === 'shards' && (
				<section className="rounded-xl border border-border/60 bg-card p-6">
					<div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<h2 className="flex items-center gap-2 text-xl font-bold">
							<Server className="w-5 h-5 text-primary" />
							Shard Status
						</h2>
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2 text-sm">
								<span
									className="inline-block h-3 w-3 rounded-full"
									style={{ backgroundColor: 'hsl(142,76%,36%)' }}
								/>
								<span>Ready</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<span
									className="inline-block h-3 w-3 rounded-full"
									style={{ backgroundColor: 'hsl(38,92%,50%)' }}
								/>
								<span>Marked</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<span
									className="inline-block h-3 w-3 rounded-full"
									style={{ backgroundColor: 'hsl(var(--destructive))' }}
								/>
								<span>Disconnected</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{Object.entries(data.shard_conns)
							.filter(([, s]) => s !== undefined)
							.map(([k, s]) => (
								<ShardCard
									key={k}
									shard={k}
									details={{
										status: (s as ShardConn).status,
										real_latency: (s as ShardConn).real_latency,
										guilds: (s as ShardConn).guilds,
										uptime: (s as ShardConn).uptime
									}}
								/>
							))}
					</div>
				</section>
			)}

			{tab === 'charts' && (
				<section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Latency LineChart across all shards */}
					<div className="rounded-xl border border-border/60 bg-card p-6">
						<h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
							<Activity className="w-5 h-5 text-primary" />
							Shard Latency
						</h2>
						<div className="h-[360px]">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={chartData.latency}
									margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
									<XAxis
										dataKey="name"
										angle={-35}
										textAnchor="end"
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
									/>
									<YAxis
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
										label={{
											value: 'Latency (ms)',
											angle: -90,
											position: 'insideLeft',
											style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
										}}
									/>
									<Tooltip
										formatter={(v) => [`${v} ms`, 'Latency']}
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
										dot={{ r: 3, fill: 'hsl(var(--primary))' }}
										activeDot={{
											r: 6,
											fill: 'hsl(var(--primary))',
											stroke: 'hsl(var(--background))'
										}}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Guilds BarChart */}
					<div className="rounded-xl border border-border/60 bg-card p-6">
						<h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
							<Shield className="w-5 h-5 text-[hsl(var(--chart-2))]" />
							Guild Distribution
						</h2>
						<div className="h-[360px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={chartData.guilds}
									margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
									<XAxis
										dataKey="name"
										angle={-35}
										textAnchor="end"
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
									/>
									<YAxis
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
										label={{
											value: 'Guilds',
											angle: -90,
											position: 'insideLeft',
											style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
										}}
									/>
									<Tooltip
										formatter={(v) => [`${v} guilds`, 'Count']}
										contentStyle={{
											backgroundColor: 'hsl(var(--card))',
											borderColor: 'hsl(var(--border))',
											borderRadius: '0.5rem',
											color: 'hsl(var(--foreground))'
										}}
									/>
									<Bar
										dataKey="guilds"
										fill="hsl(var(--chart-2))"
										radius={[4, 4, 0, 0]}
										maxBarSize={28}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Uptime horizontal BarChart (minutes) */}
					<div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-6">
						<h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
							<Clock className="w-5 h-5 text-primary" />
							Uptime Comparison (minutes)
						</h2>
						<div className="h-[380px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={Object.entries(data.shard_conns).map(([k, s]) => ({
										name: `Shard ${k}`,
										uptime: Math.round((s?.uptime ?? 0) / 60)
									}))}
									layout="vertical"
									margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
									<XAxis
										type="number"
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
									/>
									<YAxis
										type="category"
										dataKey="name"
										width={90}
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
									/>
									<Tooltip
										formatter={(v) => [`${v} minutes`, 'Uptime']}
										contentStyle={{
											backgroundColor: 'hsl(var(--card))',
											borderColor: 'hsl(var(--border))',
											borderRadius: '0.5rem',
											color: 'hsl(var(--foreground))'
										}}
									/>
									<Bar
										dataKey="uptime"
										fill="hsl(142,76%,36%)"
										radius={[0, 4, 4, 0]}
										maxBarSize={18}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Additional charts */}
					<div className="rounded-xl border border-border/60 bg-card p-6">
						<h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
							<BarChart3 className="w-5 h-5 text-primary" />
							Shard Latency Distribution
						</h2>
						<div className="h-[360px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={chartData.latency}
									margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
									<XAxis
										dataKey="name"
										angle={-35}
										textAnchor="end"
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
									/>
									<YAxis
										tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
										axisLine={{ stroke: 'hsl(var(--border))' }}
										tickLine={{ stroke: 'hsl(var(--border))' }}
										label={{
											value: 'Latency (ms)',
											angle: -90,
											position: 'insideLeft',
											style: { fill: 'hsl(var(--foreground))', fontSize: 12 }
										}}
									/>
									<Tooltip
										formatter={(v) => [`${v} ms`, 'Latency']}
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
										maxBarSize={28}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</section>
			)}
		</main>
	);
}

/* keyframes for subtle card reveal (used in StatCard) */
declare global {
	interface CSSStyleDeclaration {
		// allow custom animation string
	}
}
