import AboutLayout from '@/components/about/AboutLayout';
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import { generateAboutMetadata } from '@/lib/Metadata';

export const metadata: Metadata = generateAboutMetadata({
	canonicalUrl: `${website_url}/about`
});

/**
 * Renders the About page using the {@link AboutLayout} component.
 */
export default function AboutPage() {
	return (
		<main>
			<AboutLayout />
		</main>
	);
}
