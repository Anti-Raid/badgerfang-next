/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type React from 'react';
import { useMemo, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { botStatsOptions } from '@/lib/api';
import type { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import type { ShardConn } from '@/types/api/bindings/ShardConn';
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart as ReBarChart,
	Bar as ReBar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	LineChart,
	Line,
	RadialBarChart,
	RadialBar,
	Legend,
	AreaChart,
	Area
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
	BarChart3,
	Cpu,
	Zap,
	Database,
	Wifi,
	RefreshCcw,
	HelpCircle,
	ArrowUpRight,
	Globe,
	Terminal,
	Radio,
	ShieldAlert,
	ChevronRight,
	User
} from 'lucide-react';
import {
	motion,
	AnimatePresence,
	useScroll,
	useTransform,
	useSpring,
	useMotionValue
} from 'framer-motion';

// --- Types & Constants ---

type TabKey = 'overview' | 'shards' | 'network';

const STATUS_VARIANTS = {
	Ready: { color: 'emerald', label: 'Operational', icon: Check },
	Connected: { color: 'primary', label: 'Active', icon: Radio },
	MarkedForClosure: { color: 'amber', label: 'Maintenance', icon: AlertTriangle },
	Default: { color: 'destructive', label: 'Offline', icon: X }
};

const GLOW_VARIANTS: Record<string, string> = {
	emerald: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] shadow-emerald-500/20',
	primary: 'group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] shadow-primary/20',
	amber: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] shadow-amber-500/20',
	destructive: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] shadow-destructive/20'
};

// --- Utilities & Hooks ---

const useMousePosition = () => {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			mouseX.set(e.clientX);
			mouseY.set(e.clientY);
		};
		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, [mouseX, mouseY]);

	return { mouseX, mouseY };
};

