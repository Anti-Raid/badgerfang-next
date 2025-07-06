'use client';

import ProtectedRoute from '@/components/authProtectedRoute';
import { ColumnInputTest } from '@/components/settings/tests/tests';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Displays the developer settings content for a guild based on the `id` URL parameter.
 *
 * Retrieves the guild ID from the URL search parameters and renders the settings input component if present, or an error message if missing.
 *
 * @returns The guild settings input view or an error message if the guild ID is not provided.
 */
function GuildContent() {
	const searchParams = useSearchParams();
	const [guildId, setGuildId] = useState<string | null>(null);

	useEffect(() => {
		setGuildId(searchParams.get('id'));
	}, [searchParams]);

	if (!guildId) {
		return <div>Guild ID is missing.</div>;
	}

	return <ColumnInputTest guildId={guildId} />;
}

/**
 * Renders the developer settings page for the dashboard, accessible only to authenticated users.
 *
 * Displays the `GuildContent` component within a protected route, ensuring only authorized users can access the page.
 */
export default function Settings() {
	return (
		<div className="min-h-screen">
			<ProtectedRoute>
				<GuildContent />
			</ProtectedRoute>
		</div>
	);
}
