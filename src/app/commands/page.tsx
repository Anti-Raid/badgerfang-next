import CommandInterface from '@/components/commands/layout';
import { website_url } from '@/components/common';
import { Metadata } from 'next';
import { generateCommandMetadata } from '@/lib/Metadata';

export const metadata: Metadata = generateCommandMetadata({
	canonicalUrl: `${website_url}/commands`,
});

const Commands = () => {
	return (
		<>
			<main>
				<CommandInterface />
			</main>
		</>
	);
};

export default Commands;
