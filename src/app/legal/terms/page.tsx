import { website_url } from '@/components/common';
import { Metadata } from 'next';
import { generateTermsMetadata } from '@/lib/Metadata';
import TermsOfService from '@/components/legal/Terms';

export const metadata: Metadata = generateTermsMetadata({
	canonicalUrl: `${website_url}/legal/terms`
});

/**
 * Displays the Terms of Service page.
 *
 * Renders the {@link TermsOfService} component within a main content area.
 */
export default function TermsPage() {
	return (
		<main>
			<TermsOfService />
		</main>
	);
}