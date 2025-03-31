import type React from 'react';
import { useState, useEffect } from 'react';
import { Primary } from '../../ui/Buttons';
import { Toggle, InputField } from './form-elements';
import { executeSettings, getBotState } from '@/lib/api';
import { FaTrash, FaCode } from 'react-icons/fa';
import { ScriptModal } from './ScriptModal';

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

	useEffect(() => {
		const fetchScripts = async () => {
			const payload = {
				operation: 'View',
				setting: 'scripts',
				fields: {}
			};

			try {
				const result = await executeSettings(guildId, payload);
				const scriptsData = result.fields.map((script: any, index: number) => ({
					id: index.toString(),
					name: script.name,
					language: script.language,
					content: script.content,
					paused: script.paused,
					error_channel: script.error_channel,
					allowed_caps: script.allowed_caps,
					events: script.events
				}));
				setScripts(scriptsData);
			} catch (error) {
				console.error('Failed to fetch scripts:', error);
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
			}
		};

		fetchScripts();
		fetchEventsAndCapabilities();
	}, [guildId]);

	const handleAddScript = async () => {
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
		}
	};

	const handleDeleteScript = async (name: string) => {
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
		} catch (error) {
			console.error('Failed to delete script:', error);
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
			setIsEditingScript(false);
			setSelectedScript(null);
		} catch (error) {
			console.error('Failed to update script:', error);
		}
	};

	const handleEventChange = (selectedEvents: string[]) => {
		setNewScript((prevScript) => ({
			...prevScript,
			events: selectedEvents
		}));
	};

	return (
		<>
			<Primary Title="Add Script" onClick={() => setShowScriptForm(!showScriptForm)} />

			{showScriptForm && (
				<div className="p-4 bg-background border border-primary border-opacity-20 mt-2 rounded-md shadow-md">
					<InputField
						label="Name"
						description="The name of the script"
						value={newScript.name}
						onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
					/>

					<InputField
						label="Language"
						description="The script language"
						value={newScript.language}
						onChange={(e) => setNewScript({ ...newScript, language: e.target.value })}
					/>

					<div className="mb-5">
						<label className="block text-foreground mb-2">Script Content</label>
						<div className="flex items-center">
							<span className="text-sm text-muted-foreground mr-2">
								{Object.keys(newScript.content).length === 0
									? 'No files added yet'
									: `${Object.keys(newScript.content).length} file(s) added`}
							</span>
							<Primary
								Title="Edit Content"
								icon={FaCode}
								onClick={() => setIsEditingNewScriptContent(true)}
							/>
						</div>
						{Object.keys(newScript.content).length > 0 && (
							<div className="mt-2 p-2 bg-muted/20 rounded-md">
								<p className="font-medium">Files:</p>
								<ul className="list-disc list-inside">
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

					<div className="mb-4">
						<label className="block text-foreground mb-1">Allowed Capabilities</label>
						<p className="text-sm text-muted-foreground mb-2">
							Select predefined capabilities or add custom ones.
						</p>
						<div className="flex flex-wrap gap-2 mb-4">
							{capabilitiesOptions.map((cap) => (
								<button
									key={cap.value}
									onClick={() => handleCapabilityClick(cap.value)}
									className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm hover:bg-primary-foreground hover:text-primary border border-primary"
								>
									{cap.label}
								</button>
							))}
						</div>
						<div className="flex mt-2 space-x-2">
							<input
								type="text"
								placeholder="Add custom capability"
								value={customCapability}
								onChange={handleCustomCapabilityChange}
								className="flex-grow bg-background border border-primary border-opacity-20 rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
							/>
							<Primary Title="Add" onClick={addCustomCapability} />
						</div>

						{newScript.allowed_caps.length > 0 && (
							<div className="mt-4">
								<strong className="block mb-2">Selected Capabilities:</strong>
								<ul className="list-disc list-inside space-y-1">
									{newScript.allowed_caps.map((cap, index) => (
										<li key={index} className="flex items-center justify-between text-foreground">
											{cap}
											<button
												onClick={() => handleCapabilityRemove(cap)}
												className="text-destructive hover:text-destructive-foreground"
											>
												<FaTrash />
											</button>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					<div className="mb-4">
						<label className="block text-foreground mb-1">Events</label>
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
									events: Array.from(new Set([...prevScript.events, ...selectedEvents])) // Prevent duplicates
								}));
							}}
							className="w-full bg-background border border-primary border-opacity-20 rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
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
									<div
										key={index}
										className="bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center"
									>
										<span>{event}</span>
										<button
											onClick={() => {
												setNewScript((prevScript) => ({
													...prevScript,
													events: prevScript.events.filter((e) => e !== event)
												}));
											}}
											className="ml-2 text-background hover:text-destructive"
										>
											&times;
										</button>
									</div>
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

					<Primary Title="Add Script" onClick={handleAddScript} />
				</div>
			)}

			<div className="mt-6">
				<h3 className="text-lg font-medium mb-4">Existing Scripts</h3>
				{scripts.map((script) => (
					<div
						key={script.id}
						className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
					>
						<div className="flex justify-between items-center">
							<div>
								<p className="font-medium text-foreground">Name: {script.name}</p>
								<p className="text-muted-foreground">Language: {script.language}</p>
								<p className="text-muted-foreground">Paused: {script.paused ? 'Yes' : 'No'}</p>
								<p className="text-muted-foreground">Error Channel: {script.error_channel}</p>
								<p className="text-muted-foreground">
									Files: {Object.keys(script.content).join(', ')}
								</p>
							</div>
							<div className="flex flex-wrap gap-2 mt-3 sm:flex-nowrap">
								<Primary
									Title="Edit Code"
									onClick={() => {
										setSelectedScript(script);
										setEditScriptContent(script.content);
										setIsEditingScript(true);
									}}
								/>
								<Primary Title="View Code" onClick={() => setSelectedScript(script)} />
								<Primary
									Title="Delete"
									onClick={() => handleDeleteScript(script.name)}
									icon={FaTrash}
								/>
							</div>
						</div>
					</div>
				))}
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
		</>
	);
};
