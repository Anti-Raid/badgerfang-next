'use client';

import { Shield, User, Code, Database, FileCode, Lock, Bell } from 'lucide-react';
import { Section } from './components/section';
import { Fragment, useEffect, useState } from 'react';
import { baseGuildUserInfo, executeSettings, getSettings } from '@/lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
	const [guildData, setGuildData] = useState<any>(null);
	const [guildSettings, setGuildSettings] = useState<{
		[key: string]: ApiDispatchResult<any>;
	} | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await baseGuildUserInfo(guildId);
				let settings = await getSettings(guildId);

				const builtins = settings['$builtins'];
				if (builtins) {
					delete settings['$builtins'];
					settings = {
						$builtins: builtins,
						...settings
					};
				}

				setGuildData(data);
				setGuildSettings(settings);
			} catch (error) {
				if (isAxiosError(error)) {
					const errorMessage =
						error.response?.data?.message || 'Failed to fetch guild data. Please try again later.';
					setError(errorMessage);
					toast.error(errorMessage, { position: 'top-left' });
				} else {
					setError(`An unexpected error occurred. Please try again later: ${error}`);
					toast.error('An unexpected error occurred. Please try again later.', {
						position: 'top-left'
					});
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [guildId]);

	function isAxiosError(error: any): error is { response?: { data?: { message?: string } } } {
		return error && error.response;
	}

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
						{guildData.icon ? (
							<img
								src={guildData.icon || '/logo.webp'}
								alt={`${guildData.name} server icon`}
								className="w-10 h-10 rounded-xl border border-border object-cover"
							/>
						) : (
							<div
								className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-medium"
								aria-hidden="true"
							>
								{guildData.name.charAt(0)}
							</div>
						)}
						<div>
							<span className="text-base font-medium tracking-tight block">{guildData.name}</span>
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
						Configure how your server interacts with AntiRaid. Customize roles, detection levels,
						and automated responses.
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

				<div className="space-y-8">
					{guildSettings && guildData && (
						<>
							{Object.keys(guildSettings)
								.filter((s) => guildSettings[s].type !== 'Ok')
								.map((setting, idx) => (
									<SettingsErrorDisplay
										key={idx}
										loadErrors={{ [setting]: guildSettings[setting].data }}
									/>
								))}

							{Object.keys(guildSettings)
								.filter((s) => guildSettings[s].type === 'Ok')
								.map((s) => ({ s, setting: guildSettings[s].data as Setting[] }))
								.map((setting) => (
									<Fragment key={setting.s}>
										{setting.s !== '$builtins' && (
											<div className="mb-6 pt-6 border-t border-border">
												<h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
													Template: {setting.s}
												</h2>
											</div>
										)}

										<div className="grid grid-cols-1 gap-4">
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
			</main>
		</div>
	);
}
