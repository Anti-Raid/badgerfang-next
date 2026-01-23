import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import AboutLayout from '@/components/about/AboutLayout';
import { website_url } from '@/components/common';
import { generateAboutMetadata } from '@/lib/Metadata';

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
	// Handle hash fragment navigation
	useEffect(() => {
		const hash = window.location.hash;
		if (hash) {
			// Wait for page to render, then scroll to element
			setTimeout(() => {
				const element = document.querySelector(hash);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 100);
		}
	}, []);

	return (
		<main>
			<AboutLayout />
		</main>
	);
}
