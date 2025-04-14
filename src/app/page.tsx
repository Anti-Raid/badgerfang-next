import { Hero } from '@/components/Hero/index';
import {
	description,
} from '@/components/common';
import { Metadata } from "next";

/**
 * Renders the home page of the application.
 *
 * This component serves as the entry point for the application, displaying the Hero component.
 * It is designed to be a client-side component, allowing for dynamic interactions and rendering.
 *
 * @returns {JSX.Element} The rendered home page component.
 */

export const metadata: Metadata = {
	title: "Home | Antiraid",
	description: `${description}`,
};

export default function Home() {
	return (
		<>
			<main>
				<Hero />
			</main>
		</>
	);
}
