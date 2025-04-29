import Dashboard from '@/components/dashboard/developers/session';
import ProtectedRoute from '@/components/authProtectedRoute';
import { Metadata } from 'next';
import { generateDeveloperDashboardMetadata } from '@/lib/Metadata';
import { website_url } from '@/components/common';

/**
 * Renders the Developes Dashboard page.
 *
 * This component returns a full-page layout that wraps the Dashboard component within a ProtectedRoute. The ProtectedRoute ensures that only authorized users can access the Dashboard content.
 *
 * @returns A React element representing the settings page.
 */
export const metadata: Metadata = generateDeveloperDashboardMetadata({
	canonicalUrl: `${website_url}/dashboard/developers`
})

/**
 * Renders the Developers Dashboard page, restricting access to authorized users.
 *
 * Wraps the {@link Dashboard} component in a {@link ProtectedRoute} to ensure only authenticated users can view the dashboard.
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
