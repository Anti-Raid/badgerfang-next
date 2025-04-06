'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Database, Search, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { Primary } from '../../ui/Buttons';
import { InputField } from './form-elements';
import { executeSettings } from '@/lib/api';
import { FaPlus } from 'react-icons/fa';

interface KeyValueDBProps {
	guildId: string;
}

interface KeyValuePair {
	key: string;
	value: string;
	created_at: string;
	last_updated_at: string;
}

export const KeyValueDB: React.FC<KeyValueDBProps> = ({ guildId }) => {
	const [key, setKey] = useState('');
	const [value, setValue] = useState('');
	const [valueType, setValueType] = useState('string'); // Default to string
	const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const fetchKeyValuePairs = async () => {
		setIsLoading(true);
		setError(null);

		const payload = {
			operation: 'View',
			setting: 'script_kv',
			fields: {}
		};

		try {
			const response = await executeSettings(guildId, payload);
			setKeyValuePairs(response.fields);
		} catch (error) {
			console.error('Failed to fetch key-value pairs:', error);
			setError('Failed to load key-value pairs. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddKeyValue = async () => {
		if (!key.trim() || !value.trim()) {
			return;
		}

		setIsLoading(true);
		const payload = {
			operation: 'Create',
			setting: 'script_kv',
			fields: {
				key: key,
				value: valueType === 'json' ? JSON.stringify(value) : value
			}
		};

		try {
			await executeSettings(guildId, payload);
			fetchKeyValuePairs();
			setKey('');
			setValue('');
			setValueType('string');
		} catch (error) {
			console.error('Failed to add key-value:', error);
			setError('Failed to add key-value pair. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteKeyValue = async (keyToDelete: string) => {
		setIsLoading(true);
		const payload = {
			operation: 'Delete',
			setting: 'script_kv',
			fields: {
				key: keyToDelete
			}
		};

		try {
			await executeSettings(guildId, payload);
			fetchKeyValuePairs();
		} catch (error) {
			console.error('Failed to delete key-value:', error);
			setError('Failed to delete key-value pair. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyValue = (key: string, value: string) => {
		navigator.clipboard.writeText(value);
		setCopiedKey(key);
		setTimeout(() => setCopiedKey(null), 2000);
	};

	const filteredPairs = keyValuePairs.filter(
		(pair) =>
			pair.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pair.value.toLowerCase().includes(searchTerm.toLowerCase())
	);

	useEffect(() => {
		fetchKeyValuePairs();
	}, [guildId]);

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-lg p-5 shadow-sm">
				<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
					<Database className="w-5 h-5 text-primary" />
					Add New Key-Value Pair
				</h3>

				<div className="grid md:grid-cols-2 gap-4">
					<InputField
						label="Key"
						description="Unique identifier for this record"
						placeholder="Enter the key"
						value={key}
						onChange={(e) => setKey(e.target.value)}
					/>

					<InputField
						label="Value"
						description="The value of the record"
						placeholder="Enter the value"
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>

					<div className="flex items-center gap-2">
						<label className="text-sm font-medium text-muted-foreground">Value Type:</label>
						<select
							value={valueType}
							onChange={(e) => setValueType(e.target.value)}
							className="bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors p-2"
						>
							<option value="string">String</option>
							<option value="json">JSON</option>
							<option value="number">Number</option>
						</select>
					</div>
				</div>

				<div className="mt-4">
					<Primary
						Title={isLoading ? 'Adding...' : 'Add Key-Value Pair'}
						onClick={handleAddKeyValue}
						icon={FaPlus}
					/>
				</div>
			</div>

			{error && (
				<div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
					<AlertCircle className="w-5 h-5 text-destructive" />
					<p className="text-destructive">{error}</p>
					<button
						onClick={fetchKeyValuePairs}
						className="ml-auto bg-destructive/20 hover:bg-destructive/30 text-destructive px-3 py-1 rounded-md text-sm transition-colors"
					>
						Retry
					</button>
				</div>
			)}

			<div className="mt-8">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium">Existing Key-Value Pairs</h3>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<input
								type="text"
								placeholder="Search keys or values..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-full md:w-64"
							/>
						</div>
						<button
							onClick={fetchKeyValuePairs}
							className="p-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
							disabled={isLoading}
						>
							<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
						</button>
					</div>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : filteredPairs.length === 0 ? (
					<div className="bg-muted/30 rounded-lg p-8 text-center">
						<div className="flex justify-center mb-3">
							<div className="p-3 bg-muted rounded-full">
								<AlertCircle className="w-6 h-6 text-muted-foreground" />
							</div>
						</div>
						<h4 className="text-foreground font-medium mb-1">No key-value pairs found</h4>
						<p className="text-muted-foreground text-sm mb-4">
							{searchTerm
								? 'No results match your search criteria'
								: 'Add your first key-value pair to get started'}
						</p>
						{!searchTerm && (
							<button
								className="inline-flex items-center gap-1 text-foreground bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
								onClick={() => document.getElementById('key')?.focus()}
							>
								<Plus className="w-4 h-4" />
								<span>Add First Key-Value</span>
							</button>
						)}
					</div>
				) : (
					<div className="grid gap-4">
						<AnimatePresence>
							{filteredPairs.map((pair) => (
								<motion.div
									key={pair.key}
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
								>
									<div className="flex flex-col md:flex-row md:items-center gap-3">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-medium text-foreground">Key:</h4>
												<code className="text-sm bg-muted/50 px-2 py-0.5 rounded">{pair.key}</code>
											</div>
											<div className="flex items-start gap-2">
												<h4 className="font-medium text-foreground whitespace-nowrap">Value:</h4>
												<div className="relative group flex-1">
													<div className="text-muted-foreground text-sm bg-muted/30 p-2 rounded break-all">
														{pair.value}
													</div>
													<button
														onClick={() => handleCopyValue(pair.key, pair.value)}
														className="absolute top-2 right-2 p-1 rounded-md bg-background/80 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
													>
														{copiedKey === pair.key ? (
															<Check className="w-4 h-4 text-primary" />
														) : (
															<Copy className="w-4 h-4" />
														)}
													</button>
												</div>
											</div>
											{pair.created_at && (
												<div className="text-xs text-muted-foreground mt-2">
													Created: {new Date(pair.created_at).toLocaleString()}
												</div>
											)}
										</div>
										<button
											onClick={() => handleDeleteKeyValue(pair.key)}
											className="self-start md:self-center p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
										>
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	);
};
