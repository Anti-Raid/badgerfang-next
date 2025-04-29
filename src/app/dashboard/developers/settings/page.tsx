import Validator from '@/components/dashboard/developers/settings-validator';
import ProtectedRoute from '@/components/authProtectedRoute';
import { website_url } from '@/components/common';
import { Metadata } from 'next';
import { generateSettingsValidatorMetadata } from '@/lib/Metadata';

/**
 * Renders the Settings Validator page.
 *
 * This component returns a full-page layout that wraps the Settings Validator component within a ProtectedRoute. The ProtectedRoute ensures that only authorized users can access the Dashboard content.
 *
 * @returns A React element representing the settings page.
 */
export const metadata: Metadata = generateSettingsValidatorMetadata({
	canonicalUrl: `${website_url}/dashboard/developers/settings`
});

/**
 * Renders the Settings Validator page with access control.
 *
 * Displays the validator interface for settings, ensuring only authorized users can access the content.
 */
export default function Settings() {
	return (
		<div className="min-h-screen">
			<ProtectedRoute>
				<Validator />
			</ProtectedRoute>
		</div>
	);
}
