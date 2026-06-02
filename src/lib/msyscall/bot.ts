import type { Id } from '../../types/msyscall/types/common';
import type { StateExecResult, StateOp, TenantState } from '../../types/msyscall/types/state';
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
	return { shard_conns: {}, total_guilds: 0, total_users: 0, uptime: 0 };
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
		id: { tenant_type: 'guild', tenant_id: id },
		name,
		data: encode(data)
	});

	if (res.op === 'KhronosValue') {
		return decodePlain(res.data);
	}

	return res;
}

/**
 * Dispatches an event to a tenant.
 */
export async function dispatchTenantEvent(id: Id, name: string, data: any): Promise<any> {
	const res = await opFetcher('Bot', {
		op: 'DispatchEvent',
		id,
		name,
		data: encode(data)
	});

	if (res.op === 'KhronosValue') {
		return decodePlain(res.data);
	}

	return res;
}

/**
 * Fetches blob data from a signed blob payload.
 */
export async function getBlobData(payload: string, signature: string): Promise<any> {
	const res = await opFetcher('Bot', { op: 'GetBlobData', payload, signature });
	if (res.op === 'BlobData') {
		return decodePlain(res.data);
	}
	throw new Error(`Unexpected bot response: ${res.op}`);
}

/**
 * Dispatches an event with admin-only relaxed safety checks.
 */
export async function adminRelaxedDispatchEvent(
	id: Id,
	name: string,
	data: any,
	options: {
		allowNonWebEventNames?: boolean;
		allowSelfEvent?: boolean;
		mockId?: string | null;
	} = {}
): Promise<any> {
	const res = await opFetcher('Bot', {
		op: 'AdminRelaxedDispatchEvent',
		id,
		name,
		data: encode(data),
		allow_non_web_event_names: options.allowNonWebEventNames ?? false,
		allow_self_event: options.allowSelfEvent ?? false,
		mock_id: options.mockId ?? null
	});

	if (res.op === 'KhronosValue') {
		return decodePlain(res.data);
	}

	return res;
}

/**
 * Returns the uncached bot status. Requires a secure/admin context.
 */
export async function adminGetUncachedBotStatus(): Promise<BotStatus> {
	const res = await opFetcher('Bot', { op: 'AdminGetUncachedBotStatus' });
	if (res.op === 'BotStatus') {
		return res.status;
	}
	throw new Error(`Unexpected bot response: ${res.op}`);
}

/**
 * Drops a tenant. Requires a secure/admin context.
 */
export async function adminDropTenant(id: Id): Promise<void> {
	const res = await opFetcher('Bot', { op: 'AdminDropTenant', id });
	if (res.op !== 'Ack') {
		throw new Error(`Unexpected bot response: ${res.op}`);
	}
}

/**
 * Sets tenant moderation flags. Requires a secure/admin context.
 */
export async function adminSetTenantStateModFlags(id: Id, modflags: number): Promise<void> {
	const res = await opFetcher('Bot', { op: 'AdminSetTenantStateModFlags', id, modflags });
	if (res.op !== 'Ack') {
		throw new Error(`Unexpected bot response: ${res.op}`);
	}
}

/**
 * Runs atomic state operations on a tenant. Requires a secure/admin context.
 */
export async function adminState(
	id: Id,
	ops: StateOp[]
): Promise<{ res: StateExecResult[]; new_tenant_state?: TenantState | null }> {
	const res = await opFetcher('Bot', { op: 'AdminState', id, ops });
	if (res.op === 'State') {
		return {
			res: res.res,
			new_tenant_state: res.new_tenant_state
		};
	}
	throw new Error(`Unexpected bot response: ${res.op}`);
}

/**
 * Fetches tenant state. Requires a secure/admin context.
 */
export async function adminFetchTenantState(id: Id): Promise<TenantState> {
	const res = await opFetcher('Bot', { op: 'AdminFetchTenantState', id });
	if (res.op === 'TenantState') {
		return res.ts;
	}
	throw new Error(`Unexpected bot response: ${res.op}`);
}
