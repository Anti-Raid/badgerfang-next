'use client';

import type React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	KeyRound,
	Trash2,
	Plus,
	Settings,
	Copy,
	Shield,
	Clock,
	AlertCircle,
	RefreshCw,
	Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userSessionsOptions, revokeSession, createSession } from '@/lib/api';
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
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className={`bg-card dark:bg-card/95 backdrop-blur-md rounded-3xl shadow-lg border border-border/40 overflow-hidden h-full flex flex-col ${className}`}
		>
			<div className="p-6 border-b border-border/30">
				<div className="flex items-center gap-4 mb-3">
					<div className="p-3 bg-primary/10 text-primary rounded-xl">{icon}</div>
					<div>
						<h2 className="text-2xl font-bold text-foreground">{title}</h2>
						<p className="text-muted-foreground">{description}</p>
					</div>
				</div>
			</div>

			<div className="flex-1 p-5 overflow-hidden">
				{sessions.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full py-10 px-4">
						<div className="p-4 bg-muted rounded-full mb-4">
							<AlertCircle className="h-8 w-8 text-muted-foreground/70" />
						</div>
						<p className="text-muted-foreground text-center">No active sessions found</p>
					</div>
				) : (
					<div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
						<AnimatePresence>
							{sessions.map((session) => (
								<motion.div
									key={session.id}
									initial={{ opacity: 0, x: -5 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 5 }}
									className={`group relative p-4 rounded-xl border border-border/30 transition-all hover:border-primary/20 hover:shadow-md ${
										session.id === currentSessionId
											? 'bg-primary/5 border-primary/30'
											: 'bg-card dark:bg-card/60'
									}`}
								>
									{session.id === currentSessionId && (
										<div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-12 bg-primary rounded-r-full" />
									)}

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-muted rounded-lg">
												{session.type === 'login' ? (
													<KeyRound className="h-5 w-5 text-primary" />
												) : (
													<Settings className="h-5 w-5 text-primary" />
												)}
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<p className="text-sm font-semibold text-foreground">
														{session.name?.slice(0, 12) || 'Unnamed Session'}
													</p>
													<code className="text-xs font-mono bg-muted px-2 py-1 rounded-md">
														{session.id.slice(0, 10)}...
													</code>
													<button
														onClick={() => {
															navigator.clipboard.writeText(session.id);
															toast.success('Copied to clipboard');
														}}
														className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-muted rounded-md"
														aria-label="Copy session ID"
													>
														<Copy className="h-3.5 w-3.5" />
													</button>
												</div>
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<span className="inline-flex items-center gap-1">
														<Clock className="h-3 w-3" />
														{new Date(session.created_at).toLocaleDateString(undefined, {
															month: 'short',
															day: 'numeric',
															year: 'numeric'
														})}
													</span>
													<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
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

			<div className="p-4 border-t border-border/30 bg-muted/20">
				<button
					onClick={() => toast.info('Refreshing sessions...')}
					className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
				>
					<RefreshCw className="h-4 w-4" />
					Refresh
				</button>
			</div>
		</motion.div>
	);
};

const CreateSessionForm: React.FC<{ onSessionCreated: () => void }> = ({ onSessionCreated }) => {
	const queryClient = useQueryClient();
	const [sessionData, setSessionData] = useState<CreateUserSession>({
		name: '',
		type: 'api',
		expiry: 3600
	});
	const [createdToken, setCreatedToken] = useState<string | null>(null);

	const createSessionMutation = useMutation({
		mutationFn: createSession,
		onSuccess: (newSession) => {
			toast.success('Session created successfully!');
			setCreatedToken(newSession.token);
			onSessionCreated();
			setSessionData({ name: '', type: 'api', expiry: 3600 });
			queryClient.invalidateQueries({ queryKey: ['userSessions'] });
		},
		onError: () => {
			toast.error('Failed to create session');
		}
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!sessionData.name || !sessionData.type || sessionData.expiry === null) {
			toast.error('Session data is incomplete');
			return;
		}

		createSessionMutation.mutate(sessionData);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.1 }}
			className="bg-card dark:bg-card/95 backdrop-blur-md rounded-3xl shadow-lg border border-border/40 overflow-hidden h-full flex flex-col"
		>
			<div className="p-6 border-b border-border/30">
				<div className="flex items-center gap-4 mb-3">
					<div className="p-3 bg-primary/10 text-primary rounded-xl">
						<Plus className="h-6 w-6" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-foreground">Create New Session</h2>
						<p className="text-muted-foreground">Generate a new API token</p>
					</div>
				</div>
			</div>

			<form id="create-session-form" onSubmit={handleSubmit} className="flex-1 p-5 space-y-5">
				<div className="space-y-2">
					<label htmlFor="name" className="block text-sm font-medium text-foreground">
						Session Name
					</label>
					<input
						type="text"
						id="name"
						value={sessionData.name}
						onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
						className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
						placeholder="Enter a descriptive name"
						required
						disabled={createSessionMutation.isPending}
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
						className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground"
						disabled={createSessionMutation.isPending}
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
						className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground"
						placeholder="Minimum 3600 seconds"
						disabled={createSessionMutation.isPending}
					/>
					<p className="text-xs text-muted-foreground mt-1">
						{sessionData.expiry >= 3600 && (
							<>
								Token will expire in {Math.floor(sessionData.expiry / 86400)} days,{' '}
								{Math.floor((sessionData.expiry % 86400) / 3600)} hours
							</>
						)}
					</p>
				</div>

				{createdToken && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						className="p-4 bg-primary/5 border border-primary/20 rounded-xl"
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-semibold text-foreground">Created Token</h3>
							<div className="flex items-center gap-1 text-xs text-primary">
								<Check className="h-3 w-3" />
								<span>Success</span>
							</div>
						</div>
						<div className="flex items-center gap-2 bg-background/80 p-2 rounded-lg">
							<code className="text-xs font-mono flex-1 truncate">{createdToken}</code>
							<button
								onClick={() => {
									navigator.clipboard.writeText(createdToken);
									toast.success('Token copied to clipboard');
								}}
								className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
								aria-label="Copy token"
							>
								<Copy className="h-4 w-4" />
							</button>
						</div>
						<p className="text-xs text-muted-foreground mt-3">
							Make sure to copy this token now. You won&apos;t be able to see it again!
						</p>
					</motion.div>
				)}
			</form>

			<div className="p-4 border-t border-border/30 bg-muted/20">
				<button
					type="submit"
					form="create-session-form"
					className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
					disabled={isLoading}
				>
					{createSessionMutation.isPending ? (
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
	const queryClient = useQueryClient();
	const { data: sessionData, isLoading, refetch } = useQuery(userSessionsOptions);

	const sessions = useMemo(() => {
		if (!sessionData) {
			return { loginSessions: [], apiSessions: [] };
		}
		return {
			loginSessions: sessionData.sessions.filter((s): s is UserSession => s?.type === 'login') ?? [],
			apiSessions: sessionData.sessions.filter((s): s is UserSession => s?.type !== 'login') ?? []
		};
	}, [sessionData]);

	const revokeSessionMutation = useMutation({
		mutationFn: revokeSession,
		onSuccess: () => {
			toast.success('Session revoked successfully!');
			queryClient.invalidateQueries({ queryKey: ['userSessions'] });
		},
		onError: () => {
			toast.error('Failed to revoke session');
		}
	});

	const handleRevokeSession = (sessionId: string) => {
		revokeSessionMutation.mutate(sessionId);
	};

	return (
		<div className="min-h-screen bg-background/50 dark:bg-background/90 backdrop-blur-xl">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-12"
				>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
						<div className="flex items-start gap-5">
							<div className="p-4 bg-primary/10 text-primary rounded-2xl">
								<Shield className="h-8 w-8" />
							</div>
							<div>
								<h1 className="text-4xl font-bold text-foreground mb-2">Sessions Management</h1>
								<p className="text-muted-foreground text-lg max-w-2xl">
									Manage your active sessions and API tokens securely. Revoke any suspicious
									activity or create new tokens for your applications.
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<button
								onClick={() => refetch()}
								className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2 transition-colors"
							>
								<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
								Refresh
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-border/30">
							<div className="p-3 bg-primary/10 text-primary rounded-xl">
								<KeyRound className="h-5 w-5" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Logged in Sessions</p>
								<p className="text-2xl font-bold text-foreground">
									{sessions.loginSessions.length}
								</p>
							</div>
						</div>

						<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-border/30">
							<div className="p-3 bg-primary/10 text-primary rounded-xl">
								<Settings className="h-5 w-5" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">API Tokens</p>
								<p className="text-2xl font-bold text-foreground">{sessions.apiSessions.length}</p>
							</div>
						</div>

						<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-border/30">
							<div className="p-3 bg-primary/10 text-primary rounded-xl">
								<Clock className="h-5 w-5" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Last Updated</p>
								<p className="text-foreground font-medium">
									{isLoading ? 'Loading...' : new Date().toLocaleTimeString()}
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
					<SessionCard
						title="Logged in Sessions"
						description="Active browser sessions"
						icon={<KeyRound className="h-6 w-6" />}
						sessions={sessions.loginSessions}
						onRevoke={handleRevokeSession}
					/>

					<CreateSessionForm onSessionCreated={fetchSessions} />

					<SessionCard
						title="API Tokens"
						description="Active API access tokens"
						icon={<Settings className="h-6 w-6" />}
						sessions={sessions.apiSessions}
						onRevoke={handleRevokeSession}
					/>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
