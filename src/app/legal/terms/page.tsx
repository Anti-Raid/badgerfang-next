import { website_url } from '@/components/common';
import { Metadata } from 'next';
import { generateTermsMetadata } from '@/lib/Metadata';
import TermsOfService from '@/components/legal/Terms';

export const metadata: Metadata = generateTermsMetadata({
	canonicalUrl: `${website_url}/legal/terms`
});

/**
 * Terms of Service page component.
 *
 * This component renders the Terms of Service page of the application.
 * It uses the {@link Terms} component to display the content.
 */
export default function TermsPage() {
	return (
		<main>
			<TermsOfService />
		</main>
	);
}