'use client';

import { Shield, Code } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baseGuildUserInfo, dispatchWebSettings } from '@/lib/api';
import {
	dispatchResultToSetting,
	toDispatchResults,
	type Event,
	type Page
} from '@/lib/settings/events.parse';
import type { EncodableKhronosValue } from '@/lib/msyscall/khronosvalue';
import type { BaseGuildUserInfo } from '@/lib/msyscall/types/discord';
import { getIconUrl } from '@/lib/auth/getIconUrl';
import { SettingsContext, type Choice, type SettingsContextValue } from './sv2/context';
import { SV2 } from './sv2/SV2';
import { SettingsErrorDisplay } from './components/ErrorDisplay';

/**
 * Renders the settings-v2 dashboard for a guild.
 *
 * Fetches the guild's base info (for role/channel choices and header chrome) and
 * the settings pages via the `WebSettings` `fetch_page` event, then renders each
 * template's component tree with {@link SV2} inside a {@link SettingsContext}.
 */
export default function Settings({ guildId }: { guildId: string }) {
	const [guildData, setGuildData] = useState<BaseGuildUserInfo | null>(null);
	const [settings, setSettings] = useState<Record<string, Page>>({});
	const [settingsErr, setSettingsErr] = useState<[string, string][]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const roleChoices = useMemo<Choice[]>(
		() => (guildData ? guildData.roles.map((r) => ({ label: r.name, value: r.id })) : []),
		[guildData]
	);
	const channelChoices = useMemo<Choice[]>(
		() =>
			guildData
				? guildData.channels
						// type 4 = GUILD_CATEGORY
						.filter((c) => c.channel.type !== 4)
						.map((c) => ({ label: c.channel.name, value: c.channel.id }))
				: [],
		[guildData]
	);

	const fetchSettings = useCallback(async () => {
		const raw = await dispatchWebSettings(guildId, { type: 'fetch_page' } as Event);
		const ders = toDispatchResults(raw);
		const next: Record<string, Page> = {};
		const errs: [string, string][] = [];
		for (const der of ders) {
			if (der.type === 'err') {
				errs.push([der.id, der.value != null ? String(der.value) : 'Unknown error']);
			} else {
				try {
					next[der.id] = dispatchResultToSetting(der.value);
				} catch (e) {
					errs.push([der.id, e instanceof Error ? e.message : String(e)]);
				}
			}
		}
		setSettings(next);
		setSettingsErr(errs);
	}, [guildId]);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await baseGuildUserInfo(guildId);
				if (cancelled) return;
				setGuildData(data);
				await fetchSettings();
			} catch (e) {
				if (cancelled) return;
				const message =
					e instanceof Error ? e.message : 'Failed to fetch guild data. Please try again later.';
				setError(message);
				toast.error(message, { position: 'top-left' });
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [guildId, fetchSettings]);

	const setFieldValue = useCallback<SettingsContextValue['setFieldValue']>(
		(template, formsetId, formIdx, fieldId, value) => {
			setSettings((prev) => {
				const page = prev[template];
				if (!page) return prev;
				const forms = page.formdata[formsetId];
				if (!forms) return prev;
				const newForms = forms.map((f, i) =>
					i === formIdx ? { ...f, data: { ...f.data, [fieldId]: value } } : f
				);
				return {
					...prev,
					[template]: { ...page, formdata: { ...page.formdata, [formsetId]: newForms } }
				};
			});
		},
		[]
	);

	const dispatchEvent = useCallback(
		(event: Event) => dispatchWebSettings(guildId, event as unknown as EncodableKhronosValue),
		[guildId]
	);

	const ctx = useMemo<SettingsContextValue>(
		() => ({
			guildId,
			roleChoices,
			channelChoices,
			settings,
			setFieldValue,
			dispatchEvent,
			refetch: fetchSettings
		}),
		[guildId, roleChoices, channelChoices, settings, setFieldValue, dispatchEvent, fetchSettings]
	);

	if (loading) {
		return (
			<div
				className="min-h-screen bg-background flex items-center justify-center"
				role="status"
				aria-live="polite"
				aria-label="Loading settings"
			>
				<div className="text-center flex flex-col items-center">
					<div
						className="w-8 h-8 border-2 border-border border-t-foreground rounded-full mb-4 animate-spin"
						aria-hidden="true"
					/>
					<p className="text-sm text-muted-foreground">Loading settings...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className="min-h-screen bg-background flex items-center justify-center p-6"
				role="alert"
				aria-live="assertive"
			>
				<div className="bg-card p-8 rounded-2xl border border-border max-w-md w-full text-center">
					<div
						className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto mb-6"
						aria-hidden="true"
					>
						<Shield size={24} />
					</div>
					<h3 className="text-xl font-semibold text-foreground mb-3">Connection Error</h3>
					<p className="text-muted-foreground mb-6 text-sm">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="w-full bg-foreground text-background font-medium px-6 py-3 rounded-xl hover:bg-foreground/90 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	const hasSettings = Object.keys(settings).length > 0;

	return (
		<div className="min-h-screen bg-background text-foreground pb-24">
			<ToastContainer theme="dark" />

			{/* Sub-Header */}
			<header
				className="sticky top-16 z-40 bg-background/80 backdrop-blur-sm border-b border-border"
				role="banner"
			>
				<div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						{guildData?.icon ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={getIconUrl(guildId, guildData.icon)}
								alt={`${guildData.name} server icon`}
								className="w-10 h-10 rounded-xl border border-border object-cover"
							/>
						) : (
							<div
								className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-medium"
								aria-hidden="true"
							>
								{guildData?.name.charAt(0) ?? '?'}
							</div>
						)}
						<div>
							<span className="text-base font-medium tracking-tight block">{guildData?.name}</span>
							<p className="text-xs text-muted-foreground">Server Settings</p>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-5xl mx-auto px-6 mt-12" role="main">
				{/* Header Section */}
				<div className="mb-12 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
					<h1 className="text-3xl font-semibold tracking-tight mb-3">Settings</h1>
					<p className="text-muted-foreground max-w-xl">
						Configure how your server interacts with AntiRaid. Customize roles, detection levels, and
						automated responses.
					</p>

					<div className="mt-8 p-5 bg-secondary/50 rounded-xl border border-border flex items-center gap-4">
						<div
							className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-muted-foreground shrink-0"
							aria-hidden="true"
						>
							<Code size={18} />
						</div>
						<p className="text-sm text-muted-foreground">
							Check out <span className="text-foreground font-medium">Templating</span> for advanced
							custom logic and script extensions.
						</p>
					</div>
				</div>

				<SettingsContext.Provider value={ctx}>
					{settingsErr.length > 0 && (
						<SettingsErrorDisplay
							loadErrors={Object.fromEntries(settingsErr)}
							onRetry={() => fetchSettings()}
						/>
					)}

					<div className="space-y-8">
						{Object.entries(settings).map(([template, page]) => (
							<div key={template}>
								<div className="mb-6 pt-6 border-t border-border">
									<h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
										Template: {template}
									</h2>
								</div>
								<SV2 template={template} comps={page.components} />
							</div>
						))}

						{!hasSettings && settingsErr.length === 0 && (
							<p className="text-sm text-muted-foreground">No settings available for this server.</p>
						)}
					</div>
				</SettingsContext.Provider>
			</main>
		</div>
	);
}
