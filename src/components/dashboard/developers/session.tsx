'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	KeyRound, Trash2, Plus, Terminal, Copy, Clock,
	RefreshCw, Check, AlertTriangle, Zap, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserSessions, revokeSession, createSession } from '@/lib/api';
import type { UserSession } from '@/types/api/bindings/UserSession';
import type { CreateUserSession } from '@/types/api/bindings/CreateUserSession';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentSessionId(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return JSON.parse(localStorage.getItem('wistala') || '{}')?.session_id ?? null;
	} catch {
		return null;
	}
}

function formatExpiry(expirySeconds: number): string {
	const days = Math.floor(expirySeconds / 86400);
	const hours = Math.floor((expirySeconds % 86400) / 3600);
	if (days > 0) return `${days}d ${hours}h`;
	return `${hours}h`;
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
	label, value, icon, delay = 0
}: { label: string; value: string | number; icon: React.ReactNode; delay?: number }) => (
	<motion.div
		initial={{ opacity: 0, y: 16 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.4, delay }}
		className="relative group p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
	>
		<div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
		<div className="flex items-center gap-3 mb-3">
			<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 flex items-center justify-center text-primary">
				{icon}
			</div>
			<span className="text-sm font-medium text-muted-foreground">{label}</span>
		</div>
		<p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
	</motion.div>
);

// ── Session Row ───────────────────────────────────────────────────────────────

