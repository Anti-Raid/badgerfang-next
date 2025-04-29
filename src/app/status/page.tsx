import React, { useEffect, useState } from 'react';
import Status from '@/components/status/Layout';
import { getBotStats } from '@/lib/api';
import { generateAboutMetadata } from '@/lib/Metadata';
import { Metadata } from 'next';
import { website_url } from '@/components/common';

export const metadata: Metadata = generateAboutMetadata({
	canonicalUrl: `${website_url}/status`
});


/**
 * BotStatusPage component.
 *
 * This component fetches and displays the status of the bot.
 * It uses the {@link Status} component to render the status information.
 */
function BotStatusPage() {
	return (
		<main>
			<Status />
		</main>
	);
}

export default BotStatusPage;
