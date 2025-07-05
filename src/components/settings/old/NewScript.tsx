'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Primary, Secondary, Ghost } from '@/components/ui/Buttons';
import { Toggle, InputField } from '../components/form-elements';
import { executeSettings, getBotState } from '@/lib/api';
import {
	Trash2,
	Code,
	AlertCircle,
	Check,
	Eye,
	Edit,
	Plus,
	FileCode,
	PauseCircle,
	PlayCircle,
	Save,
	X,
	Search,
	RefreshCw
} from 'lucide-react';
import { ScriptModal } from './ScriptModal';
import { toast } from 'react-toastify';

interface Script {
	id: string;
	name: string;
	language: string;
	content: Record<string, string>;
	paused: boolean;
	error_channel: string;
	allowed_caps: string[];
	events: string[];
}

interface ScriptsProps {
	guildId: string;
}

export const Scripts: React.FC<ScriptsProps> = ({ guildId }) => {
	const [scripts, setScripts] = useState<Script[]>([]);
	const [newScript, setNewScript] = useState<Script>({
		id: '',
		name: '',
		language: 'luau',
		content: {},
		paused: false,
		error_channel: '',
		allowed_caps: [],
		events: []
	});
	const [showScriptForm, setShowScriptForm] = useState(false);
	const [selectedScript, setSelectedScript] = useState<Script | null>(null);
	const [eventsOptions, setEventsOptions] = useState<{ value: string; label: string }[]>([]);
	const [capabilitiesOptions, setCapabilitiesOptions] = useState<
		{ value: string; label: string }[]
	>([]);
	const [customCapability, setCustomCapability] = useState('');
	const [editScriptContent, setEditScriptContent] = useState<Record<string, string>>({});
	const [isEditingScript, setIsEditingScript] = useState(false);
	const [isEditingNewScriptContent, setIsEditingNewScriptContent] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		fetchScripts();
		fetchEventsAndCapabilities();
	}, [guildId]);

	const fetchScripts = async () => {
		setIsLoading(true);
		setError(null);

		const payload = {
			operation: 'View',
			setting: 'scripts',
			fields: {}
		};

		try {
			const result = await executeSettings(guildId, payload);
			const scriptsData = result.fields
				? result.fields.map((script: any, index: number) => ({
						id: index.toString(),
						name: script.name,
						language: script.language,
						content: script.content || {},
						paused: script.paused,
						error_channel: script.error_channel || '',
						allowed_caps: script.allowed_caps || [],
						events: script.events || []
					}))
				: [];
			setScripts(scriptsData);
		} catch (error) {
			console.error('Failed to fetch scripts:', error);
			setError('Failed to load scripts. Please try again.');
			toast.error('Failed to load scripts');
		} finally {
			setIsLoading(false);
		}
	};

	const fetchEventsAndCapabilities = async () => {
		try {
			const result = await getBotState();
			const scriptShopSetting = result.settings.find(
				(setting: any) => setting.id === 'script_shop'
			);

			if (scriptShopSetting) {
				const eventsColumn = scriptShopSetting.columns.find(
					(column: any) => column.id === 'events'
				);

				if (eventsColumn?.column_type?.Array?.inner?.String?.allowed_values) {
					const eventsData = eventsColumn.column_type.Array.inner.String.allowed_values.map(
						(event: string) => ({
							value: event,
							label: event
						})
					);
					setEventsOptions(eventsData);
				}

				const capabilitiesColumn = scriptShopSetting.columns.find(
					(column: any) => column.id === 'allowed_caps'
				);

				if (capabilitiesColumn?.suggestions?.Static?.suggestions) {
					const capabilitiesData = capabilitiesColumn.suggestions.Static.suggestions.map(
						(capability: string) => ({
							value: capability,
							label: capability
						})
					);
					setCapabilitiesOptions(capabilitiesData);
				}
			}
		} catch (error) {
			console.error('Failed to fetch events and capabilities:', error);
			toast.error('Failed to load script options');
		}
	};

	const handleAddScript = async () => {
		if (!newScript.name.trim()) {
			setError('Script name is required');
			toast.error('Script name is required');
			return;
		}

		setIsLoading(true);
		setError(null);
		setSuccess(null);

		const payload = {
			operation: 'Create',
			setting: 'scripts',
			fields: {
				...newScript,
				name: newScript.name,
				language: newScript.language,
				content: newScript.content,
				paused: newScript.paused,
				error_channel: newScript.error_channel,
				allowed_caps: newScript.allowed_caps,
				events: newScript.events
			}
		};

		try {
			await executeSettings(guildId, payload);
			setScripts([...scripts, { ...newScript, id: scripts.length.toString() }]);
			setSuccess('Script added successfully');
			toast.success('Script added successfully');
			setNewScript({
				id: '',
				name: '',
				language: 'luau',
				content: {},
				paused: false,
				error_channel: '',
				allowed_caps: [],
				events: []
			});
			setShowScriptForm(false);
		} catch (error) {
			console.error('Failed to add script:', error);
			setError('Failed to add script. Please try again.');
			toast.error('Failed to add script');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteScript = async (name: string) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		const payload = {
			operation: 'Delete',
			setting: 'scripts',
			fields: {
				name: name
			}
		};

		try {
			await executeSettings(guildId, payload);
			setScripts(scripts.filter((script) => script.name !== name));
			setSuccess('Script deleted successfully');
			toast.success('Script deleted successfully');
		} catch (error) {
			console.error('Failed to delete script:', error);
			setError('Failed to delete script. Please try again.');
			toast.error('Failed to delete script');
		} finally {
			setIsLoading(false);
		}
	};

	const handleTogglePause = async (script: Script) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		const updatedScript = { ...script, paused: !script.paused };

		const payload = {
			operation: 'Update',
			setting: 'scripts',
			fields: updatedScript
		};

		try {
			await executeSettings(guildId, payload);
			setScripts(scripts.map((s) => (s.id === script.id ? updatedScript : s)));
			setSuccess(`Script ${updatedScript.paused ? 'paused' : 'activated'} successfully`);
			toast.success(`Script ${updatedScript.paused ? 'paused' : 'activated'} successfully`);
		} catch (error) {
			console.error('Failed to update script:', error);
			setError('Failed to update script. Please try again.');
			toast.error('Failed to update script');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCapabilityClick = (cap: string) => {
		setNewScript((prevScript) => ({
			...prevScript,
			allowed_caps: [...new Set([...prevScript.allowed_caps, cap])]
		}));
	};

	const handleCapabilityRemove = (cap: string) => {
		setNewScript((prevScript) => ({
			...prevScript,
			allowed_caps: prevScript.allowed_caps.filter((c) => c !== cap)
		}));
	};

	const handleCustomCapabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCustomCapability(e.target.value);
	};

	const addCustomCapability = () => {
		if (customCapability.trim()) {
			setNewScript((prevScript) => ({
				...prevScript,
				allowed_caps: [...new Set([...prevScript.allowed_caps, customCapability.trim()])]
			}));
			setCustomCapability('');
		}
	};

	const handleEditScript = async () => {
		if (!selectedScript) return;

		setIsLoading(true);
		setError(null);
		setSuccess(null);

		const payload = {
			operation: 'Update',
			setting: 'scripts',
			fields: {
				...selectedScript,
				content: editScriptContent
			}
		};

		try {
			await executeSettings(guildId, payload);
			setScripts(
				scripts.map((script) =>
					script.id === selectedScript.id ? { ...script, content: editScriptContent } : script
				)
			);
			setSuccess('Script updated successfully');
			toast.success('Script updated successfully');
			setIsEditingScript(false);
			setSelectedScript(null);
		} catch (error) {
			console.error('Failed to update script:', error);
			setError('Failed to update script. Please try again.');
			toast.error('Failed to update script');
		} finally {
			setIsLoading(false);
		}
	};

	const handleContentChange = (newContent: Record<string, string>) => {
		if (selectedScript) {
			setEditScriptContent(newContent);
		} else {
			setNewScript((prev) => ({
				...prev,
				content: newContent
			}));
		}
	};

	const handleEventChange = (selectedEvents: string[]) => {
		setNewScript((prevScript) => ({
			...prevScript,
			events: selectedEvents
		}));
	};

	const filteredScripts = scripts.filter(
		(script) =>
			script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			script.language.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<Primary
					Title="Add New Script"
					onClick={() => setShowScriptForm(!showScriptForm)}
					icon={Plus}
				/>

				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<input
						type="text"
						placeholder="Search scripts..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-full md:w-64"
					/>
				</div>
			</div>

			<AnimatePresence>
				{showScriptForm && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="bg-card border border-border rounded-lg p-5 shadow-sm overflow-hidden"
					>
						<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
							<FileCode className="w-5 h-5 text-primary" />
							Create New Script
						</h3>

						<div className="grid md:grid-cols-2 gap-4">
							<InputField
								label="Name"
								description="The name of the script"
								value={newScript.name}
								onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
								error={!newScript.name.trim() ? 'Script name is required' : undefined}
							/>

							<InputField
								label="Language"
								description="The script language"
								value={newScript.language}
								onChange={(e) => setNewScript({ ...newScript, language: e.target.value })}
							/>
						</div>

						<div className="mb-5 mt-4">
							<label className="block text-foreground font-medium mb-2">Script Content</label>
							<div className="flex items-center">
								<span className="text-sm text-muted-foreground mr-2">
									{Object.keys(newScript.content).length === 0
										? 'No files added yet'
										: `${Object.keys(newScript.content).length} file(s) added`}
								</span>
								<Primary
									Title="Edit Content"
									icon={Code}
									onClick={() => setIsEditingNewScriptContent(true)}
								/>
							</div>
							{Object.keys(newScript.content).length > 0 && (
								<div className="mt-2 p-3 bg-muted/20 rounded-md">
									<p className="font-medium text-sm">Files:</p>
									<ul className="list-disc list-inside mt-1">
										{Object.keys(newScript.content).map((filename) => (
											<li key={filename} className="text-sm text-muted-foreground">
												{filename}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						<Toggle
							label="Paused"
							description="Pause or activate the script"
							checked={newScript.paused}
							onChange={() => setNewScript({ ...newScript, paused: !newScript.paused })}
						/>

						<div className="mb-4 mt-4">
							<label className="block text-foreground font-medium mb-2">Allowed Capabilities</label>
							<p className="text-sm text-muted-foreground mb-2">
								Select predefined capabilities or add custom ones.
							</p>
							<div className="flex flex-wrap gap-2 mb-4">
								{capabilitiesOptions.map((cap) => (
									<motion.button
										key={cap.value}
										onClick={() => handleCapabilityClick(cap.value)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm hover:bg-primary/20 transition-colors"
									>
										{cap.label}
									</motion.button>
								))}
							</div>
							<div className="flex mt-2 space-x-2">
								<input
									type="text"
									placeholder="Add custom capability"
									value={customCapability}
									onChange={handleCustomCapabilityChange}
									className="flex-grow bg-background border border-border rounded-l-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
								/>
								<motion.button
									type="button"
									onClick={addCustomCapability}
									disabled={!customCapability.trim()}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="px-4 py-2 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Add
								</motion.button>
							</div>

							{newScript.allowed_caps.length > 0 && (
								<div className="mt-4">
									<strong className="block mb-2 text-sm">Selected Capabilities:</strong>
									<div className="flex flex-wrap gap-2">
										{newScript.allowed_caps.map((cap, index) => (
											<motion.div
												key={index}
												className="flex items-center bg-primary/5 text-primary rounded-full px-2 py-1 text-sm"
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
											>
												<span>{cap}</span>
												<motion.button
													onClick={() => handleCapabilityRemove(cap)}
													className="ml-1 p-0.5 hover:bg-primary/10 rounded-full"
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
												>
													<X className="w-3 h-3" />
												</motion.button>
											</motion.div>
										))}
									</div>
								</div>
							)}
						</div>

						<div className="mb-4">
							<label className="block text-foreground font-medium mb-2">Events</label>
							<p className="text-sm text-muted-foreground mb-2">
								Select the events that this script can be executed on.
							</p>
							<select
								multiple
								value={newScript.events}
								onChange={(e) => {
									const selectedEvents = Array.from(
										e.target.selectedOptions,
										(option) => option.value
									);
									setNewScript((prevScript) => ({
										...prevScript,
										events: Array.from(new Set([...prevScript.events, ...selectedEvents]))
									}));
								}}
								className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
							>
								{eventsOptions.map((event) => (
									<option key={event.value} value={event.value}>
										{event.label}
									</option>
								))}
							</select>

							{newScript.events.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{newScript.events.map((event, index) => (
										<motion.div
											key={index}
											className="bg-primary/5 text-primary px-2 py-1 rounded-full flex items-center text-sm"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
										>
											<span>{event}</span>
											<motion.button
												onClick={() => {
													setNewScript((prevScript) => ({
														...prevScript,
														events: prevScript.events.filter((e) => e !== event)
													}));
												}}
												className="ml-1 p-0.5 hover:bg-primary/10 rounded-full"
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
											>
												<X className="w-3 h-3" />
											</motion.button>
										</motion.div>
									))}
								</div>
							)}
						</div>

						<InputField
							label="Error Channel"
							description="Error reporting channel ID"
							value={newScript.error_channel}
							onChange={(e) => setNewScript({ ...newScript, error_channel: e.target.value })}
						/>

						{error && (
							<div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-center gap-2 text-sm mt-4">
								<AlertCircle className="w-4 h-4 text-destructive" />
								<p className="text-destructive">{error}</p>
							</div>
						)}

						{success && (
							<div className="bg-primary/10 border border-primary/30 rounded-md p-3 flex items-center gap-2 text-sm mt-4">
								<Check className="w-4 h-4 text-primary" />
								<p className="text-primary">{success}</p>
							</div>
						)}

						<div className="mt-6 flex gap-3">
							<Primary Title="Add Script" onClick={handleAddScript} icon={Save} />
							<Secondary Title="Cancel" onClick={() => setShowScriptForm(false)} icon={X} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="mt-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium flex items-center gap-2">
						<FileCode className="w-5 h-5 text-primary" />
						Existing Scripts
					</h3>
					<motion.button
						whileHover={{ rotate: 180 }}
						transition={{ duration: 0.5 }}
						onClick={fetchScripts}
						className="p-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
						disabled={isLoading}
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
					</motion.button>
				</div>

				{isLoading && filteredScripts.length === 0 ? (
					<div className="flex justify-center items-center py-12">
						<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : filteredScripts.length === 0 ? (
					<motion.div
						className="bg-muted/30 rounded-lg p-8 text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex justify-center mb-3">
							<div className="p-3 bg-muted rounded-full">
								<FileCode className="w-6 h-6 text-muted-foreground" />
							</div>
						</div>
						<h4 className="text-foreground font-medium mb-1">
							{searchTerm ? 'No scripts match your search' : 'No scripts found'}
						</h4>
						<p className="text-muted-foreground text-sm mb-4">
							{searchTerm ? 'Try a different search term' : 'Add your first script to get started'}
						</p>
						{!searchTerm && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="inline-flex items-center gap-1 text-foreground bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
								onClick={() => setShowScriptForm(true)}
							>
								<Plus className="w-4 h-4" />
								<span>Add First Script</span>
							</motion.button>
						)}
					</motion.div>
				) : (
					<div className="grid gap-4">
						<AnimatePresence>
							{filteredScripts.map((script, index) => (
								<motion.div
									key={script.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
									whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
								>
									<div className="flex flex-col gap-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="p-2 bg-primary/10 rounded-md">
													<FileCode className="w-5 h-5 text-primary" />
												</div>
												<div>
													<h4 className="font-medium text-foreground">{script.name}</h4>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<span className="bg-muted/50 px-1.5 py-0.5 rounded">
															{script.language}
														</span>
														<span
															className={`px-1.5 py-0.5 rounded ${
																script.paused
																	? 'bg-destructive/10 text-destructive'
																	: 'bg-primary/10 text-primary'
															}`}
														>
															{script.paused ? 'Paused' : 'Active'}
														</span>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-1">
												<Ghost
													icon={script.paused ? PlayCircle : PauseCircle}
													onClick={() => handleTogglePause(script)}
													Title={script.paused ? 'Activate' : 'Pause'}
												/>
												<Ghost
													icon={Eye}
													onClick={() => setSelectedScript(script)}
													Title="View code"
												/>
												<Ghost
													icon={Edit}
													onClick={() => {
														setSelectedScript(script);
														setEditScriptContent(script.content);
														setIsEditingScript(true);
													}}
													Title="Edit code"
												/>
												<Ghost
													icon={Trash2}
													onClick={() => handleDeleteScript(script.name)}
													Title="Delete script"
												/>
											</div>
										</div>

										<div className="grid md:grid-cols-2 gap-4 mt-2">
											<div>
												<h5 className="text-sm font-medium text-foreground mb-1">Files:</h5>
												<div className="text-sm text-muted-foreground">
													{Object.keys(script.content).length > 0 ? (
														<div className="flex flex-wrap gap-1">
															{Object.keys(script.content).map((filename, idx) => (
																<span key={idx} className="bg-muted/30 px-2 py-0.5 rounded text-xs">
																	{filename}
																</span>
															))}
														</div>
													) : (
														<span>No files</span>
													)}
												</div>
											</div>

											<div>
												<h5 className="text-sm font-medium text-foreground mb-1">Error Channel:</h5>
												<div className="text-sm text-muted-foreground">
													{script.error_channel ? script.error_channel : 'Not set'}
												</div>
											</div>
										</div>

										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<h5 className="text-sm font-medium text-foreground mb-1">Capabilities:</h5>
												<div className="flex flex-wrap gap-1">
													{script.allowed_caps && script.allowed_caps.length > 0 ? (
														script.allowed_caps.map((cap, idx) => (
															<span
																key={idx}
																className="bg-primary/5 text-primary px-2 py-0.5 rounded-full text-xs"
															>
																{cap}
															</span>
														))
													) : (
														<span className="text-sm text-muted-foreground">No capabilities</span>
													)}
												</div>
											</div>

											<div>
												<h5 className="text-sm font-medium text-foreground mb-1">Events:</h5>
												<div className="flex flex-wrap gap-1">
													{script.events && script.events.length > 0 ? (
														script.events.map((event, idx) => (
															<span key={idx} className="bg-muted/30 px-2 py-0.5 rounded text-xs">
																{event}
															</span>
														))
													) : (
														<span className="text-sm text-muted-foreground">No events</span>
													)}
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>

			{/* Edit Script Modal for existing scripts */}
			{selectedScript && isEditingScript && (
				<ScriptModal
					isOpen={true}
					onClose={() => {
						setIsEditingScript(false);
						setSelectedScript(null);
					}}
					content={editScriptContent}
					scriptName={selectedScript.name}
					isEditMode={true}
					onContentChange={handleContentChange}
					onSave={handleEditScript}
				/>
			)}

			{/* View Script Modal for existing scripts */}
			{selectedScript && !isEditingScript && (
				<ScriptModal
					isOpen={!!selectedScript}
					onClose={() => setSelectedScript(null)}
					content={selectedScript.content}
					scriptName={selectedScript.name}
				/>
			)}

			{/* Edit Content Modal for new script */}
			{isEditingNewScriptContent && (
				<ScriptModal
					isOpen={true}
					onClose={() => setIsEditingNewScriptContent(false)}
					content={newScript.content}
					scriptName="New Script"
					isEditMode={true}
					onContentChange={handleContentChange}
					onSave={() => setIsEditingNewScriptContent(false)}
				/>
			)}
		</div>
	);
};
