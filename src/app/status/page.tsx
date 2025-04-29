import React from 'react';
import Status from '@/components/status/Layout';
import { generateAboutMetadata } from '@/lib/Metadata';
import { Metadata } from 'next';
import { website_url } from '@/components/common';

export const metadata: Metadata = generateAboutMetadata({
	canonicalUrl: `${website_url}/status`
});


/**
 * Displays the bot status page with the current status information.
 *
 * Renders the {@link Status} component inside a main section.
 */
function BotStatusPage() {
	return (
		<main>
			<Status />
		</main>
	);
}

export default BotStatusPage;
