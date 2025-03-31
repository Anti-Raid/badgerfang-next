'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Servers from '@/components/dashboard/all-servers';

export default function Dashboard() {
	const router = useRouter();
	const [key, setKey] = useState(0);

	return (
		<div className="min-h-screen">
			<Servers key={key} />
		</div>
	);
}
