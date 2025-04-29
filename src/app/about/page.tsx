import  AboutLayout  from '@/components/about/AboutLayout';
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import { generateAboutMetadata } from '@/lib/Metadata';

export const metadata: Metadata = generateAboutMetadata({
	title: 'About',
	canonicalUrl: `${website_url}/about`
});

/**
 * About page component.
 *
 * This component renders the About page of the application.
 * It uses the {@link AboutLayout} component to display the content.
 */
export default function AboutPage() {
	return (
		<main>
			<AboutLayout />
		</main>
	);
}
