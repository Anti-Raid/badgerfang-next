'use client';

import { Suspense, useEffect, useState } from 'react';
import Settings from '@/components/settings/layout';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/authProtectedRoute';

/**
 * Renders the guild settings page content.
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

	return <Settings guildId={guildId} />;
}

/**
 * Renders the guild settings page.
 *
 * This component wraps the guild content inside a ProtectedRoute to ensure that only
 * authorized users can access the guild settings. It utilizes React's Suspense to
 * display a loading indicator while the content is being loaded.
 */
export default function Guild() {
	return (
		<div className="min-h-screen pt-16">
			<Suspense fallback={<div>Loading...</div>}>
				<ProtectedRoute>
					<GuildContent />
				</ProtectedRoute>
			</Suspense>
		</div>
	);
}
