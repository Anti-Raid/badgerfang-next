import { decodePlain, encode } from './khronos';
import { BotStatus, BotConfig } from '../../types/msyscall/types/bot';
import { opFetcher } from './index';

/**
 * Returns the bots status
 */
export async function getBotStatus(): Promise<BotStatus> {
	try {
		const res = await opFetcher('Bot', { op: 'GetBotStatus' });
		if (res.op === 'BotStatus') {
			return res.status;
		}
	} catch {
		// Return empty status on error (API unreachable, etc.)
	}
	return { online: 0, servers: 0, users: 0, commands: 0 };
}

/**
 * Returns the bots commands
 */
export async function getBotCommands(): Promise<any[]> {
	try {
		const res = await opFetcher('Bot', { op: 'GetBotCommands' });
		if (res.op === 'CommandList') {
			return res.commands;
		}
	} catch {
		// Return empty list on error
	}
	return [];
}

/**
 * Returns the bots base config
 */
export async function getBotConfig(): Promise<BotConfig> {
	try {
		const res = await opFetcher('Bot', { op: 'GetBotConfig' });
		if (res.op === 'BotConfig') {
			return {
				main_server: res.main_server,
				support_server_invite: res.support_server_invite,
				client_id: res.client_id
			};
		}
	} catch {
		// Return empty config on error
	}
	return { main_server: '', support_server_invite: '', client_id: '' };
}

/**
 * Dispatches an event
 */
export async function dispatchEvent(id: string, name: string, data: any): Promise<any> {
	const res = await opFetcher('Bot', {
		op: 'DispatchEvent',
		id: { type: 'Guild', id: id },
		name,
		data: encode(data)
	});

	if (res.op === 'KhronosValue') {
		return decodePlain(res.data);
	}

	return res;
}
