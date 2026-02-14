'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Trash2, Plus, Settings, Copy, Clock, RefreshCw, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserSessions, revokeSession, createSession } from '@/lib/api';
import { UserSession } from '@/types/api/bindings/UserSession';
import { CreateUserSession } from '@/types/api/bindings/CreateUserSession';

const SessionCard: React.FC<{
	title: string;
	description: string;
	icon: React.ReactNode;
	sessions: UserSession[];
	onRevoke: (sessionId: string) => void;
	className?: string;
}> = ({ title, description, icon, sessions, onRevoke, className }) => {
	const wistalaData =
		typeof localStorage !== 'undefined'
			? JSON.parse(localStorage.getItem('wistala') || '{}')
			: null;
	const currentSessionId = wistalaData ? wistalaData.session_id || null : null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }}
			className={`bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col ${className}`}
			role="region"
			aria-label={title}
		>
			<div className="p-6 border-b border-border">
				<div className="flex items-center gap-4">
					<div
						className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground"
						aria-hidden="true"
					>
						{icon}
					</div>
					<div>
						<h2 className="text-lg font-semibold text-foreground">{title}</h2>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
				</div>
			</div>

			<div className="flex-1 p-6 overflow-hidden">
				{sessions.length === 0 ? (
					<div
						className="flex flex-col items-center justify-center h-full py-12 px-4"
						role="status"
					>
						<p className="text-muted-foreground text-center text-sm">No active sessions</p>
					</div>
				) : (
					<div className="space-y-3 overflow-y-auto max-h-[400px]">
						<AnimatePresence>
							{sessions.map((session) => (
								<motion.div
									key={session.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className={`group relative p-4 rounded-xl border transition-colors ${
										session.id === currentSessionId
											? 'bg-primary/5 border-primary/30'
											: 'bg-secondary/50 border-border hover:border-primary/20'
									}`}
								>
									{session.id === currentSessionId && (
										<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
									)}

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
												{session.type === 'login' ? (
													<KeyRound className="h-4 w-4 text-muted-foreground" />
												) : (
													<Settings className="h-4 w-4 text-muted-foreground" />
												)}
											</div>
											<div>
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium text-foreground">
														{session.name?.slice(0, 16) || 'Unnamed Session'}
													</p>
													<code className="text-xs font-mono text-muted-foreground">
														{session.id.slice(0, 8)}
													</code>
													<button
														onClick={() => {
															navigator.clipboard.writeText(session.id);
															toast.success('Copied to clipboard');
														}}
														className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
														aria-label="Copy session ID"
													>
														<Copy className="h-3 w-3" />
													</button>
												</div>
												<div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
													<Clock className="h-3 w-3" />
													<span>
														{new Date(session.created_at).toLocaleDateString(undefined, {
															month: 'short',
															day: 'numeric',
															year: 'numeric'
														})}
													</span>
													<span className="px-1.5 py-0.5 rounded bg-secondary text-xs">
														{session.type}
													</span>
												</div>
											</div>
										</div>

										<button
											onClick={() => onRevoke(session.id)}
											className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
											aria-label="Revoke session"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>

			<div className="p-4 border-t border-border">
				<button
					onClick={() => toast.info('Refreshing sessions...')}
					className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
				>
					<RefreshCw className="h-4 w-4" />
					Refresh
				</button>
			</div>
		</motion.div>
	);
};

const CreateSessionForm: React.FC<{ onSessionCreated: () => void }> = ({ onSessionCreated }) => {
	const [sessionData, setSessionData] = useState<CreateUserSession>({
		name: '',
		type: 'api',
		expiry: 3600
	});
	const [createdToken, setCreatedToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		if (!sessionData.name || !sessionData.type || sessionData.expiry === null) {
			toast.error('Session data is incomplete');
			setIsLoading(false);
			return;
		}

		try {
			const newSession = await createSession(sessionData);
			toast.success('Session created successfully!');
			setCreatedToken(newSession.token);
			onSessionCreated();
			setSessionData({ name: '', type: 'api', expiry: 3600 });
		} catch (error) {
			toast.error('Failed to create session');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] as const }}
			className="bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col"
			role="form"
			aria-label="Create new session"
		>
			<div className="p-6 border-b border-border">
				<div className="flex items-center gap-4">
					<div
						className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground"
						aria-hidden="true"
					>
						<Plus className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-foreground">Create Session</h2>
						<p className="text-sm text-muted-foreground">Generate a new API token</p>
					</div>
				</div>
			</div>

			<form id="create-session-form" onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
				<div className="space-y-2">
					<label htmlFor="name" className="block text-sm font-medium text-foreground">
						Session Name
					</label>
					<input
						type="text"
						id="name"
						value={sessionData.name}
						onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
						className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
						placeholder="Enter a descriptive name"
						required
						disabled={isLoading}
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="type" className="block text-sm font-medium text-foreground">
						Session Type
					</label>
					<select
						id="type"
						value={sessionData.type}
						onChange={(e) => setSessionData({ ...sessionData, type: e.target.value as 'api' })}
						className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
						disabled={isLoading}
					>
						<option value="api">API Token</option>
					</select>
				</div>

				<div className="space-y-2">
					<label htmlFor="expiry" className="block text-sm font-medium text-foreground">
						Expiry (seconds)
					</label>
					<input
						type="number"
						id="expiry"
						value={sessionData.expiry}
						onChange={(e) =>
							setSessionData({ ...sessionData, expiry: Number.parseInt(e.target.value) })
						}
						min={3600}
						className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
						placeholder="Minimum 3600 seconds"
						disabled={isLoading}
					/>
					{sessionData.expiry >= 3600 && (
						<p className="text-xs text-muted-foreground mt-1">
							Token will expire in {Math.floor(sessionData.expiry / 86400)} days,{' '}
							{Math.floor((sessionData.expiry % 86400) / 3600)} hours
						</p>
					)}
				</div>

				{createdToken && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						className="p-4 bg-primary/5 border border-primary/20 rounded-xl"
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-medium text-foreground">Created Token</h3>
							<div className="flex items-center gap-1 text-xs text-primary">
								<Check className="h-3 w-3" />
								<span>Success</span>
							</div>
						</div>
						<div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
							<code className="text-xs font-mono flex-1 truncate text-muted-foreground">
								{createdToken}
							</code>
							<button
								onClick={() => {
									navigator.clipboard.writeText(createdToken);
									toast.success('Token copied to clipboard');
								}}
								className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
								aria-label="Copy token"
							>
								<Copy className="h-4 w-4" />
							</button>
						</div>
						<p className="text-xs text-muted-foreground mt-3">
							Copy this token now. You won&apos;t be able to see it again.
						</p>
					</motion.div>
				)}
			</form>

			<div className="p-4 border-t border-border">
				<button
					type="submit"
					form="create-session-form"
					className="w-full bg-foreground text-background py-3 rounded-xl transition-colors hover:bg-foreground/90 flex items-center justify-center gap-2 font-medium"
					disabled={isLoading}
					aria-busy={isLoading}
				>
					{isLoading ? (
						<>
							<RefreshCw className="h-4 w-4 animate-spin" />
							Creating...
						</>
					) : (
						<>
							<Plus className="h-4 w-4" />
							Create Session
						</>
					)}
				</button>
			</div>
		</motion.div>
	);
};

const Dashboard: React.FC = () => {
	const [sessions, setSessions] = useState<{
		loginSessions: UserSession[];
		apiSessions: UserSession[];
	}>({
		loginSessions: [],
		apiSessions: []
	});
	const [isLoading, setIsLoading] = useState(true);

	const fetchSessions = async () => {
		setIsLoading(true);
		try {
			const sessionData = await getUserSessions();
			setSessions({
				loginSessions:
					sessionData.sessions.filter((s): s is UserSession => s?.type === 'login') ?? [],
				apiSessions: sessionData.sessions.filter((s): s is UserSession => s?.type !== 'login') ?? []
			});
		} catch (error) {
			toast.error('Failed to fetch sessions');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSessions();
	}, []);

	const handleRevokeSession = async (sessionId: string) => {
		try {
			await revokeSession(sessionId);
			toast.success('Session revoked successfully!');
			fetchSessions();
		} catch (error) {
			toast.error('Failed to revoke session');
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }}
					className="mb-12"
				>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
						<div>
							<h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
								Sessions
							</h1>
							<p className="text-muted-foreground max-w-xl">
								Manage your active sessions and API tokens. Revoke suspicious activity or create new
								tokens.
							</p>
						</div>

						<button
							onClick={fetchSessions}
							className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground flex items-center gap-2 transition-colors text-sm font-medium"
						>
							<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
							Refresh
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-card rounded-xl p-5 border border-border">
							<div className="flex items-center gap-3 mb-3">
								<div
									className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
									aria-hidden="true"
								>
									<KeyRound className="h-4 w-4 text-muted-foreground" />
								</div>
								<span className="text-sm text-muted-foreground">Login Sessions</span>
							</div>
							<p className="text-2xl font-semibold text-foreground">
								{sessions.loginSessions.length}
							</p>
						</div>

						<div className="bg-card rounded-xl p-5 border border-border">
							<div className="flex items-center gap-3 mb-3">
								<div
									className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
									aria-hidden="true"
								>
									<Settings className="h-4 w-4 text-muted-foreground" />
								</div>
								<span className="text-sm text-muted-foreground">API Tokens</span>
							</div>
							<p className="text-2xl font-semibold text-foreground">
								{sessions.apiSessions.length}
							</p>
						</div>

						<div className="bg-card rounded-xl p-5 border border-border">
							<div className="flex items-center gap-3 mb-3">
								<div
									className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
									aria-hidden="true"
								>
									<Clock className="h-4 w-4 text-muted-foreground" />
								</div>
								<span className="text-sm text-muted-foreground">Last Updated</span>
							</div>
							<p className="text-foreground font-medium">
								{isLoading ? 'Loading...' : new Date().toLocaleTimeString()}
							</p>
						</div>
					</div>
				</motion.div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					<SessionCard
						title="Login Sessions"
						description="Active browser sessions"
						icon={<KeyRound className="h-5 w-5" />}
						sessions={sessions.loginSessions}
						onRevoke={handleRevokeSession}
					/>

					<CreateSessionForm onSessionCreated={fetchSessions} />

					<SessionCard
						title="API Tokens"
						description="API access tokens"
						icon={<Settings className="h-5 w-5" />}
						sessions={sessions.apiSessions}
						onRevoke={handleRevokeSession}
					/>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
