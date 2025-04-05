'use client';

import Dashboard from '@/components/dashboard/session';
import ProtectedRoute from '@/components/authProtectedRoute';

export default function Settings() {
	return (
		<div className="min-h-screen">
			<ProtectedRoute>
			 <Dashboard />
			</ProtectedRoute>
		</div>
	);
}
