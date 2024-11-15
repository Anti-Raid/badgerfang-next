import type { Metadata } from 'next';
import { title, description, logo } from '@/components/common';
import { Hero } from '@/components/Hero';

export const metadata: Metadata = {
	title: title,
	description: description,
	icons: [logo, '/favicon.ico']
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
