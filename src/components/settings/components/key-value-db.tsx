'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Database, Search, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { Primary } from '@/components/ui/Buttons';
import { InputField } from './form-elements';
import { executeSettings } from '@/lib/api';
import { toast } from 'react-toastify';

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
	const [valueType, setValueType] = useState('string');
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
			toast.error('Failed to load key-value pairs');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddKeyValue = async () => {
		if (!key.trim() || !value.trim()) {
			toast.error('Key and value are required');
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
			toast.success('Key-value pair added successfully');
		} catch (error) {
			console.error('Failed to add key-value:', error);
			setError('Failed to add key-value pair. Please try again.');
			toast.error('Failed to add key-value pair');
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
			toast.success('Key-value pair deleted successfully');
		} catch (error) {
			console.error('Failed to delete key-value:', error);
			setError('Failed to delete key-value pair. Please try again.');
			toast.error('Failed to delete key-value pair');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyValue = (key: string, value: string) => {
		navigator.clipboard.writeText(value);
		setCopiedKey(key);
		toast.success('Value copied to clipboard');
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
		<div className="space-y-6" role="region" aria-label="Key Value Database Settings">
			<motion.div
				className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-3 mb-2"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				role="alert"
				aria-live="polite"
			>
				<AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />
				<p className="text-yellow-800 font-medium">
					We <span className="font-bold">check KV's every month</span>. <span className="font-bold">Do not store anything illegal</span> or you will get banned.
				</p>
			</motion.div>

			<motion.div
				className="bg-card border border-border rounded-lg p-5 shadow-sm"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				role="form"
				aria-label="Add New Key-Value Pair"
			>
				<h3 className="text-lg font-medium mb-4 flex items-center gap-2" id="add-kv-heading">
					<Database className="w-5 h-5 text-primary" aria-hidden="true" />
					Add New Key-Value Pair
				</h3>

				<div className="grid md:grid-cols-2 gap-4">
					<InputField
						label="Key"
						description="Unique identifier for this record"
						placeholder="Enter the key"
						value={key}
						onChange={(e) => setKey(e.target.value)}
						id="key"
						aria-required="true"
					/>

					<InputField
						label="Value"
						description="The value of the record"
						placeholder="Enter the value"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						id="value"
						aria-required="true"
					/>
				</div>

				<div className="flex items-center gap-4 mt-4 mb-4" role="radiogroup" aria-label="Value Type">
					<label className="text-sm font-medium text-foreground" id="value-type-label">Value Type:</label>
					<div className="flex bg-muted/30 rounded-lg p-1" aria-labelledby="value-type-label">
						{['string', 'json', 'number'].map((type) => (
							<button
								key={type}
								onClick={() => setValueType(type)}
								className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
									valueType === type
										? 'bg-primary text-primary-foreground outline outline-2 outline-primary'
										: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
								}`}
								role="radio"
								aria-checked={valueType === type}
								tabIndex={0}
								aria-label={type.charAt(0).toUpperCase() + type.slice(1)}
							>
								{type.charAt(0).toUpperCase() + type.slice(1)}
							</button>
						))}
					</div>
				</div>

				<div className="mt-4">
					<Primary
						Title={isLoading ? 'Adding...' : 'Add Key-Value Pair'}
						onClick={handleAddKeyValue}
						icon={Plus}
						aria-label="Add Key-Value Pair"
						disabled={isLoading}
					/>
				</div>
			</motion.div>

			{error && (
				<motion.div
					className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					role="alert"
					aria-live="assertive"
				>
					<AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
					<p className="text-destructive">{error}</p>
					<button
						onClick={fetchKeyValuePairs}
						className="ml-auto bg-destructive/20 hover:bg-destructive/30 text-destructive px-3 py-1 rounded-md text-sm transition-colors focus:outline focus:outline-2 focus:outline-destructive"
						aria-label="Retry loading key-value pairs"
					>
						Retry
					</button>
				</motion.div>
			)}

			<div className="mt-8">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium flex items-center gap-2" id="existing-kv-heading">
						<Database className="w-5 h-5 text-primary" aria-hidden="true" />
						Existing Key-Value Pairs
					</h3>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" aria-hidden="true" />
							<input
								type="text"
								placeholder="Search keys or values..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-full md:w-64"
								aria-label="Search keys or values"
							/>
						</div>
						<motion.button
							whileHover={{ rotate: 180 }}
							transition={{ duration: 0.5 }}
							onClick={fetchKeyValuePairs}
							className="p-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors focus:outline focus:outline-2 focus:outline-primary"
							disabled={isLoading}
							aria-label="Refresh key-value pairs"
						>
							<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
						</motion.button>
					</div>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center py-12" aria-busy="true" aria-live="polite">
						<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading"></div>
					</div>
				) : filteredPairs.length === 0 ? (
					<motion.div
						className="bg-muted/30 rounded-lg p-8 text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						role="status"
						aria-live="polite"
					>
						<div className="flex justify-center mb-3">
							<div className="p-3 bg-muted rounded-full">
								<AlertCircle className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
							</div>
						</div>
						<h4 className="text-foreground font-medium mb-1">No key-value pairs found</h4>
						<p className="text-muted-foreground text-sm mb-4">
							{searchTerm
								? 'No results match your search criteria'
								: 'Add your first key-value pair to get started'}
						</p>
						{!searchTerm && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="inline-flex items-center gap-1 text-foreground bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors focus:outline focus:outline-2 focus:outline-primary"
								onClick={() => document.getElementById('key')?.focus()}
								aria-label="Add First Key-Value"
							>
								<Plus className="w-4 h-4" aria-hidden="true" />
								<span>Add First Key-Value</span>
							</motion.button>
						)}
					</motion.div>
				) : (
					<div className="grid gap-4" aria-live="polite" aria-relevant="additions removals">
						<AnimatePresence>
							{filteredPairs.map((pair, index) => (
								<motion.div
									key={pair.key}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
									whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
									role="listitem"
									aria-label={`Key: ${pair.key}`}
								>
									<div className="flex flex-col md:flex-row md:items-center gap-3">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<h4 className="font-medium text-foreground">Key:</h4>
												<code className="text-sm bg-muted/50 px-2 py-0.5 rounded">{pair.key}</code>
											</div>
											<div className="flex items-start gap-2">
												<h4 className="font-medium text-foreground whitespace-nowrap">Value:</h4>
												<div className="relative group flex-1">
													<div className="text-muted-foreground text-sm bg-muted/30 p-2 rounded break-all">
														{typeof pair.value === 'object'
															? JSON.stringify(pair.value, null, 2)
															: pair.value}
													</div>
													<button
														onClick={() => handleCopyValue(pair.key, pair.value)}
														className="absolute top-2 right-2 p-1 rounded-md bg-background/80 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline focus:outline-2 focus:outline-primary"
														aria-label={`Copy value for key ${pair.key}`}
													>
														{copiedKey === pair.key ? (
															<Check className="w-4 h-4 text-primary" aria-hidden="true" />
														) : (
															<Copy className="w-4 h-4" aria-hidden="true" />
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
										<motion.button
											whileHover={{ scale: 1.1, color: 'rgb(var(--destructive))' }}
											whileTap={{ scale: 0.9 }}
											onClick={() => handleDeleteKeyValue(pair.key)}
											className="self-start md:self-center p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus:outline focus:outline-2 focus:outline-destructive"
											aria-label={`Delete key-value pair for key ${pair.key}`}
										>
											<Trash2 className="w-5 h-5" aria-hidden="true" />
										</motion.button>
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
