import Dashboard from '@/components/dashboard/session';
import ProtectedRoute from '@/components/authProtectedRoute';
import {
	description,
} from '@/components/common';
import { Metadata } from "next";

/**
 * Renders the Developes Dashboard page.
 *
 * This component returns a full-page layout that wraps the Dashboard component within a ProtectedRoute. The ProtectedRoute ensures that only authorized users can access the Dashboard content.
 *
 * @returns A React element representing the settings page.
 */
export const metadata: Metadata = {
	title: "Developers | Antiraid",
	description: `${description}`,
};

export default function Settings() {
	return (
		<div className="min-h-screen">
			<ProtectedRoute>
				<Dashboard />
			</ProtectedRoute>
		</div>
	);
}
