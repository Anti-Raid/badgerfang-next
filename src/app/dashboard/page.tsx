'use client';

import Servers from '@/components/dashboard/all-servers';

export const runtime = 'edge';

export default function Dashboard() {
	return (
		<div className="min-h-screen">
			<Servers />
		</div>
	);
}
