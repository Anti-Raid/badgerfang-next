import { createFileRoute } from '@tanstack/react-router';
import AboutLayout from '@/components/about/AboutLayout';
import { website_url } from '@/components/common';
import { generateAboutMetadata } from '@/lib/Metadata';

export const Route = createFileRoute('/about/')({
	component: AboutPage,
    head: () => generateAboutMetadata({
        canonicalUrl: `${website_url}/about`
    }),
    // Enable SSR for better SEO
    ssr: true
});

/**
 * Renders the About page using the {@link AboutLayout} component.
 */
function AboutPage() {
	return (
		<main>
			<AboutLayout />
		</main>
	)
}
