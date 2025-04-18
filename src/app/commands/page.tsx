import CommandInterface from '@/components/commands/layout';
import { description } from '@/components/common';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Commands',
	description: `${description}`
};

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
