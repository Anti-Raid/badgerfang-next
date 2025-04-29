
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import { generatePrivacyMetadata } from '@/lib/Metadata';
import PrivacyPolicy from '@/components/legal/Privacy';

export const metadata: Metadata = generatePrivacyMetadata({
	canonicalUrl: `${website_url}/legal/privacy`
});

export default function PrivacyPage() {
	return (
		<main>
			<PrivacyPolicy />
		</main>
	);
}
