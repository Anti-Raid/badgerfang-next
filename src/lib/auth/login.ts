import { supportConfig } from '@/lib/data/support';
import { getApiConfig } from '@/lib/api';

export const loginUser = async (): Promise<void> => {
	const state = btoa(window.location.toString());

	const config = await getApiConfig();

	const redirectUrl = supportConfig.invite.no_bot
		.replace('{permissions}', supportConfig.invite.permissions)
		.replace('{client_id}', config.client_id)
		.replace('{redirect_url}', `${window.location.origin}/authorize`)
		.replace('{state}', state);

	window.location.href = redirectUrl;
};
