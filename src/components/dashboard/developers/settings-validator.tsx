'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBotState } from '@/lib/api';
import {
	AlertCircle,
	CheckCircle,
	RefreshCw,
	ChevronDown,
	ChevronRight,
	Search,
	XCircle,
	Info,
	AlertTriangle,
	Download,
	FileJson,
	Clock,
	Settings,
	Database
} from 'lucide-react';

export default function SettingsVerificationPage() {
	const [botState, setBotState] = useState<any>(null);
	const [settingsSchema, setSettingsSchema] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [expandedSettings, setExpandedSettings] = useState<string[]>([]);
	const [expandedColumns, setExpandedColumns] = useState<{ [key: string]: boolean }>({});
	const [comparisonResults, setComparisonResults] = useState<any>(null);
	const [activeTab, setActiveTab] = useState<string>('settings');

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const [botStateData, schemaData] = await Promise.all([getBotState(), getBotState()]);

			setBotState(botStateData);
			setSettingsSchema(schemaData);

			// Compare the data
			const results = compareData(botStateData, schemaData);
			setComparisonResults(results);
		} catch (error) {
			console.error('Error fetching data:', error);
			setError('Failed to fetch data. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const compareData = (botState: any, schema: any) => {
		if (!botState || !schema) return null;

		const results = {
			settings: {
				missing: [] as string[],
				different: [] as { id: string; differences: string[] }[],
				matching: [] as string[]
			}
		};

		// Compare settings
		const botSettings = botState.settings || [];
		const schemaSettings = schema.settings || [];

		const botSettingsMap = new Map(botSettings.map((s: any) => [s.id, s]));
		const schemaSettingsMap = new Map(schemaSettings.map((s: any) => [s.id, s]));

		// Find missing settings
		schemaSettingsMap.forEach((schemaSetting, id) => {
			if (!botSettingsMap.has(id)) {
				results.settings.missing.push(String(id));
			}
		});

		// Find different and matching settings
		botSettingsMap.forEach((botSetting, id) => {
			if (!schemaSettingsMap.has(id)) {
				// This is an extra setting in the bot state, not in the schema
				return;
			}

			const schemaSetting = schemaSettingsMap.get(id);
			const differences = compareSettings(botSetting, schemaSetting);

			if (differences.length > 0) {
				results.settings.different.push({
					id: String(id),
					differences
				});
			} else {
				results.settings.matching.push(String(id));
			}
		});

		return results;
	};

	const compareSettings = (botSetting: any, schemaSetting: any) => {
		const differences: string[] = [];

		// Compare basic properties
		['name', 'description', 'primary_key', 'title_template'].forEach((prop) => {
			if (botSetting[prop] !== schemaSetting[prop]) {
				differences.push(`Property '${prop}' differs`);
			}
		});

		// Compare operations
		if (!arraysEqual(botSetting.operations, schemaSetting.operations)) {
			differences.push('Operations differ');
		}

		// Compare columns
		const botColumns = botSetting.columns || [];
		const schemaColumns = schemaSetting.columns || [];

		if (botColumns.length !== schemaColumns.length) {
			differences.push(`Column count differs: ${botColumns.length} vs ${schemaColumns.length}`);
		}

		const botColumnsMap = new Map(botColumns.map((c: any) => [c.id, c]));
		const schemaColumnsMap = new Map(schemaColumns.map((c: any) => [c.id, c]));

		schemaColumnsMap.forEach((schemaColumn, id) => {
			if (!botColumnsMap.has(id)) {
				differences.push(`Missing column: ${id}`);
			}
		});

		botColumnsMap.forEach((botColumnValue, id) => {
			if (!schemaColumnsMap.has(id)) {
				differences.push(`Extra column: ${id}`);
				return;
			}

			const botColumn = botColumnValue as Record<string, any>;
			const schemaColumn = schemaColumnsMap.get(id) as Record<string, any>;

			// Compare column properties
			['name', 'description', 'nullable', 'secret'].forEach((prop) => {
				if (botColumn[prop] !== schemaColumn[prop]) {
					differences.push(`Column '${id}' property '${prop}' differs`);
				}
			});

			// Compare column_type (simplified)
			if (JSON.stringify(botColumn.column_type) !== JSON.stringify(schemaColumn.column_type)) {
				differences.push(`Column '${id}' type differs`);
			}

			// Compare ignored_for
			if (!arraysEqual(botColumn.ignored_for, schemaColumn.ignored_for)) {
				differences.push(`Column '${id}' ignored_for differs`);
			}
		});

		return differences;
	};

	const arraysEqual = (a: any[], b: any[]) => {
		if (!a || !b) return false;
		if (a.length !== b.length) return false;
		const sortedA = [...a].sort();
		const sortedB = [...b].sort();
		return sortedA.every((val, idx) => val === sortedB[idx]);
	};

	const toggleSettingExpansion = (id: string) => {
		setExpandedSettings((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const toggleColumnExpansion = (settingId: string) => {
		setExpandedColumns((prev) => ({
			...prev,
			[settingId]: !prev[settingId]
		}));
	};

	const filteredSettings =
		settingsSchema?.settings?.filter(
			(setting: any) =>
				setting.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				setting.description.toLowerCase().includes(searchTerm.toLowerCase())
		) || [];

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'missing':
				return 'text-red-500 bg-red-500/10';
			case 'different':
				return 'text-amber-500 bg-amber-500/10';
			case 'matching':
				return 'text-green-500 bg-green-500/10';
			default:
				return 'text-gray-500 bg-gray-500/10';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'missing':
				return <XCircle className="w-4 h-4 text-red-500" />;
			case 'different':
				return <AlertTriangle className="w-4 h-4 text-amber-500" />;
			case 'matching':
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			default:
				return <Info className="w-4 h-4 text-gray-500" />;
		}
	};

	const downloadComparisonResults = () => {
		const dataStr = JSON.stringify(comparisonResults, null, 2);
		const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

		const link = document.createElement('a');
		link.setAttribute('href', dataUri);
		link.setAttribute('download', 'settings-verification-results.json');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
				<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
				<h2 className="text-xl font-semibold text-foreground">Loading Settings Data...</h2>
				<p className="text-muted-foreground mt-2">
					Please wait while we fetch and analyze the settings
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
				<div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md w-full">
					<div className="flex items-center mb-4">
						<AlertCircle className="w-8 h-8 text-destructive mr-3" />
						<h2 className="text-xl font-semibold text-foreground">Error Loading Data</h2>
					</div>
					<p className="text-muted-foreground mb-4">{error}</p>
					<button
						onClick={fetchData}
						className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
					>
						<RefreshCw className="w-4 h-4 mr-2" />
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-12"
				>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
						<div className="flex items-start gap-5">
							<div className="p-4 bg-primary/10 text-primary rounded-2xl">
								<Settings className="h-8 w-8" />
							</div>
							<div>
								<h1 className="text-4xl font-bold text-foreground mb-2">Settings Verification</h1>
								<p className="text-muted-foreground text-lg max-w-2xl">
									Compare current settings schema with the one on Bot State on AntiRaid.
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<button
								onClick={fetchData}
								className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2 transition-colors"
							>
								<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
								Refresh
							</button>
							<button
								onClick={downloadComparisonResults}
								className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2 transition-colors"
							>
								<Download className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
								Export Results
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-border/30">
							<div className="p-3 bg-primary/10 text-primary rounded-xl">
								<CheckCircle className="h-5 w-5" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Matching Settings</p>
								<p className="text-2xl font-bold text-foreground">
									{comparisonResults?.settings?.matching?.length || 0}
								</p>
							</div>
						</div>

						<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-border/30">
							<div className="p-3 bg-primary/10 text-primary rounded-xl">
								<AlertTriangle className="h-5 w-5" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Different Settings</p>
								<p className="text-2xl font-bold text-foreground">
									{comparisonResults?.settings?.different?.length || 0}
								</p>
							</div>
						</div>

						<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-border/30">
							<div className="p-3 bg-primary/10 text-primary rounded-xl">
								<XCircle className="h-5 w-5" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Missing Settings</p>
								<p className="text-2xl font-bold text-foreground">
									{comparisonResults?.settings?.missing?.length || 0}
								</p>
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

				<div className="bg-card border-2 border-border rounded-lg overflow-hidden mb-8">
					<div className="p-4">
						<div>
							{comparisonResults?.settings?.missing?.length > 0 && (
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-3 flex items-center">
										<XCircle className="w-5 h-5 text-red-500 mr-2" />
										Missing Settings
									</h3>
									<div className="bg-red-500/5 border-2 border-red-500/20 rounded-lg p-4">
										<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
											{comparisonResults.settings.missing.map((id: string) => (
												<li key={id} className="flex items-center">
													<span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-sm font-mono mr-2">
														{id}
													</span>
													<span className="text-muted-foreground text-sm">
														{settingsSchema?.settings?.find((s: any) => s.id === id)?.name ||
															'Unknown'}
													</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							)}

							{comparisonResults?.settings?.different?.length > 0 && (
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-3 flex items-center">
										<AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
										Different Settings
									</h3>
									<div className="space-y-3">
										{comparisonResults.settings.different.map((item: any) => (
											<div
												key={item.id}
												className="bg-amber-500/5 border-2 border-amber-500/20 rounded-lg p-4"
											>
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-medium flex items-center">
														<span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md text-sm font-mono mr-2">
															{item.id}
														</span>
														<span className="text-foreground">
															{settingsSchema?.settings?.find((s: any) => s.id === item.id)?.name ||
																'Unknown'}
														</span>
													</h4>
													<button
														onClick={() => toggleSettingExpansion(item.id)}
														className="p-1 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
													>
														{expandedSettings.includes(item.id) ? (
															<ChevronDown className="w-5 h-5" />
														) : (
															<ChevronRight className="w-5 h-5" />
														)}
													</button>
												</div>

												<AnimatePresence>
													{expandedSettings.includes(item.id) && (
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: 'auto' }}
															exit={{ opacity: 0, height: 0 }}
															transition={{ duration: 0.2 }}
															className="mt-2"
														>
															<ul className="space-y-1 text-sm">
																{item.differences.map((diff: string, idx: number) => (
																	<li key={idx} className="text-amber-600">
																		• {diff}
																	</li>
																))}
															</ul>
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										))}
									</div>
								</div>
							)}

							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-3 flex items-center">
									<Database className="w-5 h-5 text-primary mr-2" />
									All Settings
								</h3>
								<div className="bg-card border-2 border-border rounded-lg overflow-hidden">
									<div className="max-h-128 overflow-y-auto">
										<table className="w-full">
											<thead>
												<tr className="bg-muted/50">
													<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
														ID
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
														Name
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
														Status
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-border">
												{filteredSettings.map((setting: any) => {
													let status = 'unknown';
													if (comparisonResults?.settings?.missing?.includes(setting.id)) {
														status = 'missing';
													} else if (
														comparisonResults?.settings?.different?.find(
															(s: any) => s.id === setting.id
														)
													) {
														status = 'different';
													} else if (comparisonResults?.settings?.matching?.includes(setting.id)) {
														status = 'matching';
													}

													return (
														<tr key={setting.id} className="hover:bg-muted/30 transition-colors">
															<td className="px-4 py-3 text-sm font-mono">{setting.id}</td>
															<td className="px-4 py-3 text-sm">{setting.name}</td>
															<td className="px-4 py-3">
																<span
																	className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
																		status
																	)}`}
																>
																	{getStatusIcon(status)}
																	<span className="ml-1 capitalize">{status}</span>
																</span>
															</td>
															<td className="px-4 py-3">
																<button
																	onClick={() => toggleSettingExpansion(setting.id)}
																	className="p-1 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
																>
																	{expandedSettings.includes(setting.id) ? (
																		<ChevronDown className="w-5 h-5" />
																	) : (
																		<ChevronRight className="w-5 h-5" />
																	)}
																</button>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-card border-2 border-border rounded-lg shadow-sm overflow-hidden">
					<div className="p-4 border-b-2 border-border flex justify-between items-center">
						<h3 className="text-lg font-semibold">Raw Data</h3>
						<button
							onClick={downloadComparisonResults}
							className="py-1.5 px-3 bg-background border-2 border-border text-foreground rounded-md hover:bg-accent/50 transition-colors flex items-center text-sm"
						>
							<FileJson className="w-4 h-4 mr-2" />
							Download JSON
						</button>
					</div>
					<div className="p-4 max-h-96 overflow-auto">
						<pre className="text-xs font-mono bg-muted/30 p-4 rounded-lg overflow-auto">
							{JSON.stringify(comparisonResults, null, 2)}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
