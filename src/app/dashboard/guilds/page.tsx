'use client';

import { Suspense, useEffect, useState } from 'react';
import Settings from '@/components/settings/layout';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/authProtectedRoute';

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

export default function Guild() {
	return (
		<div className="min-h-screen">
			<Suspense fallback={<div>Loading...</div>}>
			<ProtectedRoute>
				<GuildContent />
			</ProtectedRoute>
			</Suspense>
		</div>
	);
}
