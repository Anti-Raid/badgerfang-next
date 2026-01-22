'use client';

import {
	Shield,
	User,
	Code,
	Database,
	FileCode,
	Lock,
	Bell,
	LayoutDashboard,
	Zap
} from 'lucide-react';
import { Section } from './components/section';
import { Fragment, useMemo, useEffect } from 'react';
import { baseGuildUserInfoOptions, executeSettings, settingsOptions } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from '@/components/ui/motion';
import { toast } from 'sonner';
import { noOpFetcher, SettingComponent, SettingDataFetcher } from './components/setting';
import { SettingsErrorDisplay } from './components/ErrorDisplay';
import { ApiDispatchResult } from '@/types/api/bindings/ApiDispatchResult';
import { Setting } from '@/types/api/bindings/Setting';

/**
 * Renders a dashboard for managing guild settings.
 *
 * This component fetches the guild's base information using the provided guild ID and displays a settings dashboard.
 * While fetching data, it shows a loading indicator. If an error occurs, an error message is displayed with a retry option,
 * and a toast notification is triggered. Once the data is loaded, it renders a sticky header with the guild's icon and name,
 * along with various sections for managing server roles, members, scripts, key-value data, published scripts, and lockdown settings.
 *
 * @param guildId - Unique identifier of the guild.
 * @returns A JSX element representing the settings dashboard.
 */
