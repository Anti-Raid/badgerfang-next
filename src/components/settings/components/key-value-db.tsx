'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Primary } from '../../ui/Buttons';
import { InputField } from './form-elements';
import { executeSettings } from '@/lib/api';
import { FaTrash } from 'react-icons/fa'; // Assuming you're using react-icons for the trash icon

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
	const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([]);

	const fetchKeyValuePairs = async () => {
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
		}
	};

	const handleAddKeyValue = async () => {
		const payload = {
			operation: 'Create',
			setting: 'script_kv',
			fields: {
				key: key,
				value: value
			}
		};

		try {
			await executeSettings(guildId, payload);
			fetchKeyValuePairs();
			setKey('');
			setValue('');
		} catch (error) {
			console.error('Failed to add key-value:', error);
		}
	};

	const handleDeleteKeyValue = async (keyToDelete: string) => {
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
		}
	};

	useEffect(() => {
		fetchKeyValuePairs();
	}, [guildId]);

	return (
		<div className="p-4">
			<div className="mb-4">
				<InputField
					label="Key"
					description="Key"
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

				<Primary Title="Add Scripts (key-value db)" onClick={handleAddKeyValue} />
			</div>

			<div className="mt-6">
				<h3 className="text-lg font-medium mb-4">Existing Key-Value Pairs</h3>
				{keyValuePairs.length > 0 ? (
					keyValuePairs.map((pair) => (
						<div
							key={pair.key}
							className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
						>
							<div className="flex justify-between items-center">
								<div>
									<p className="font-medium text-foreground">Key: {pair.key}</p>
									<p className="text-muted-foreground">Value: {pair.value}</p>
								</div>
								<Primary
									Title="Delete"
									onClick={() => handleDeleteKeyValue(pair.key)}
									icon={FaTrash}
								/>
							</div>
						</div>
					))
				) : (
					<p>No key-value pairs found.</p>
				)}
			</div>
		</div>
	);
};
