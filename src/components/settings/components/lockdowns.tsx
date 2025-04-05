'use client';
import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Primary } from '../../ui/Buttons';
import { InputField } from './form-elements';
import { executeSettings } from '@/lib/api';
import { Trash2, Lock, AlertCircle, RefreshCw, Calendar, Clock, Shield } from 'lucide-react';
import { FaLock } from 'react-icons/fa';

interface LockdownProps {
	guildId: string;
}

interface Lockdown {
	id: string;
	type: string;
	reason: string;
	created_at: string;
}

export const Lockdowns: React.FC<LockdownProps> = ({ guildId }) => {
	const [type, setType] = useState('qsl'); // Default to first option to avoid empty selection
	const [reason, setReason] = useState('');
	const [lockdowns, setLockdowns] = useState<Lockdown[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchLockdowns();
	}, [guildId]);

	const fetchLockdowns = async () => {
		setIsLoading(true);
		setError(null);

		const payload = {
			operation: 'View',
			setting: 'lockdowns',
			fields: {}
		};

		try {
			const result = await executeSettings(guildId, payload);
			const lockdownsData = result.fields.map((lockdown: any, index: number) => ({
				id: index.toString(),
				type: lockdown.type,
				reason: lockdown.reason,
				created_at: lockdown.created_at
			}));
			setLockdowns(lockdownsData);
		} catch (error) {
			console.error('Failed to fetch lockdowns:', error);
			setError('Failed to load lockdowns. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddLockdown = async () => {
		if (!type || !reason) {
			// Validate form inputs
			setError('Please select a type and provide a reason');
			return;
		}

		if (isLoading) return; // Prevent multiple submissions

		setIsLoading(true);
		setError(null);

		const payload = {
			operation: 'Create',
			setting: 'lockdowns',
			fields: {
				type: type,
				reason: reason
			}
		};

		try {
			await executeSettings(guildId, payload);
			// Reset form fields
			setReason('');
			// Refresh the list
			await fetchLockdowns();
		} catch (error) {
			console.error('Failed to add lockdown:', error);
			setError('Failed to add lockdown. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteLockdown = async (id: string) => {
		if (isLoading) return; // Prevent multiple deletions

		setIsLoading(true);
		const payload = {
			operation: 'Delete',
			setting: 'lockdowns',
			fields: {
				gid: id
			}
		};

		try {
			await executeSettings(guildId, payload);
			// Update local state
			setLockdowns(lockdowns.filter((lockdown) => lockdown.id !== id));
		} catch (error) {
			console.error('Failed to delete lockdown:', error);
			setError('Failed to delete lockdown. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const lockdownTypes = [
		{ value: 'qsl', label: 'QSL - Quick Server Lockdown' },
		{ value: 'tsl', label: 'TSL - Temporary Server Lockdown' },
		{ value: 'scl', label: 'SCL - Server Channel Lockdown' }
	];

	const getLockdownTypeLabel = (type: string) => {
		const lockdownType = lockdownTypes.find((lt) => lt.value === type);
		return lockdownType ? lockdownType.label : type.toUpperCase();
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'qsl':
				return 'text-red-500 bg-red-500/10';
			case 'tsl':
				return 'text-amber-500 bg-amber-500/10';
			case 'scl':
				return 'text-blue-500 bg-blue-500/10';
			default:
				return 'text-primary bg-primary/10';
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-lg p-5 shadow-sm">
				<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
					<Lock className="w-5 h-5 text-primary" />
					Create New Lockdown
				</h3>

				<div className="space-y-4">
					<InputField
						label="Type"
						description="The type of the lockdown."
						type="select"
						value={type}
						onChange={(e) => setType(e.target.value)}
						options={lockdownTypes}
					/>
					<InputField
						label="Reason"
						description="The reason for starting the lockdown."
						placeholder="Enter the reason for the lockdown"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>

					{error && (
						<div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-center gap-2 text-sm">
							<AlertCircle className="w-4 h-4 text-destructive" />
							<p className="text-destructive">{error}</p>
						</div>
					)}

					<Primary
						Title={isLoading ? 'Creating...' : 'Create Lockdown'}
						onClick={handleAddLockdown}
						icon={FaLock}
					/>
				</div>
			</div>

			<div className="mt-8">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium">Active Lockdowns</h3>
					<button
						onClick={fetchLockdowns}
						className="p-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
						disabled={isLoading}
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
					</button>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : lockdowns.length === 0 ? (
					<div className="bg-muted/30 rounded-lg p-8 text-center">
						<div className="flex justify-center mb-3">
							<div className="p-3 bg-muted rounded-full">
								<Shield className="w-6 h-6 text-muted-foreground" />
							</div>
						</div>
						<h4 className="text-foreground font-medium mb-1">No active lockdowns</h4>
						<p className="text-muted-foreground text-sm">
							Your server is currently operating normally
						</p>
					</div>
				) : (
					<div className="grid gap-4">
						<AnimatePresence>
							{lockdowns.map((lockdown) => (
								<motion.div
									key={lockdown.id}
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
								>
									<div className="flex flex-col md:flex-row md:items-center gap-3">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<span
													className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(lockdown.type)}`}
												>
													{getLockdownTypeLabel(lockdown.type)}
												</span>
											</div>
											<div className="mb-2">
												<h4 className="font-medium text-foreground">Reason:</h4>
												<p className="text-muted-foreground">{lockdown.reason}</p>
											</div>
											<div className="flex items-center gap-3 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Calendar className="w-3 h-3" />
													{new Date(lockdown.created_at).toLocaleDateString()}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{new Date(lockdown.created_at).toLocaleTimeString()}
												</span>
											</div>
										</div>
										<button
											onClick={() => handleDeleteLockdown(lockdown.id)}
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
