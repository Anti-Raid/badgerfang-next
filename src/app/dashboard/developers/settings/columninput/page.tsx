'use client';

import ProtectedRoute from '@/components/authProtectedRoute';
import { ColumnInputTest } from '@/components/settings/tests/tests';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Renders the column test page content.
 *
 * Extracts the guild ID from the URL search parameters using Next.js's routing hooks. If a valid guild ID is retrieved, the component renders the settings view; otherwise, it displays a message indicating that the guild ID is missing.
 *
 * @returns A JSX element representing either the guild settings or an error message.
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
 * Renders the Developers Dashboard page, restricting access to authorized users.
 *
 * Wraps the {@link Dashboard} component in a {@link ProtectedRoute} to ensure only authenticated users can view the dashboard.
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
