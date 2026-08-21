/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getBotStats } from '@/lib/api';
import type { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import type { ShardConn } from '@/types/api/bindings/ShardConn';
import {
	ResponsiveContainer,
	BarChart as ReBarChart,
	Bar as ReBar,
	Tooltip,
	AreaChart,
	Area,
	RadialBarChart,
	RadialBar
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
	Zap,
	Database,
	Wifi,
	RefreshCcw,
	Globe,
	Radio,
	Users
} from 'lucide-react';

// Types & Constants

type TabKey = 'overview' | 'shards';

const STATUS_VARIANTS = {
	// The msyscall API reports healthy shards as "ACTIVE".
	Active: {
		colorClass: 'text-emerald-400',
		bgClass: 'bg-emerald-400/10',
		borderClass: 'border-emerald-400/20',
		dotClass: 'bg-emerald-400',
		label: 'Operational',
		icon: Check
	},
	Ready: {
		colorClass: 'text-emerald-400',
		bgClass: 'bg-emerald-400/10',
		borderClass: 'border-emerald-400/20',
		dotClass: 'bg-emerald-400',
		label: 'Operational',
		icon: Check
	},
	Connected: {
		colorClass: 'text-primary',
		bgClass: 'bg-primary/10',
		borderClass: 'border-primary/20',
		dotClass: 'bg-primary',
		label: 'Active',
		icon: Radio
	},
	MarkedForClosure: {
		colorClass: 'text-amber-400',
		bgClass: 'bg-amber-400/10',
		borderClass: 'border-amber-400/20',
		dotClass: 'bg-amber-400',
		label: 'Maintenance',
		icon: AlertTriangle
	},
	Default: {
		colorClass: 'text-destructive',
		bgClass: 'bg-destructive/10',
		borderClass: 'border-destructive/20',
		dotClass: 'bg-destructive',
		label: 'Offline',
		icon: X
	}
};

// Utilities

const formatUptime = (seconds: number): string => {
	const d = Math.floor(seconds / 86400);
	const h = Math.floor((seconds % 86400) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const parts: string[] = [];
	if (d > 0) parts.push(`${d}d`);
	if (h > 0) parts.push(`${h}h`);
	if (m > 0 || parts.length === 0) parts.push(`${m}m`);
	return parts.join(' ');
};

// Statuses that mean a shard is healthy/online (matched case-insensitively).
const ONLINE_STATUSES = ['active', 'ready', 'connected'];

const isShardOnline = (status: string | undefined): boolean =>
	!!status && ONLINE_STATUSES.includes(status.toLowerCase());

const getStatusConfig = (status: string) => {
	const key = Object.keys(STATUS_VARIANTS).find(
		(k) => k.toLowerCase() === status?.toLowerCase()
	) as keyof typeof STATUS_VARIANTS | undefined;
	return key ? STATUS_VARIANTS[key] : STATUS_VARIANTS.Default;
};

// Metric Card

const MetricCard = ({
	icon: Icon,
	label,
	value,
	colorClass = 'text-primary'
}: {
	icon: React.ElementType;
	label: string;
	value: string;
	colorClass?: string;
}) => (
	<div className="group flex flex-col items-center p-5 lg:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all text-center">
		<Icon className={`w-5 h-5 mb-3 ${colorClass}`} />
		<p className={`text-2xl lg:text-3xl font-bold mb-1 ${colorClass}`}>{value}</p>
		<p className="text-xs lg:text-sm text-muted-foreground font-medium">{label}</p>
	</div>
);

// Shard Node Card

const ShardNode = ({
	shard,
	details,
	index
}: {
	shard: string;
	details: ShardConn;
	index: number;
}) => {
	const config = getStatusConfig(details.status);
	const Icon = config.icon;

	return (
		<div
			className="group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2"
			style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, animationFillMode: 'backwards' }}
		>
			{/* Subtle background icon */}
			<Server
				size={80}
				className="absolute -top-2 -right-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity text-foreground"
				aria-hidden="true"
			/>

			{/* Header */}
			<div className="flex items-start justify-between mb-5">
				<div className="flex items-center gap-3">
					<div
						className={`w-10 h-10 rounded-xl ${config.bgClass} border ${config.borderClass} flex items-center justify-center`}
					>
						<Icon className={`w-5 h-5 ${config.colorClass}`} />
					</div>
					<div>
						<h3 className="text-base font-bold text-foreground">Shard {shard.padStart(2, '0')}</h3>
						<div className="flex items-center gap-1.5 mt-0.5">
							<span className={`w-1.5 h-1.5 rounded-full ${config.dotClass} animate-pulse`} />
							<span className="text-xs text-muted-foreground font-medium">{config.label}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Stats grid */}
			<div className="grid grid-cols-2 gap-2.5 mb-4">
				<div className="p-3 rounded-xl bg-accent/30 border border-border/50">
					<div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
						<Wifi className="w-3 h-3" />
						<span className="text-[10px] font-bold uppercase tracking-widest">Latency</span>
					</div>
					<div className="flex items-end gap-0.5">
						<span className="text-xl font-bold text-primary">
							{Math.ceil(details.real_latency)}
						</span>
						<span className="text-xs text-muted-foreground mb-0.5">ms</span>
					</div>
				</div>
				<div className="p-3 rounded-xl bg-accent/30 border border-border/50">
					<div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
						<Globe className="w-3 h-3" />
						<span className="text-[10px] font-bold uppercase tracking-widest">Guilds</span>
					</div>
					<span className="text-xl font-bold text-foreground">
						{details.guilds.toLocaleString()}
					</span>
				</div>
			</div>

			{/* Uptime */}
			<div className="flex items-center justify-between pt-3 border-t border-border">
				<div className="flex items-center gap-2 text-muted-foreground">
					<Clock className="w-3.5 h-3.5" />
					<span className="text-xs font-medium">Uptime: {formatUptime(details.uptime)}</span>
				</div>
				{/* Mini activity bars */}
				<div className="flex gap-0.5 items-end h-3.5">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="w-1 bg-primary/50 rounded-full animate-pulse"
							style={{
								height: `${[3, 8, 5, 10][i - 1]}px`,
								animationDelay: `${i * 0.2}s`,
								animationDuration: '1.5s'
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

// Custom Tooltip

const ChartTooltip = ({ active, payload, label }: any) => {
	if (!active || !payload?.length) return null;
	return (
		<div className="px-3 py-2 rounded-xl bg-card border border-border shadow-xl text-sm">
			<p className="text-muted-foreground text-xs mb-1">{label}</p>
			<p className="font-bold text-foreground">
				{payload[0].value}
				{payload[0].name === 'latency' ? 'ms' : ''}
			</p>
		</div>
	);
};

// Main Layout

export default function StatusPage() {
	const [data, setData] = useState<GetStatusResponse | null>(null);
	const [err, setErr] = useState<string | null>(null);
	const [tab, setTab] = useState<TabKey>('overview');
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const res = await getBotStats();
			setData(res);
			setErr(null);
			setLoading(false);
		} catch (e: any) {
			setErr(e?.message ?? 'Failed to load status data');
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		const id = setInterval(fetchData, 15000);
		return () => clearInterval(id);
	}, []);

	const metrics = useMemo(() => {
		if (!data) return null;
		const shards = Object.values(data.shard_conns).map((s) => s!);
		const totalServers = data.total_guilds;
		const avgLatency = Math.round(shards.reduce((a, b) => a + b.real_latency, 0) / shards.length);
		const totalUsers = data.total_users;
		const onlineShards = shards.filter((s) => isShardOnline(s.status)).length;
		const health = Math.round((onlineShards / shards.length) * 100);
		return {
			totalServers,
			avgLatency,
			totalUsers,
			onlineShards,
			totalShards: shards.length,
			health
		};
	}, [data]);

	const chartData = useMemo(() => {
		if (!data) return [];
		return Object.entries(data.shard_conns).map(([id, s]) => ({
			name: `S${id}`,
			latency: s?.real_latency || 0,
			guilds: s?.guilds || 0
		}));
	}, [data]);

	// Loading
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="relative w-16 h-16">
						<div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
						<div className="absolute inset-0 flex items-center justify-center">
							<Shield className="w-6 h-6 text-primary animate-pulse" />
						</div>
					</div>
					<p className="text-sm text-muted-foreground font-medium">Syncing shard status…</p>
				</div>
			</div>
		);
	}

	// Error
	if (err && !data) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				<div className="text-center max-w-md">
					<div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-7 h-7 text-destructive" />
					</div>
					<h2 className="text-xl font-bold text-foreground mb-2">Status unavailable</h2>
					<p className="text-muted-foreground mb-6">{err}</p>
					<button
						onClick={fetchData}
						className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
					>
						<RefreshCcw className="w-4 h-4" />
						Try again
					</button>
				</div>
			</div>
		);
	}

	const isHealthy = (metrics?.health ?? 0) >= 90;

	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="relative pt-32 pb-16 px-6 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center">
					{/* Status badge */}
					<div className="mb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
						<span
							className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-bold border ${
								isHealthy
									? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
									: 'bg-amber-400/10 text-amber-400 border-amber-400/20'
							}`}
						>
							<span className="relative flex h-2 w-2">
								<span
									className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
										isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
									}`}
								/>
								<span
									className={`relative inline-flex rounded-full h-2 w-2 ${
										isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
									}`}
								/>
							</span>
							{isHealthy ? 'All Systems Operational' : 'Partial Degradation'}
						</span>
					</div>

					<h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-75">
						<span className="text-foreground">System </span>
						<span className="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent">
							Status
						</span>
					</h1>

					<p className="text-lg text-muted-foreground max-w-xl mx-auto animate-in fade-in-0 duration-500 delay-100">
						Live metrics across all shards. Updates every 15 seconds.
					</p>
				</div>
			</section>

			{/* Metrics */}
			<section className="py-8 px-6 border-y border-border bg-card/30">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-150">
						<MetricCard
							icon={Database}
							label="Servers Protected"
							value={metrics?.totalServers.toLocaleString() ?? '—'}
							colorClass="text-primary"
						/>
						<MetricCard
							icon={Users}
							label="Users Secured"
							value={metrics?.totalUsers.toLocaleString() ?? '—'}
							colorClass="text-blue-400"
						/>
						<MetricCard
							icon={Activity}
							label="Avg Latency"
							value={metrics ? `${metrics.avgLatency}ms` : '—'}
							colorClass="text-emerald-400"
						/>
						<MetricCard
							icon={Server}
							label="Shards Online"
							value={metrics ? `${metrics.onlineShards}/${metrics.totalShards}` : '—'}
							colorClass="text-amber-400"
						/>
					</div>
				</div>
			</section>

			{/* Tabs & Content */}
			<section className="max-w-6xl mx-auto px-6 py-16 pb-32">
				{/* Tab bar */}
				<div className="flex items-center justify-between mb-10">
					<div className="flex items-center gap-2 p-1 bg-accent/40 rounded-xl border border-border">
						{(
							[
								{ id: 'overview', label: 'Overview', icon: LayoutDashboard },
								{ id: 'shards', label: 'Shards', icon: Server }
							] as const
						).map((t) => (
							<button
								key={t.id}
								onClick={() => setTab(t.id)}
								className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
									tab === t.id
										? 'bg-card text-foreground shadow-sm border border-border'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<t.icon className="w-4 h-4" />
								{t.label}
								{t.id === 'shards' && metrics && (
									<span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
										{metrics.totalShards}
									</span>
								)}
							</button>
						))}
					</div>

					<button
						onClick={fetchData}
						className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:rotate-180 duration-500"
						aria-label="Refresh"
					>
						<RefreshCcw className="w-4 h-4" />
					</button>
				</div>

				{/* Tab content */}
				{tab === 'overview' && (
					<div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-250">
						{/* Health + Latency row */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Health radial */}
							<div className="p-8 rounded-3xl bg-card border border-border flex flex-col items-center justify-center min-h-[280px]">
								<p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">
									System Health
								</p>
								<div className="relative w-48 h-48">
									<ResponsiveContainer width="100%" height="100%">
										<RadialBarChart
											innerRadius="75%"
											outerRadius="100%"
											data={[{ name: 'Health', value: metrics?.health ?? 0 }]}
											startAngle={180}
											endAngle={-180}
										>
											<RadialBar
												dataKey="value"
												cornerRadius={20}
												fill="hsl(var(--primary))"
												background={{ fill: 'hsl(var(--accent))' }}
											/>
										</RadialBarChart>
									</ResponsiveContainer>
									<div className="absolute inset-0 flex flex-col items-center justify-center">
										<span className="text-4xl font-extrabold text-primary">
											{metrics?.health ?? 0}%
										</span>
										<span className="text-xs text-muted-foreground font-medium mt-1">
											Operational
										</span>
									</div>
								</div>
								<div className="mt-6 flex items-center gap-2">
									<span
										className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}
									/>
									<span className="text-sm font-semibold text-foreground">
										{metrics?.onlineShards}/{metrics?.totalShards} shards online
									</span>
								</div>
							</div>

							{/* Latency bar chart */}
							<div className="lg:col-span-2 p-8 rounded-3xl bg-card border border-border">
								<p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">
									Shard Latency Distribution
								</p>
								<div className="h-[220px]">
									<ResponsiveContainer width="100%" height="100%">
										<ReBarChart data={chartData.slice(0, 32)} barSize={8}>
											<ReBar dataKey="latency" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
											<Tooltip
												content={<ChartTooltip />}
												cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
											/>
										</ReBarChart>
									</ResponsiveContainer>
								</div>
								<p className="text-xs text-muted-foreground mt-3">
									Showing {Math.min(chartData.length, 32)} of {chartData.length} shards · avg{' '}
									{metrics?.avgLatency}ms
								</p>
							</div>
						</div>

						{/* Network throughput area chart */}
						<div className="p-8 rounded-3xl bg-card border border-border">
							<div className="flex items-center justify-between mb-6">
								<div>
									<p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
										Network Throughput
									</p>
									<h3 className="text-xl font-bold text-foreground">Latency across all shards</h3>
								</div>
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/40 border border-border">
									<Zap className="w-3.5 h-3.5 text-primary" />
									<span className="text-xs font-bold text-foreground">Live</span>
								</div>
							</div>
							<div className="h-[240px]">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartData}>
										<defs>
											<linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
												<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
											</linearGradient>
										</defs>
										<Area
											type="monotone"
											dataKey="latency"
											stroke="hsl(var(--primary))"
											strokeWidth={2.5}
											fillOpacity={1}
											fill="url(#latencyGradient)"
											dot={false}
											activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
										/>
										<Tooltip
											content={<ChartTooltip />}
											cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>

						{err && (
							<div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
								<AlertTriangle className="w-4 h-4 flex-shrink-0" />
								{err}
							</div>
						)}
					</div>
				)}

				{tab === 'shards' && (
					<div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-250">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-foreground mb-1">Shard Registry</h2>
								<p className="text-sm text-muted-foreground">
									Individual cluster status across {Object.keys(data?.shard_conns ?? {}).length}{' '}
									shards
								</p>
							</div>
							<div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground font-medium">
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-emerald-400" />
									Operational
								</span>
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-amber-400" />
									Maintenance
								</span>
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-destructive" />
									Offline
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{Object.entries(data?.shard_conns ?? {}).map(([id, s], idx) => (
								<ShardNode key={id} shard={id} details={s!} index={idx} />
							))}
						</div>
					</div>
				)}
			</section>
		</div>
	);
}
