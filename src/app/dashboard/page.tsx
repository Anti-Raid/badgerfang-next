'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Servers from '@/components/dashboard/all-servers';
import ProtectedRoute from '@/components/authProtectedRoute';

/**
 * Renders the dashboard page with protected access to server resources.
 *
 * The Dashboard component provides a full-height layout that wraps the Servers component
 * within a ProtectedRoute. This setup ensures that the server functionalities are only accessible
 * to authenticated or authorized users.
 *
 * @returns The JSX layout for the dashboard page.
 */
export default function Dashboard() {
	const router = useRouter();
	const [key, setKey] = useState(0);

	return (
		<div className="min-h-screen">
			<ProtectedRoute>
				<Servers key={key} />
			</ProtectedRoute>
		</div>
	);
}
