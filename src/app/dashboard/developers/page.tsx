'use client';

import Dashboard from '@/components/dashboard/session';
import ProtectedRoute from '@/components/authProtectedRoute';

/**
 * Renders the settings page.
 *
 * This component returns a full-page layout that wraps the Dashboard component within a ProtectedRoute. The ProtectedRoute ensures that only authorized users can access the Dashboard content.
 *
 * @returns A React element representing the settings page.
 */
export default function Settings() {
	return (
		<div className="min-h-screen">
			<ProtectedRoute>
			 <Dashboard />
			</ProtectedRoute>
		</div>
	);
}
