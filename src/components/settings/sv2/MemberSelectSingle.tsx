'use client';

import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { searchGuildMembers } from '@/lib/api';
import type { PartialMember } from '@/lib/msyscall/types/discord';
import { useSettings } from './context';
import { TextField, SelectField } from './fields';
import { ErrorBox } from './ErrorBox';

export function MemberSelectSingle({
	id,
	label,
	description,
	placeholder = 'Enter User ID...',
	value,
	onChange,
	disabled
}: {
	id: string;
	label?: string;
	description?: string;
	placeholder?: string;
	value: string;
	onChange: (v: string) => void;
	disabled?: boolean;
}) {
	const { guildId } = useSettings();
	const [searchQuery, setSearchQuery] = useState('');
	const [members, setMembers] = useState<PartialMember[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState('');

	const performSearch = async () => {
		const query = searchQuery.trim();
		if (!query) {
			setMembers([]);
			setSearchError('Please enter a username or nickname to search.');
			return;
		}
		setIsSearching(true);
		setSearchError('');
		setMembers([]);
		try {
			const results = await searchGuildMembers(guildId, query);
			setMembers(results);
			if (results.length === 0) setSearchError('No matching members found.');
		} catch (err) {
			setSearchError(err instanceof Error ? err.message : 'Failed to search members');
		} finally {
			setIsSearching(false);
		}
	};

	if (disabled) {
		return (
			<TextField
				id={id}
				label={label}
				description={description}
				value={value}
				onChange={() => {}}
				placeholder="No member ID set"
				disabled
			/>
		);
	}

	return (
		<>
			<div className="flex flex-col gap-2 select-none mb-6">
				<label htmlFor={`${id}-search`} className="text-sm font-semibold text-foreground">
					Search Server Members
				</label>
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-muted-foreground" />
						<input
							type="text"
							id={`${id}-search`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									performSearch();
								}
							}}
							placeholder="Search username or nickname..."
							className="block w-full pl-10 pr-3 py-2 rounded-lg border border-input shadow-sm bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
						/>
					</div>
					<button
						type="button"
						onClick={performSearch}
						disabled={isSearching}
						className="shrink-0 px-4 py-2 rounded-lg font-medium text-sm bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSearching ? 'Searching...' : 'Search'}
					</button>
				</div>
				{searchError && <ErrorBox error={searchError} />}
			</div>

			{members.length > 0 && (
				<SelectField
					id={`${id}-select`}
					label="Select Matching Member"
					description="Select a searched member to auto-fill their User ID"
					value={value}
					onChange={(val) => {
						if (val) onChange(val);
					}}
					options={members.map((m) => ({
						label: `${m.nick || m.user.global_name || m.user.username} (${m.user.id})`,
						value: m.user.id
					}))}
					placeholder="Choose a member..."
				/>
			)}

			<details className="mb-4 border border-border rounded-lg bg-secondary/40 overflow-hidden group">
				<summary className="px-4 py-3 text-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none focus:outline-none transition-colors hover:bg-secondary/60 flex items-center justify-between">
					View / Edit User ID Manually
					<ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
				</summary>
				<div className="p-4 border-t border-border bg-card">
					<TextField
						id={id}
						label={label}
						description={description}
						placeholder={placeholder}
						value={value}
						onChange={onChange}
					/>
				</div>
			</details>
		</>
	);
}
