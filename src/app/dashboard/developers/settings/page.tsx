import Validator from '@/components/dashboard/developers/settings-validator';
import ProtectedRoute from '@/components/authProtectedRoute';
import { description } from '@/components/common';
import { Metadata } from 'next';

/**
 * Renders the DSettings Validator page.
 *
 * This component returns a full-page layout that wraps the Settings Validator component within a ProtectedRoute. The ProtectedRoute ensures that only authorized users can access the Dashboard content.
 *
 * @returns A React element representing the settings page.
 */
export const metadata: Metadata = {
	title: 'Settings Validator | Developers',
	description: `${description}`
};

export default function Settings() {
	return (
		<div className="min-h-screen">
			<ProtectedRoute>
				<Validator />
			</ProtectedRoute>
		</div>
	);
}