const formatUptime = (seconds: number): string => {
	const d = Math.floor(seconds / 86400);
	const h = Math.floor((seconds % 86400) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const parts = [];
	if (d > 0) parts.push(`${d}d`);
	if (h > 0) parts.push(`${h}h`);
	if (m > 0 || parts.length === 0) parts.push(`${m}m`);
	return parts.join(' ');
};

const getStatusConfig = (status: string) => {
	return STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || STATUS_VARIANTS.Default;
};

const MetricsBadge = ({ icon: Icon, label, value, color = 'primary' }: any) => (
	<div className="group relative overflow-hidden">
		<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
		<div className="flex items-center gap-5 bg-black/40 border border-white/5 rounded-2xl px-6 py-5 backdrop-blur-xl relative">
			<div
				className={`w-12 h-12 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color} group-hover:scale-110 transition-all duration-500 ${GLOW_VARIANTS[color] || ''}`}
			>
				<Icon size={24} />
			</div>
			<div>
				<p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">
					{label}
				</p>
				<p className="text-xl font-black font-monster tracking-tighter italic uppercase mt-0.5 group-hover:text-primary transition-colors">
					{value}
				</p>
			</div>
		</div>
	</div>
);

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
		<motion.div
			initial={{ opacity: 0, scale: 0.95, y: 20 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			whileHover={{ y: -5 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="group relative"
		>
			{/* Holographic Glowing Border */}
			<div className="absolute -inset-[1px] bg-gradient-to-br from-primary via-primary/50 to-accent/50 rounded-[2rem] opacity-0 group-hover:opacity-30 transition-opacity blur-[2px]" />

			<div className="relative h-full bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] p-6 group-hover:bg-black/80 group-hover:border-primary/30 transition-all overflow-hidden">
				{/* Decorative Corner Brackets */}
				<div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-[1.8rem] group-hover:border-primary/50 transition-colors" />
				<div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-[1.8rem] group-hover:border-primary/50 transition-colors" />

				{/* Shard Background Decor - Animated */}
				<div className="absolute -top-4 -right-4 p-4 opacity-[0.02] group-hover:opacity-[0.06] transition-all group-hover:rotate-12 group-hover:scale-110 duration-700">
					<Server size={120} />
				</div>

				<div className="flex items-start justify-between mb-8">
					<div className="flex items-center gap-5">
						<div
							className={`w-14 h-14 rounded-2xl bg-${config.color}/10 border border-${config.color}/20 flex items-center justify-center text-${config.color} transition-all duration-500 ${GLOW_VARIANTS[config.color] || ''}`}
						>
							<Icon size={30} />
						</div>
						<div>
							<h3 className="text-2xl font-black font-monster tracking-tighter italic uppercase group-hover:text-primary transition-colors">
								Shard {shard.padStart(2, '0')}
							</h3>
							<div className="flex items-center gap-2 mt-1">
								<div
									className={`w-2 h-2 rounded-full bg-${config.color} shadow-lg animate-pulse`}
									style={{ boxShadow: `0 0 10px currentColor` }}
								/>
								<span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
									{config.label}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 group-hover:border-primary/10 transition-colors relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative">
							<div className="flex items-center gap-2 mb-2 text-foreground/30">
								<Wifi size={12} className="group-hover:text-primary transition-colors" />
								<span className="text-[9px] font-black uppercase tracking-widest">Latency</span>
							</div>
							<div className="flex items-end gap-1">
								<span className="text-2xl font-black font-monster italic text-primary">
									{details.real_latency}
								</span>
								<span className="text-[10px] font-bold text-foreground/30 uppercase mb-1">ms</span>
							</div>
						</div>
					</div>
					<div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 group-hover:border-primary/10 transition-colors relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative">
							<div className="flex items-center gap-2 mb-2 text-foreground/30">
								<Globe size={12} className="group-hover:text-primary transition-colors" />
								<span className="text-[9px] font-black uppercase tracking-widest">Guilds</span>
							</div>
							<div className="flex items-end gap-1">
								<span className="text-2xl font-black font-monster italic">
									{details.guilds.toLocaleString()}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative">
							<Clock
								size={14}
								className="text-foreground/20 group-hover:text-primary/50 transition-colors"
							/>
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
								className="absolute inset-0 border-t border-primary/40 rounded-full opacity-0 group-hover:opacity-100"
							/>
						</div>
						<span className="text-[10px] font-bold text-foreground/20 group-hover:text-foreground/40 transition-colors uppercase tracking-[0.1em]">
							UPTIME: {formatUptime(details.uptime)}
						</span>
					</div>
					<div className="flex gap-1.5 items-end h-4">
						{[1, 2, 3, 4].map((i) => (
							<motion.div
								key={i}
								animate={{ height: [4, 12, 6, 10, 4], opacity: [0.3, 1, 0.3] }}
								transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
								className="w-1 bg-primary/40 rounded-full"
							/>
						))}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

// --- Main Layout ---

export default function StatusPage() {
	const [tab, setTab] = useState<'overview' | 'shards'>('overview');

	const { mouseX, mouseY } = useMousePosition();
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll();
	const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

	const spotlightBackground = useTransform(
		[mouseX, mouseY],
		([x, y]) =>
			`radial-gradient(600px circle at ${x}px ${y}px, rgba(var(--primary), 0.08), transparent 40%)`
	);

	const {
		data,
		isLoading: loading,
		error
	} = useQuery({
		...botStatsOptions,
		refetchInterval: 15000, // Poll every 15 seconds for real-time feel
		refetchIntervalInBackground: true
	});

	const err = error instanceof Error ? error.message : error ? String(error) : null;

	const metrics = useMemo(() => {
		if (!data) return null;
		const shards = Object.values(data.shard_conns).map((s) => s!);
		const totalServers = data.total_guilds;
		const avgLatency = Math.round(shards.reduce((a, b) => a + b.real_latency, 0) / shards.length);
		const totalUsers = data.total_users;
		const onlineShards = shards.filter(
			(s) => s.status === 'Ready' || s.status === 'Connected'
		).length;
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
			name: `N${id}`,
			latency: s?.real_latency || 0,
			guilds: s?.guilds || 0,
			uptime: s?.uptime || 0
		}));
	}, [data]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="relative w-32 h-32">
					<motion.div
						animate={{ rotate: 360, scale: [1, 1.1, 1] }}
						transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
						className="absolute inset-0 rounded-full border-t-2 border-primary border-r-transparent border-b-transparent border-l-transparent"
					/>
					<motion.div
						animate={{ rotate: -360, opacity: [0.3, 0.6, 0.3] }}
						transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
						className="absolute inset-4 rounded-full border-b-2 border-accent/50 border-t-transparent border-r-transparent border-l-transparent"
					/>
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
						<Terminal className="text-primary animate-pulse" size={24} />
						<span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/60">
							Syncing shard status
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="min-h-screen text-foreground font-inter selection:bg-primary/30 selection:text-primary relative overflow-hidden"
		>
			{/* Hero HUD */}
			<section className="relative pt-32 pb-20 px-6 lg:pt-56 lg:pb-32 overflow-hidden z-10">
				<div className="max-w-7xl mx-auto flex flex-col items-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="relative z-10 mb-12"
					>
						<div className="absolute -inset-20 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
						<h1 className="text-[14vw] lg:text-[12rem] font-black font-monster leading-[0.75] tracking-tighter text-center uppercase">
							<span className="relative block italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 pb-4">
								System
							</span>
							<span className="relative block text-primary drop-shadow-[0_0_80px_rgba(var(--primary),0.5)]">
								Status
							</span>
						</h1>
						{/* Scanline Effect on Title */}
						<div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] bg-[length:100%_4px] animate-scan" />
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="flex items-center gap-4 text-primary/40 font-mono text-xs uppercase tracking-[0.4em] mb-20"
					>
						<Radio size={20} className="animate-pulse" />
						<span>Core Online</span>
						<div className="h-px w-20 bg-gradient-to-r from-primary to-transparent" />
						<span>Real-Time Status</span>
					</motion.div>

					{/* Metrics Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl relative">
						<MetricsBadge
							icon={Database}
							label="Network Reach"
							value={`${metrics?.totalServers.toLocaleString()} Guilds`}
							color="primary"
						/>

						<MetricsBadge
							icon={User}
							label="Total Users"
							value={`${metrics?.totalUsers} users`}
							color="primary"
						/>

						<MetricsBadge
							icon={Activity}
							label="Core Ping"
							value={`${metrics?.avgLatency} MS`}
							color="emerald"
						/>
						<MetricsBadge
							icon={Server}
							label="Shard Nodes"
							value={`${metrics?.onlineShards}/${metrics?.totalShards} Units`}
							color="primary"
						/>
						<div className="group relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="flex items-center gap-5 bg-black/40 border border-white/5 rounded-2xl px-6 py-5 backdrop-blur-xl relative">
								<div
									className="absolute bottom-0 left-0 h-[3px] bg-primary group-hover:w-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
									style={{ width: `${metrics?.health}%` }}
								/>
								<div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all duration-500">
									<Zap size={24} className="animate-pulse" />
								</div>
								<div>
									<p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">
										System Health
									</p>
									<p className="text-xl font-black font-monster tracking-tighter italic uppercase mt-0.5 group-hover:text-primary transition-colors">
										{metrics?.health}% SYNCED
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Operational Interface */}
			<section className="relative max-w-7xl mx-auto px-6 pb-40 z-10">
				<div className="flex flex-col gap-12">
					{/* Horizontal Navigation */}
					<div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/5">
						<div className="flex flex-col gap-1">
							<h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20 pl-4 border-l-2 border-primary/40">
								Status options
							</h3>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							{[
								{ id: 'overview', label: 'Core Overview', icon: LayoutDashboard },
								{ id: 'shards', label: 'Shard Grid', icon: Server }
							].map((item) => (
								<button
									key={item.id}
									onClick={() => setTab(item.id as any)}
									className={`group relative flex items-center gap-4 px-8 py-4 rounded-2xl transition-all duration-500 ${
										tab === item.id
											? 'bg-primary text-white shadow-[0_10px_30px_rgba(var(--primary),0.3)]'
											: 'bg-white/[0.03] text-foreground/40 border border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
									}`}
								>
									<div
										className={`p-2 rounded-xl transition-all duration-500 ${
											tab === item.id ? 'bg-white/20' : 'bg-primary/10 group-hover:scale-110'
										}`}
									>
										<item.icon
											size={18}
											className={tab === item.id ? 'text-white' : 'text-primary'}
										/>
									</div>
									<span className="font-monster font-black text-xs uppercase italic tracking-widest">
										{item.label}
									</span>
									{tab === item.id && (
										<motion.div
											layoutId="active-tab-glow"
											className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl -z-10"
										/>
									)}
								</button>
							))}
						</div>
					</div>

					{/* Digital Workspace */}
					<div className="w-full">
						<AnimatePresence mode="wait">
							{tab === 'overview' && (
								<motion.div
									key="overview"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									className="space-y-12"
								>
									<div className="flex items-center justify-between">
										<div>
											<h2 className="text-4xl font-black font-monster tracking-tighter uppercase italic mb-2">
												Health Log
											</h2>
											<p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
												Aggregate system performance metrics
											</p>
										</div>
										<button
											onClick={() => fetchData()}
											className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all hover:rotate-180 duration-500"
										>
											<RefreshCcw size={20} />
										</button>
									</div>

									{/* Visualized Health */}
									<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
										<div className="lg:col-span-1 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center min-h-[400px]">
											<div className="relative w-64 h-64">
												<ResponsiveContainer width="100%" height="100%">
													<RadialBarChart
														innerRadius="80%"
														outerRadius="100%"
														data={[
															{ name: 'Health', value: metrics?.health, fill: 'var(--foreground)' }
														]}
														startAngle={180}
														endAngle={-180}
													>
														<RadialBar
															dataKey="value"
															cornerRadius={30}
															fill="hsl(var(--primary))"
															background={{ fill: 'rgba(255,255,255,0.05)' }}
														/>
													</RadialBarChart>
												</ResponsiveContainer>
												<div className="absolute inset-0 flex flex-col items-center justify-center">
													<div className="flex items-end gap-1">
														<span className="text-6xl font-black font-monster italic text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.4)]">
															{metrics?.health}
														</span>
														<span className="text-2xl font-black font-monster text-primary/40 uppercase italic mb-2">
															%
														</span>
													</div>
													<span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">
														Operational
													</span>
												</div>
											</div>
										</div>

										<div className="lg:col-span-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col justify-center">
											<h3 className="text-sm font-black uppercase tracking-[0.4em] text-foreground/30 mb-10 pl-6 border-l-2 border-primary/50">
												Latency Distribution
											</h3>
											<div className="h-[250px] w-full">
												<ResponsiveContainer width="100%" height="100%">
													<ReBarChart data={chartData.slice(0, 32)}>
														<ReBar
															dataKey="latency"
															fill="hsl(var(--primary))"
															radius={[10, 10, 10, 10]}
														/>
														<Tooltip
															cursor={{ fill: 'rgba(255,255,255,0.05)' }}
															contentStyle={{
																backgroundColor: '#1a1a1f',
																border: '1px solid rgba(255,255,255,0.1)',
																borderRadius: '1rem',
																fontStyle: 'italic',
																fontWeight: 'bold'
															}}
														/>
													</ReBarChart>
												</ResponsiveContainer>
											</div>
										</div>
									</div>

									{/* Real-time Load Chart */}
									<div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 overflow-hidden relative">
										<div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
											<Activity size={100} strokeWidth={4} />
										</div>
										<h3 className="text-2xl font-black font-monster uppercase italic mb-12">
											Network Throughput
										</h3>
										<div className="h-[300px] w-full">
											<ResponsiveContainer width="100%" height="100%">
												<AreaChart data={chartData}>
													<defs>
														<linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
															<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
															<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
														</linearGradient>
													</defs>
													<Area
														type="monotone"
														dataKey="latency"
														stroke="hsl(var(--primary))"
														strokeWidth={4}
														fillOpacity={1}
														fill="url(#colorLatency)"
													/>
													<Tooltip
														contentStyle={{
															backgroundColor: '#1a1a1f',
															border: '1px solid rgba(255,255,255,0.1)',
															borderRadius: '1rem',
															fontStyle: 'italic'
														}}
													/>
												</AreaChart>
											</ResponsiveContainer>
										</div>
									</div>
								</motion.div>
							)}

							{tab === 'shards' && (
								<motion.div
									key="shards"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
								>
									<div className="flex items-center justify-between mb-16">
										<div>
											<h2 className="text-4xl font-black font-monster tracking-tighter uppercase italic mb-2">
												Shard Registry
											</h2>
											<p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
												Individual cluster Shard status
											</p>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
										{Object.entries(data?.shard_conns || {}).map(([id, s], idx) => (
											<ShardNode key={id} shard={id} details={s!} index={idx} />
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</section>
		</div>
	);
}
