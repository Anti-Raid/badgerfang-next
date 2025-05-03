import React from 'react';
import Status from '@/components/status/Layout';
import { generateStatusMetadata } from '@/lib/Metadata';
import { Metadata } from 'next';
import { website_url } from '@/components/common';

export const metadata: Metadata = generateStatusMetadata({
	canonicalUrl: `${website_url}/status`
});


/**
 * Renders the bot status page.
 *
 * Displays the {@link Status} component within a main container.
 */
function BotStatusPage() {
	return (
		<main>
			<Status />
		</main>
	);
}

export default BotStatusPage;
