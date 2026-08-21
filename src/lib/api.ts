import axios from 'axios';
import * as forumTypes from '@/types/forums/types';
import { api_url, main_server_id } from '@/components/common';
import { ApiConfig } from '@/types/api/bindings/ApiConfig';
import { TwState } from '@/types/api/bindings/TwState';
import { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
import { UserSessionList } from '@/types/api/bindings/UserSessionList';
import { CreateUserSession } from '@/types/api/bindings/CreateUserSession';
import { CreateUserSessionResponse } from '@/types/api/bindings/CreateUserSessionResponse';
import { AuthorizedSession } from '@/types/api/bindings/AuthorizedSession';
import { DashboardGuildData } from '@/types/api/bindings/DashboardGuildData';
import { AuthorizeRequest } from '@/types/api/bindings/AuthorizeRequest';
import { BlogPost } from '@/types/blogs';

import { msyscall, errorString } from '@/lib/msyscall';
import type { MSyscallArgs, MSyscallRet } from '@/lib/msyscall/syscall';
import {
	encode,
	dexpand,
	expand,
	type RawKhronosValue,
	type EncodableKhronosValue
} from '@/lib/msyscall/khronosvalue';
import type {
	BaseGuildUserInfo,
	PartialMember,
	PartialUser as MsPartialUser
} from '@/lib/msyscall/types/discord';
import type { PartialUser } from '@/types/api/bindings/PartialUser';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || api_url;
export const FORUM_API_URL = 'https://potsypaw.purrquinox.com';
export const BLOG_API_URL = 'https://purrquinox.com';

/**
 * Reads the raw session token used to authenticate msyscall requests.
 *
 * The login flow stores a {@link CreateUserSessionResponse} under the `wistala`
 * localStorage key; the msyscall API expects that token verbatim in the
 * `Authorization` header (no `Bearer` prefix).
 */
const getAuthToken = (): string | undefined => {
	if (typeof window === 'undefined') return undefined;
	try {
		const tokenData = localStorage.getItem('wistala');
		if (!tokenData) return undefined;
		const { token } = JSON.parse(tokenData) as CreateUserSessionResponse;
		return token || undefined;
	} catch {
		return undefined;
	}
};

const getStoredCreds = (): CreateUserSessionResponse | null => {
	if (typeof window === 'undefined') return null;
	try {
		const tokenData = localStorage.getItem('wistala');
		return tokenData ? (JSON.parse(tokenData) as CreateUserSessionResponse) : null;
	} catch {
		return null;
	}
};

/**
 * Normalizes an msyscall PartialUser (optional fields) to the binding shape
 * (explicit `| null`) used across the site.
 */
const toPartialUser = (user: MsPartialUser | null | undefined): PartialUser | null => {
	if (!user) return null;
	return {
		id: user.id,
		username: user.username,
		global_name: user.global_name ?? null,
		avatar: user.avatar ?? null
	};
};

/**
 * Performs an msyscall, returning the successful payload or throwing a
 * human-readable error (mirrors willow's `stringifyAndThrow(errorString)`).
 */
const callMsyscall = async (args: MSyscallArgs): Promise<MSyscallRet> => {
	const res = await msyscall(API_BASE_URL, getAuthToken(), args);
	return res.stringifyAndThrow(errorString);
};

export const getApiConfig = async (): Promise<ApiConfig> => {
	const ret = await callMsyscall({ op: 'Bot', req: { op: 'GetBotConfig' } });
	if (ret.op !== 'Bot' || ret.data.op !== 'BotConfig') {
		throw new Error('msyscall did not return a BotConfig');
	}
	return {
		// The msyscall API no longer surfaces the main server id; sourced from config.
		main_server: main_server_id,
		support_server_invite: ret.data.support_server_invite,
		client_id: ret.data.client_id
	};
};

export const getBotState = async (): Promise<TwState> => {
	const ret = await callMsyscall({ op: 'Bot', req: { op: 'GetBotCommands' } });
	if (ret.op !== 'Bot' || ret.data.op !== 'CommandList') {
		throw new Error('msyscall did not return a CommandList');
	}
	return { commands: ret.data.commands };
};

export const getBotStats = async (): Promise<GetStatusResponse> => {
	const ret = await callMsyscall({ op: 'Bot', req: { op: 'GetBotStatus' } });
	if (ret.op !== 'Bot' || ret.data.op !== 'BotStatus') {
		throw new Error('msyscall did not return a BotStatus');
	}
	const { status } = ret.data;
	// The msyscall shard conn only carries `status` + `latency`; the legacy status
	// UI expects `real_latency` and a few per-shard counters that are no longer
	// provided, so default them to 0.
	const shard_conns: GetStatusResponse['shard_conns'] = {};
	for (const [key, conn] of Object.entries(status.shard_conns)) {
		shard_conns[Number(key)] = {
			status: conn.status,
			real_latency: conn.latency,
			guilds: 0,
			uptime: 0,
			total_uptime: 0
		};
	}
	return {
		shard_conns,
		total_guilds: status.total_guilds,
		total_users: status.total_users
	};
};

export const getUserServers = async (refetch: boolean = false): Promise<DashboardGuildData> => {
	const ret = await callMsyscall({
		op: 'Discord',
		req: { op: 'GetUserGuilds', refresh: refetch }
	});
	if (ret.op !== 'Discord' || ret.data.op !== 'UserGuilds') {
		throw new Error('msyscall did not return UserGuilds');
	}
	const { guilds, guilds_exist } = ret.data.data;
	// Legacy shape exposes `bot_in_guilds` (ids); msyscall returns a parallel
	// boolean array `guilds_exist`.
	const bot_in_guilds = guilds.filter((_, i) => guilds_exist[i]).map((g) => g.id);
	return {
		guilds: guilds.map((g) => ({
			id: g.id,
			name: g.name,
			icon: g.icon ?? null,
			permissions: g.permissions
		})),
		bot_in_guilds
	};
};

export const getUserSessions = async (): Promise<UserSessionList> => {
	const ret = await callMsyscall({ op: 'Auth', req: { op: 'GetUserSessions' } });
	if (ret.op !== 'Auth' || ret.data.op !== 'UserSessions') {
		throw new Error('msyscall did not return UserSessions');
	}
	return {
		sessions: ret.data.sessions.map((session) => ({
			id: session.id,
			name: session.name ?? null,
			user_id: session.user_id,
			type: session.type,
			expiry: session.expiry,
			created_at: new Date(session.created_at).toISOString()
		}))
	};
};

export const revokeSession = async (sessionId: string): Promise<void> => {
	await callMsyscall({ op: 'Auth', req: { op: 'DeleteSession', session_id: sessionId } });
};

export const createOauth2Session = async (
	req: AuthorizeRequest
): Promise<CreateUserSessionResponse> => {
	const ret = await callMsyscall({
		op: 'Auth',
		req: { op: 'CreateLoginSession', code: req.code, redirect_uri: req.redirect_uri }
	});
	if (ret.op !== 'Auth' || ret.data.op !== 'CreatedSession') {
		throw new Error('msyscall did not return a CreatedSession');
	}
	const { session, token, user } = ret.data;
	return {
		user_id: session.user_id,
		token,
		session_id: session.id,
		expiry: session.expiry,
		user: toPartialUser(user)
	};
};

/**
 * Gets the authorized session for the current user. Returns undefined if the
 * user is not authorized. The msyscall API has no dedicated "who am I" call, so
 * (like willow) a successful authenticated call is used as the authorization
 * signal and the response is synthesized from the stored credentials.
 */
export const getAuthorizedSession = async (): Promise<AuthorizedSession | undefined> => {
	const creds = getStoredCreds();
	if (!creds?.token) return undefined;

	const res = await msyscall(API_BASE_URL, creds.token, {
		op: 'Auth',
		req: { op: 'GetUserSessions' }
	});

	if (!res.ok) {
		const err = res.unwrapErr();
		if (
			err.op === 'Unauthorized' ||
			err.op === 'ContextRequiresUser' ||
			err.op === 'ContextRequiresOauth' ||
			err.op === 'UserOauth2Needed'
		) {
			return undefined;
		}
		throw new Error(errorString(err));
	}

	return {
		user_id: creds.user_id,
		id: creds.session_id,
		state: 'active',
		type: 'login'
	};
};

export const createSession = async (
	session: CreateUserSession
): Promise<CreateUserSessionResponse> => {
	const ret = await callMsyscall({
		op: 'Auth',
		req: { op: 'CreateApiSession', name: session.name, expiry: session.expiry }
	});
	if (ret.op !== 'Auth' || ret.data.op !== 'CreatedSession') {
		throw new Error('msyscall did not return a CreatedSession');
	}
	const { session: created, token, user } = ret.data;
	return {
		user_id: created.user_id,
		token,
		session_id: created.id,
		expiry: created.expiry,
		user: toPartialUser(user)
	};
};

export const baseGuildUserInfo = async (guildId: string): Promise<BaseGuildUserInfo> => {
	const ret = await callMsyscall({
		op: 'Discord',
		req: { op: 'GetGuildInfo', guild_id: guildId }
	});
	if (ret.op !== 'Discord' || ret.data.op !== 'GuildInfo') {
		throw new Error('msyscall did not return GuildInfo');
	}
	return ret.data.data;
};

export const searchGuildMembers = async (
	guildId: string,
	name: string
): Promise<PartialMember[]> => {
	const ret = await callMsyscall({
		op: 'Discord',
		req: { op: 'SearchGuildMembers', guild_id: guildId, name }
	});
	if (ret.op !== 'Discord' || ret.data.op !== 'GuildMembers') {
		throw new Error('msyscall did not return GuildMembers');
	}
	return ret.data.data;
};

/**
 * Dispatches a `WebSettings` event (settings-v2) to a guild and returns the
 * decoded Khronos value response. Mirrors willow's `auth.dispatchEvent(...,
 * compressed=true)`.
 */
export const dispatchWebSettings = async (
	guildId: string,
	event: EncodableKhronosValue
): Promise<RawKhronosValue> => {
	const ret = await callMsyscall({
		op: 'Bot',
		req: {
			op: 'DispatchCEvent',
			id: { type: 'Guild', id: guildId },
			name: 'WebSettings',
			data: dexpand(encode(event))
		}
	});
	if (
		ret.op !== 'Bot' ||
		(ret.data.op !== 'KhronosValue' && ret.data.op !== 'CKhronosValue')
	) {
		throw new Error('msyscall did not return a Khronos value');
	}
	return ret.data.op === 'CKhronosValue' ? expand(ret.data.data) : ret.data.data;
};

export const listTemplateShop = async (): Promise<any> => {
	throw new Error('Currently disabled as the template shop is being rethought');
};

export const getTemplateShop = async (_id: string): Promise<any | null> => {
	throw new Error('Currently disabled as the template shop is being rethought');
};

export const getForumUser = async (tag: string): Promise<forumTypes.users | Error> => {
	const response = await axios.get(`${FORUM_API_URL}/users/get?tag=${tag}`);
	return response.data;
};

export const listForumPosts = async (): Promise<forumTypes.posts[] | Error> => {
	const response = await axios.get(`${FORUM_API_URL}/posts/list`);
	return response.data;
};

export const getForumPost = async (postId: string): Promise<forumTypes.posts[] | Error> => {
	const response = await axios.get(`${FORUM_API_URL}/posts/get?post_id=${postId}`);
	return response.data;
};

export const listForumUserPosts = async (tag: string): Promise<forumTypes.posts[] | Error> => {
	const response = await axios.get(`${FORUM_API_URL}/users/list_posts?tag=${tag}`);
	return response.data;
};

export const fetchBlogs = async (): Promise<BlogPost[]> => {
	try {
		const response = await axios.get<BlogPost[]>(`${BLOG_API_URL}/api/data/blog/list`, {
			timeout: 5000,
			validateStatus: (status) => status === 200 || status === 304
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching  blogs:', error);

		// If it's a timeout or network error, throw a more specific error
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
				throw new Error('API timeout - please try again later');
			}
			if (error.response?.status === 429) {
				throw new Error('API rate limited - please try again later');
			}
		}

		throw error;
	}
};

export const fetchBlogBySlug = async (slug: string): Promise<BlogPost | null> => {
	try {
		const response = await axios.get<BlogPost>(`${BLOG_API_URL}/api/data/blog/get?slug=${slug}`, {
			timeout: 3000,
			validateStatus: (status) => status === 200 || status === 304
		});
		return response.data || null;
	} catch (error) {
		console.error('Error fetching  blog by slug:', error);

		// If it's a timeout or network error, throw a more specific error
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
				throw new Error('API timeout - please try again later');
			}
			if (error.response?.status === 429) {
				throw new Error('API rate limited - please try again later');
			}
		}

		throw error;
	}
};
