import { Hero } from '@/components/Hero/index';
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import { generateHomeMetadata } from '@/lib/Metadata';

/**
 * Renders the home page of the application.
 *
 * This component serves as the entry point for the application, displaying the Hero component.
 * It is designed to be a client-side component, allowing for dynamic interactions and rendering.
 *
 * @returns {JSX.Element} The rendered home page component.
 */

export const metadata: Metadata = generateHomeMetadata({
	canonicalUrl: `${website_url}/`
});

/**
 * Renders the application's home page with the main hero section.
 *
 * @returns The JSX markup for the home page.
 */
export default function Home() {
	return (
		<>
			<main>
				<Hero />
			</main>
		</>
	);
}