const SessionRow = ({
	session, currentSessionId, onRevoke
}: { session: UserSession; currentSessionId: string | null; onRevoke: (id: string) => void }) => {
	const [copied, setCopied] = useState(false);
	const isCurrent = session.id === currentSessionId;

	const copyId = () => {
		navigator.clipboard.writeText(session.id);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -10 }}
			className={`group relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
				isCurrent
					? 'bg-primary/5 border-primary/25'
					: 'bg-background border-border hover:border-border/80'
			}`}
		>
			{isCurrent && (
				<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
			)}

			{/* Icon */}
			<div className="w-8 h-8 rounded-lg bg-accent border border-border flex items-center justify-center flex-shrink-0">
				{session.type === 'login'
					? <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
					: <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
				}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
						{session.name?.slice(0, 20) || 'Unnamed'}
					</span>
					{isCurrent && (
						<span className="px-1.5 py-0.5 text-[10px] font-bold text-primary bg-primary/10 rounded-full border border-primary/20">
							Current
						</span>
					)}
					<span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${
						session.type === 'login'
							? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
							: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
					}`}>
						{session.type}
					</span>
				</div>
				<div className="flex items-center gap-2 mt-0.5">
					<code className="text-[11px] font-mono text-muted-foreground/60">
						{session.id.slice(0, 8)}…
					</code>
					<button
						onClick={copyId}
						className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
					>
						{copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
					</button>
					<span className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
						<Clock className="w-2.5 h-2.5" />
						{formatDate(session.created_at)}
					</span>
				</div>
			</div>

			{/* Revoke */}
			<button
				onClick={() => onRevoke(session.id)}
				className="p-2 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
				aria-label="Revoke session"
			>
				<Trash2 className="w-3.5 h-3.5" />
			</button>
		</motion.div>
	);
};

// ── Session Panel ─────────────────────────────────────────────────────────────

const SessionPanel = ({
	title, description, icon, sessions, onRevoke, delay = 0
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	sessions: UserSession[];
	onRevoke: (id: string) => void;
	delay?: number;
}) => {
	const currentSessionId = getCurrentSessionId();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, delay }}
			className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-center gap-3 p-5 border-b border-border">
				<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
					{icon}
				</div>
				<div className="min-w-0">
					<h3 className="text-sm font-bold text-foreground">{title}</h3>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
				<span className="ml-auto text-xs font-bold text-muted-foreground bg-accent border border-border px-2 py-0.5 rounded-full">
					{sessions.length}
				</span>
			</div>

			{/* Body */}
			<div className="flex-1 p-4">
				{sessions.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 text-center">
						<div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mb-3">
							<ShieldCheck className="w-5 h-5 text-muted-foreground/40" />
						</div>
						<p className="text-sm text-muted-foreground">No active sessions</p>
					</div>
				) : (
					<div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
						<AnimatePresence>
							{sessions.map((s) => (
								<SessionRow
									key={s.id}
									session={s}
									currentSessionId={currentSessionId}
									onRevoke={onRevoke}
								/>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>
		</motion.div>
	);
};

// ── Create Token Form ─────────────────────────────────────────────────────────

const CreateTokenForm = ({ onCreated }: { onCreated: () => void }) => {
	const [form, setForm] = useState<CreateUserSession>({ name: '', type: 'api', expiry: 86400 });
	const [token, setToken] = useState<string | null>(null);
	const [tokenVisible, setTokenVisible] = useState(false);
	const [copied, setCopied] = useState(false);
	const [loading, setLoading] = useState(false);

	const copyToken = () => {
		if (!token) return;
		navigator.clipboard.writeText(token);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) { toast.error('Please enter a name'); return; }
		if (form.expiry < 3600) { toast.error('Minimum expiry is 1 hour (3600s)'); return; }
		setLoading(true);
		try {
			const res = await createSession(form);
			setToken(res.token);
			setTokenVisible(false);
			onCreated();
			setForm({ name: '', type: 'api', expiry: 86400 });
			toast.success('Token created');
		} catch {
			toast.error('Failed to create token');
		} finally {
			setLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, delay: 0.1 }}
			className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-center gap-3 p-5 border-b border-border">
				<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
					<Plus className="w-4 h-4" />
				</div>
				<div>
					<h3 className="text-sm font-bold text-foreground">New API Token</h3>
					<p className="text-xs text-muted-foreground">Generate a token for API access</p>
				</div>
			</div>

			<form onSubmit={submit} className="flex-1 flex flex-col">
				<div className="p-5 space-y-4 flex-1">
					{/* Name */}
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-foreground uppercase tracking-wide">
							Token name
						</label>
						<input
							type="text"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							placeholder="e.g. my-bot-integration"
							disabled={loading}
							className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
						/>
					</div>

					{/* Expiry */}
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-foreground uppercase tracking-wide">
							Expiry
						</label>
						<div className="grid grid-cols-3 gap-2">
							{[
								{ label: '1 day', value: 86400 },
								{ label: '7 days', value: 604800 },
								{ label: '30 days', value: 2592000 },
							].map(({ label, value }) => (
								<button
									key={value}
									type="button"
									onClick={() => setForm({ ...form, expiry: value })}
									className={`py-2 rounded-xl text-xs font-bold border transition-all ${
										form.expiry === value
											? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
											: 'bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
									}`}
								>
									{label}
								</button>
							))}
						</div>
						<div className="flex items-center gap-2">
							<input
								type="number"
								value={form.expiry}
								onChange={(e) => setForm({ ...form, expiry: Number(e.target.value) })}
								min={3600}
								disabled={loading}
								className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
							/>
							<span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
								{formatExpiry(form.expiry)}
							</span>
						</div>
					</div>

					{/* Created token reveal */}
					<AnimatePresence>
						{token && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 overflow-hidden"
							>
								<div className="p-4">
									<div className="flex items-center gap-2 mb-3">
										<Check className="w-4 h-4 text-emerald-400" />
										<span className="text-sm font-bold text-emerald-400">Token created</span>
									</div>
									<div className="flex items-center gap-2 bg-background rounded-lg border border-border p-2.5 mb-2">
										<code className="text-xs font-mono text-muted-foreground flex-1 truncate">
											{tokenVisible ? token : '•'.repeat(Math.min(token.length, 40))}
										</code>
										<button
											type="button"
											onClick={() => setTokenVisible(!tokenVisible)}
											className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
										>
											{tokenVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
										</button>
										<button
											type="button"
											onClick={copyToken}
											className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
										>
											{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
										</button>
									</div>
									<div className="flex items-start gap-1.5">
										<AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
										<p className="text-[11px] text-muted-foreground leading-relaxed">
											Copy this token now — it won't be shown again.
										</p>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className="p-4 border-t border-border">
					<button
						type="submit"
						disabled={loading}
						className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
					>
						{loading ? (
							<><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
						) : (
							<><Zap className="w-4 h-4" /> Generate Token</>
						)}
					</button>
				</div>
			</form>
		</motion.div>
	);
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
	const [sessions, setSessions] = useState<{ login: UserSession[]; api: UserSession[] }>({
		login: [],
		api: []
	});
	const [loading, setLoading] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const fetchSessions = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getUserSessions();
			setSessions({
				login: data.sessions.filter((s): s is UserSession => s?.type === 'login') ?? [],
				api: data.sessions.filter((s): s is UserSession => s?.type !== 'login') ?? []
			});
			setLastUpdated(new Date());
		} catch {
			toast.error('Failed to fetch sessions');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchSessions(); }, [fetchSessions]);

	const handleRevoke = async (sessionId: string) => {
		try {
			await revokeSession(sessionId);
			toast.success('Session revoked');
			fetchSessions();
		} catch {
			toast.error('Failed to revoke session');
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* ── Hero ── */}
			<section className="relative pt-28 pb-10 px-6 overflow-hidden border-b border-border">
				<div className="absolute inset-0 -z-10 pointer-events-none">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_-5%,hsl(var(--primary)/0.14),transparent)]" />
					<div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] bg-[size:48px_48px]" />
				</div>

				<div className="max-w-6xl mx-auto">
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
						<div>
							<motion.p
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-xs font-bold text-primary uppercase tracking-widest mb-2"
							>
								Developer Portal
							</motion.p>
							<motion.h1
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.04 }}
								className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2"
							>
								Session{' '}
								<span className="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent">
									Management
								</span>
							</motion.h1>
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.08 }}
								className="text-sm text-muted-foreground max-w-md"
							>
								Manage your active sessions and API tokens. Revoke suspicious activity or generate new tokens for integrations.
							</motion.p>
						</div>

						<motion.button
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1 }}
							onClick={fetchSessions}
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-card transition-all self-start sm:self-auto flex-shrink-0"
						>
							<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
							{lastUpdated
								? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
								: 'Refresh'
							}
						</motion.button>
					</div>

					{/* Stat cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<StatCard
							label="Login Sessions"
							value={loading ? '—' : sessions.login.length}
							icon={<KeyRound className="w-4 h-4" />}
							delay={0.05}
						/>
						<StatCard
							label="API Tokens"
							value={loading ? '—' : sessions.api.length}
							icon={<Terminal className="w-4 h-4" />}
							delay={0.1}
						/>
						<StatCard
							label="Total Sessions"
							value={loading ? '—' : sessions.login.length + sessions.api.length}
							icon={<ShieldCheck className="w-4 h-4" />}
							delay={0.15}
						/>
					</div>
				</div>
			</section>

			{/* ── Content ── */}
			<section className="max-w-6xl mx-auto px-6 py-10">
				{loading ? (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[0, 1, 2].map((i) => (
							<div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
								<div className="p-5 border-b border-border flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-muted" />
									<div className="space-y-1.5 flex-1">
										<div className="h-3 w-24 bg-muted rounded" />
										<div className="h-2.5 w-32 bg-muted rounded" />
									</div>
								</div>
								<div className="p-4 space-y-2.5">
									{[1, 2, 3].map((j) => (
										<div key={j} className="h-14 rounded-xl bg-muted" />
									))}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						<SessionPanel
							title="Login Sessions"
							description="Active browser sessions"
							icon={<KeyRound className="w-4 h-4" />}
							sessions={sessions.login}
							onRevoke={handleRevoke}
							delay={0}
						/>

						<CreateTokenForm onCreated={fetchSessions} />

						<SessionPanel
							title="API Tokens"
							description="Programmatic API access"
							icon={<Terminal className="w-4 h-4" />}
							sessions={sessions.api}
							onRevoke={handleRevoke}
							delay={0.2}
						/>
					</div>
				)}
			</section>
		</div>
	);
};

export default Dashboard;