export default function Settings({ guildId }: { guildId: string }) {
	const {
		data: guildData,
		isLoading: isLoadingGuildData,
		error: guildDataError
	} = useQuery(baseGuildUserInfoOptions(guildId));

	const {
		data: rawSettings,
		isLoading: isLoadingSettings,
		error: settingsError
	} = useQuery(settingsOptions(guildId));

	// Process settings to move $builtins to the front
	const guildSettings = useMemo(() => {
		if (!rawSettings) return null;

		const builtins = rawSettings['$builtins'];
		if (builtins) {
			const { $builtins, ...rest } = rawSettings;
			return {
				$builtins: builtins,
				...rest
			};
		}
		return rawSettings;
	}, [rawSettings]);

	const loading = isLoadingGuildData || isLoadingSettings;
	const error = guildDataError || settingsError;

	// Show toast on error
	useEffect(() => {
		if (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch guild data. Please try again later.';
			toast.error(errorMessage);
		}
	}, [error]);

	const fetcher: SettingDataFetcher = {
		...noOpFetcher,
		listEntries: async (setting: Setting) => {
			const payload = {
				operation: 'View',
				setting: setting.id,
				fields: {}
			};
			const result = await executeSettings(guildId, payload);
			return result as { [templateName: string]: ApiDispatchResult<any> };
		},
		createEntry: async (setting: Setting, entry: any) => {
			const payload = {
				operation: 'Create',
				setting: setting.id,
				fields: entry
			};
			const result = await executeSettings(guildId, payload);
			return result as { [templateName: string]: ApiDispatchResult<any> };
		},
		updateEntry: async (setting: Setting, entry: any) => {
			const payload = {
				operation: 'Update',
				setting: setting.id,
				fields: entry
			};
			const result = await executeSettings(guildId, payload);
			return result as { [templateName: string]: ApiDispatchResult<any> };
		},
		deleteEntry: async (setting: Setting, entry: any) => {
			const payload = {
				operation: 'Delete',
				setting: setting.id,
				fields: entry
			};
			const result = await executeSettings(guildId, payload);
			return result as { [templateName: string]: ApiDispatchResult<any> };
		},
		reorderEntries: async (setting: Setting, entries: any[]) => {
			const payload = {
				operation: 'Reorder',
				setting: setting.id,
				fields: entries
			};
			const result = await executeSettings(guildId, payload);
			return result as { [templateName: string]: ApiDispatchResult<any> };
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
				<div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
				<div className="text-center relative z-10 flex flex-col items-center">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
						className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full mb-6"
					/>
					<p className="text-sm font-bold text-foreground/40 tracking-widest uppercase">
						Loading Settings
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Failed to fetch guild data. Please try again later.';

		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-6">
				<div className="bg-card p-8 rounded-3xl border border-destructive/20 max-w-md w-full text-center shadow-2xl">
					<div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto mb-6">
						<Shield size={32} />
					</div>
					<h3 className="text-2xl font-bold text-foreground mb-4">Connection Error</h3>
					<p className="text-foreground/60 mb-8 leading-relaxed">{errorMessage}</p>
					<button
						onClick={() => window.location.reload()}
						className="w-full bg-primary text-primary-foreground font-bold px-6 py-4 rounded-xl hover:opacity-90 transition-all active:scale-98 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (!guildData || !guildSettings) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background text-foreground font-inter selection:bg-primary/30 selection:text-primary relative overflow-hidden pb-40">
			{/* Subtle Background elements */}
			<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />


			{/* Sub-Header */}
			<div className="sticky top-16 z-40 bg-background/60 backdrop-blur-xl border-b border-border/50">
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						{guildData.icon ? (
							<img
								src={guildData.icon || '/logo.webp'}
								alt={guildData.name}
								className="w-10 h-10 rounded-xl border border-border shadow-sm object-cover"
							/>
						) : (
							<div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
								{guildData.name.charAt(0)}
							</div>
						)}
						<div>
							<span className="text-base font-bold tracking-tight block">{guildData.name}</span>
							<p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
								Dashboard Settings
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 mt-16">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-16"
				>
					<h1 className="text-4xl font-bold tracking-tight mb-4">Settings</h1>
					<p className="text-lg text-muted-foreground max-w-2xl">
						Configure and manage how your server interacts with AntiRaid. Customize roles, detection
						levels, and automated responses.
					</p>

					<div className="mt-8 p-6 bg-accent/30 rounded-2xl border border-border/50 flex items-center gap-4">
						<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
							<Code size={18} />
						</div>
						<p className="text-sm font-medium leading-relaxed">
							Check out <span className="text-primary font-bold">Templating</span> for advanced
							custom logic and script extensions.
						</p>
					</div>
				</motion.div>

				<div className="space-y-12">
					{guildSettings && guildData && (
						<>
							{Object.keys(guildSettings)
								.filter((s) => guildSettings[s].type !== 'Ok')
								.map((setting, idx) => {
									const errorData = guildSettings[setting].data;
									const errorMessage =
										typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
									return (
										<SettingsErrorDisplay key={idx} loadErrors={{ [setting]: errorMessage }} />
									);
								})}

							{Object.keys(guildSettings)
								.filter((s) => guildSettings[s].type === 'Ok')
								.map((s) => ({ s, setting: guildSettings[s].data as Setting[] }))
								.map((setting) => (
									<Fragment key={setting.s}>
										{setting.s !== '$builtins' && (
											<div className="mb-8 pt-8 border-t border-border/50">
												<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
													Template: {setting.s}
												</h2>
											</div>
										)}

										<div className="grid grid-cols-1 gap-6">
											{setting.setting.map((s_item, idx) => (
												<Section
													key={idx}
													title={s_item.name}
													description={s_item.description}
													icon={
														s_item.icon == 'Bell' ? (
															<Bell />
														) : s_item.icon == 'Shield' ? (
															<Shield />
														) : s_item.icon == 'User' ? (
															<User />
														) : s_item.icon == 'Code' ? (
															<Code />
														) : s_item.icon == 'Database' ? (
															<Database />
														) : s_item.icon == 'FileCode' ? (
															<FileCode />
														) : s_item.icon == 'Lock' ? (
															<Lock />
														) : (
															<Shield />
														)
													}
													defaultOpen={idx === 0 && setting.s === '$builtins'}
												>
													<SettingComponent
														guildId={guildId}
														setting={s_item}
														guildData={guildData}
														fetcher={fetcher}
													/>
												</Section>
											))}
										</div>
									</Fragment>
								))}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
