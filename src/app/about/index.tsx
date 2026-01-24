import { createFileRoute } from '@tanstack/react-router';
import { website_url } from '@/components/common';
import { generateAboutMetadata } from '@/lib/Metadata';
import React from 'react';

const AboutLayout = React.lazy(() => import('@/components/about/AboutLayout'));

export const Route = createFileRoute('/about/')({
	component: AboutPage,
	head: () =>
		generateAboutMetadata({
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
			<React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading About...</div>}>
				<AboutLayout />
			</React.Suspense>
		</main>
	);
}
