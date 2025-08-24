'use client';

import { Shield, User, Code, Database, FileCode, Lock, Bell } from 'lucide-react';
import { Section } from './components/section';
import { Fragment, useEffect, useState } from 'react';
import { baseGuildUserInfo, executeSettings, getSettings } from '@/lib/api';
import { motion } from 'framer-motion';
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

				// Ensure builtin settings are the first thing in the object
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

	/**
	 * Determines whether the provided error object is likely an Axios error.
	 *
	 * This type guard checks if the error is non-null and contains a response property,
	 * which is characteristic of errors produced by Axios HTTP requests.
	 *
	 * @param error - The error object to evaluate.
	 * @returns True if the error object has a response property; otherwise, false.
	 */
	function isAxiosError(error: any): error is { response?: { data?: { message?: string } } } {
		return error && error.response;
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-foreground">Loading guild data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="bg-card p-6 rounded-xl border border-destructive max-w-md w-full">
					<div className="text-destructive mb-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
					</div>
					<h3 className="text-lg font-bold mb-2">Error</h3>
					<p className="text-muted-foreground">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<ToastContainer theme="dark" />
			<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						{guildData.icon ? (
							<img
								src={guildData.icon || '/logo.webp'}
								alt={guildData.name}
								className="w-10 h-10 rounded-full border-2 border-primary/20"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
								{guildData.name.charAt(0)}
							</div>
						)}
						<h1 className="text-xl font-bold">{guildData.name}</h1>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-10"
				>
					<h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-extra bg-clip-text text-transparent">
						Welcome to your Dashboard
					</h1>
					<p className="text-muted-foreground text-lg">
						Control all aspects of AntiRaid and its operation on your server
					</p>

					<div className="mt-6 p-5 bg-accent rounded-xl border-2 border-primary/20 relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-extra/5 opacity-50"></div>
						<div className="relative z-10">
							<h3 className="text-lg font-bold mb-2 flex items-center gap-2">
								<Code className="w-5 h-5 text-primary" />
								Pro Tip
							</h3>
							<p className="text-foreground">
								Want something beyond the core commands? Check out{' '}
								<span className="text-primary font-semibold">Templating</span>, the official way to
								extend AntiRaid to meet your needs!
							</p>
						</div>
					</div>
				</motion.div>

				<div className="space-y-8">
					{guildSettings && guildData && (
						<>
							{Object.keys(guildSettings)
								.filter((s) => guildSettings[s].type !== 'Ok')
								.map((setting, idx) => {
									return (
										<SettingsErrorDisplay
											key={idx}
											loadErrors={{ [setting]: guildSettings[setting].data }}
										/>
									);
								})}

							{Object.keys(guildSettings)
								.filter((s) => guildSettings[s].type === 'Ok')
								.map((s) => {
									return { s, setting: guildSettings[s].data as Setting[] };
								})
								.map((setting, _idx) => {
									console.log(`Rendering setting`, setting);
									return (
										<Fragment key={setting.s}>
											{setting.s !== '$builtins' && (
												<>
													<h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-extra bg-clip-text text-transparent">
														Template {setting.s}
													</h2>
													<p className="text-muted-foreground mb-6">
														Manage settings from template {setting.s} here.
													</p>
												</>
											)}
											{setting.setting.map((setting, idx) => (
												<Section
													key={idx}
													title={setting.name}
													description={setting.description}
													icon={
														setting.icon == 'Bell' ? (
															<Bell />
														) : setting.icon == 'Shield' ? (
															<Shield />
														) : setting.icon == 'User' ? (
															<User />
														) : setting.icon == 'Code' ? (
															<Code />
														) : setting.icon == 'Database' ? (
															<Database />
														) : setting.icon == 'FileCode' ? (
															<FileCode />
														) : setting.icon == 'Lock' ? (
															<Lock />
														) : (
															<Shield />
														)
													}
													defaultOpen={idx == 0} // Open the first section by default
												>
													<SettingComponent
														guildId={guildId}
														setting={setting}
														guildData={guildData}
														fetcher={fetcher}
													/>
												</Section>
											))}
										</Fragment>
									);
								})}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
