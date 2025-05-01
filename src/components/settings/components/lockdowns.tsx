'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Primary } from '@/components/ui/Buttons';
import { InputField } from './form-elements';
import { executeSettings, getUserGuildBaseInfo } from '@/lib/api';
import { Trash2, Lock, AlertCircle, RefreshCw, Calendar, Clock, Shield, Tv } from 'lucide-react';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface LockdownProps {
	guildId: string;
}

interface Lockdown {
	id: string;
	type: string;
	reason: string;
	created_at: string;
	channel_id?: string;
	channel_name?: string;
}

interface Channel {
	id: string;
	name: string;
}

export const Lockdowns: React.FC<LockdownProps> = ({ guildId }) => {
	const [type, setType] = useState('qsl');
	const [reason, setReason] = useState('');
	const [selectedChannelId, setSelectedChannelId] = useState('');
	const [channelOptions, setChannelOptions] = useState<{ value: string; label: string }[]>([]);
	const [lockdowns, setLockdowns] = useState<Lockdown[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchLockdowns();
	}, [guildId]);

	useEffect(() => {
		if (type === 'scl') {
			fetchChannelOptions();
		}
	}, [type, guildId]);

	const fetchChannelOptions = async () => {
		try {
			const data = await getUserGuildBaseInfo(guildId);
			if (data.channels && Array.isArray(data.channels)) {
				const uniqueChannels = new Map();

				data.channels.forEach((item: any) => {
					if (item.channel && item.channel.id && item.channel.name) {
						uniqueChannels.set(item.channel.id, {
							value: item.channel.id,
							label: item.channel.name
						});
					}
				});

				const options = Array.from(uniqueChannels.values());
				setChannelOptions(options);
			}
		} catch (error) {
			console.error('Failed to fetch channel options:', error);
			toast.error('Failed to load channel options');
			setError('Failed to load channel options. Please try again.');
		}
	};

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

			if (result.fields && Array.isArray(result.fields)) {
				const lockdownsData = result.fields.map((lockdown: any) => ({
					id: lockdown.id,
					type: lockdown.type,
					reason: lockdown.reason,
					created_at: lockdown.created_at,
					channel_id: lockdown.channel_id,
					channel_name: lockdown.channel_name
				}));
				setLockdowns(lockdownsData);
			} else {
				throw new Error('Invalid response format from server');
			}
		} catch (error) {
			console.error('Failed to fetch lockdowns:', error);
			toast.error('Failed to load lockdowns');
			setError('Failed to load lockdowns. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddLockdown = async () => {
		if (!type || !reason) {
			toast.error('Please select a type and provide a reason');
			setError('Please select a type and provide a reason');
			return;
		}

		if (type === 'scl' && !selectedChannelId) {
			toast.error('Please select a channel for Server Channel Lockdown');
			setError('Please select a channel for Server Channel Lockdown');
			return;
		}

		if (isLoading) return;

		setIsLoading(true);
		setError(null);

		const formattedType = type === 'scl' ? `${type}/${selectedChannelId}` : type;

		const payload = {
			operation: 'Create',
			setting: 'lockdowns',
			fields: {
				type: formattedType,
				reason: reason
			}
		};

		try {
			await executeSettings(guildId, payload);
			toast.success('Lockdown created successfully');
			setReason('');
			if (type === 'scl') {
				setSelectedChannelId('');
			}
			await fetchLockdowns();
		} catch (error) {
			console.error('Failed to add lockdown:', error);
			toast.error('Failed to add lockdown');
			setError('Failed to add lockdown. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteLockdown = async (id: string) => {
		if (isLoading) return;
		if (!id || id.length < 30) {
			toast.error('Invalid lockdown ID');
			setError('Invalid lockdown ID. Cannot delete this item.');
			return;
		}

		setIsLoading(true);
		setError(null);

		const payload = {
			operation: 'Delete',
			setting: 'lockdowns',
			fields: {
				id: id
			}
		};

		try {
			await executeSettings(guildId, payload);
			setLockdowns(lockdowns.filter((lockdown) => lockdown.id !== id));
			toast.success('Lockdown deleted successfully');
		} catch (error) {
			console.error('Failed to delete lockdown:', error);
			toast.error('Failed to delete lockdown');
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
		const baseType = type.split('/')[0];
		const lockdownType = lockdownTypes.find((lt) => lt.value === baseType);
		return lockdownType ? lockdownType.label : baseType.toUpperCase();
	};

	const getTypeColor = (type: string) => {
		const baseType = type.split('/')[0];
		switch (baseType) {
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

	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString();
		} catch (e) {
			return 'Invalid date';
		}
	};

	const formatTime = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleTimeString();
		} catch (e) {
			return 'Invalid time';
		}
	};

	const getChannelIdFromType = (lockdown: Lockdown): string | undefined => {
		if (lockdown.channel_id) return lockdown.channel_id;

		const typeParts = lockdown.type.split('/');
		if (typeParts.length > 1 && typeParts[0] === 'scl') {
			return typeParts[1];
		}

		return undefined;
	};

	const getChannelName = (lockdown: Lockdown) => {
		if (lockdown.channel_name) return lockdown.channel_name;

		const channelId = getChannelIdFromType(lockdown);
		if (!channelId) return '';

		const channel = channelOptions.find((option) => option.value === channelId);
		return channel ? channel.label : 'Unknown Channel';
	};

	const isSclType = (type: string) => {
		return type.startsWith('scl');
	};

	return (
		<div className="space-y-6">
			<motion.div
				className="bg-card border border-border rounded-lg p-5 shadow-sm"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
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

					{type === 'scl' && (
						<InputField
							label="Channel"
							description="Select the channel to apply the lockdown to."
							type="select"
							value={selectedChannelId}
							onChange={(e) => setSelectedChannelId(e.target.value)}
							options={channelOptions}
							placeholder="Select a channel"
							error={
								type === 'scl' && !selectedChannelId ? 'Channel is required for SCL' : undefined
							}
						/>
					)}

					<InputField
						label="Reason"
						description="The reason for starting the lockdown."
						placeholder="Enter the reason for the lockdown"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						error={!reason ? 'Reason is required' : undefined}
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
			</motion.div>

			<div className="mt-8">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium flex items-center gap-2">
						<Lock className="w-5 h-5 text-primary" />
						Active Lockdowns
					</h3>
					<motion.button
						whileHover={{ rotate: 180 }}
						transition={{ duration: 0.5 }}
						onClick={fetchLockdowns}
						className="p-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
						disabled={isLoading}
						aria-label="Refresh lockdowns"
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
					</motion.button>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : lockdowns.length === 0 ? (
					<motion.div
						className="bg-muted/30 rounded-lg p-8 text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex justify-center mb-3">
							<div className="p-3 bg-muted rounded-full">
								<Shield className="w-6 h-6 text-muted-foreground" />
							</div>
						</div>
						<h4 className="text-foreground font-medium mb-1">No active lockdowns</h4>
						<p className="text-muted-foreground text-sm">
							Your server is currently operating normally
						</p>
					</motion.div>
				) : (
					<div className="grid gap-4">
						<AnimatePresence>
							{lockdowns.map((lockdown, index) => (
								<motion.div
									key={lockdown.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className="bg-card border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
									whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
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
											{isSclType(lockdown.type) && (
												<div className="mb-2">
													<h4 className="font-medium text-foreground flex items-center">
														<Tv className="w-4 h-4 mr-1" /> Applied Channel:
													</h4>
													<p className="text-muted-foreground">{getChannelName(lockdown)}</p>
												</div>
											)}
											<div className="flex items-center gap-3 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Calendar className="w-3 h-3" />
													{formatDate(lockdown.created_at)}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{formatTime(lockdown.created_at)}
												</span>
											</div>
										</div>
										<motion.button
											whileHover={{ scale: 1.1, color: 'rgb(var(--destructive))' }}
											whileTap={{ scale: 0.9 }}
											onClick={() => handleDeleteLockdown(lockdown.id)}
											className="self-start md:self-center p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
											aria-label="Delete lockdown"
										>
											<Trash2 className="w-5 h-5" />
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
