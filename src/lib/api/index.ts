import type { posts, users } from '@/types/forums/types';
import { api_url } from '@/components/common';
import { ApiConfig } from '@/types/api/bindings/ApiConfig';
import { BaseGuildUserInfo } from '@/types/api/bindings/BaseGuildUserInfo';
import { UserSessionList } from '@/types/api/bindings/UserSessionList';
import { CreateUserSession } from '@/types/api/bindings/CreateUserSession';
import { CreateUserSessionResponse } from '@/types/api/bindings/CreateUserSessionResponse';
import { ApiDispatchResult } from '@/types/api/bindings/ApiDispatchResult';
import { Setting } from '@/types/api/bindings/Setting';
import { JsonValue } from '@/types/api/bindings/serde_json/JsonValue';
import { AuthorizedSession } from '@/types/api/bindings/AuthorizedSession';
import { DashboardGuildData } from '@/types/api/bindings/DashboardGuildData';
import { AuthorizeRequest } from '@/types/api/bindings/AuthorizeRequest';
import type { PartialGlobalKv } from '@/types/msyscall/types/gkv';
import type { ScriptShopTemplate } from '@/types/script/shop';
import { queryOptions } from '@tanstack/react-query';
import {
	getBotConfig,
	getBotStatus,
	getBotCommands,
	getUserGuilds as syscallGetUserGuilds,
	getUserSessions as syscallGetUserSessions,
	deleteSession as syscallDeleteSession,
	createLoginSession,
	getAuthorizedSession as syscallGetAuthorizedSession,
	getGuildInfo as syscallGetGuildInfo,
	createApiSession,
	BotStatus,
	findGlobalKvs,
	getGlobalKv
} from '@/lib/msyscall';
import { getSettings as syscallGetSettings, executeSettings as syscallExecuteSettings } from '@/lib/msyscall/ext';
import { decode, MemoryVfs } from '@/lib/msyscall/khronos';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || api_url;
export const FORUM_API_URL = 'https://potsypaw.purrquinox.com';

const TEMPLATE_SHOP_SCOPES = ['template_shop', 'template-shop', 'templates'];
const APPROVED_REVIEW_STATES = new Set(['approved', 'public']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const decodeMaybeKhronos = (value: unknown): unknown => {
	if (!isRecord(value)) return value;
	const rawKeys = [
		'Text',
		'Integer',
		'Int64',
		'Float',
		'Boolean',
		'Buffer',
		'Vector',
		'Map',
		'List',
		'Timestamptz',
		'Interval',
		'TimeZone',
		'MemoryVfs',
		'Null'
	];
	if (!rawKeys.some((key) => key in value)) return value;

	try {
		return decode(value as any);
	} catch {
		return value;
	}
};

const toPlainRecord = (value: unknown): Record<string, unknown> => {
	const decoded = decodeMaybeKhronos(value);
	if (decoded instanceof MemoryVfs) return decoded.map;
	if (decoded instanceof Map) return Object.fromEntries(decoded.entries());
	if (isRecord(decoded)) return decoded;
	return {};
};

const toStringArray = (value: unknown): string[] => {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string');
};

const normalizeTemplateContent = (
	record: PartialGlobalKv,
	metadata: Record<string, unknown>
): Record<string, string> => {
	const data = toPlainRecord(record.data);
	const metadataContent = toPlainRecord(metadata.content);
	const content = Object.keys(data).length > 0 ? data : metadataContent;
	const files = Object.fromEntries(
		Object.entries(content).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
	);

	if (Object.keys(files).length > 0) return files;

	return {
		'README.md': record.long || record.short || 'No public template content is available for this entry.'
	};
};

const templateId = (key: string, version: number): string => `${key}#${version}`;

const parseTemplateId = (id: string): { key: string; version?: number } => {
	const splitAt = id.lastIndexOf('#');
	if (splitAt === -1) return { key: id };
	const version = Number(id.slice(splitAt + 1));
	if (!Number.isFinite(version)) return { key: id };
	return { key: id.slice(0, splitAt), version };
};

const normalizeGlobalKvTemplate = (record: PartialGlobalKv): ScriptShopTemplate => {
	const metadata = toPlainRecord(record.public_metadata);
	const name = typeof metadata.name === 'string' ? metadata.name : record.key;
	const tags = toStringArray(metadata.tags);
	const content = normalizeTemplateContent(record, metadata);

	return {
		id: templateId(record.key, record.version),
		key: record.key,
		name,
		version: String(record.version),
		description: record.short,
		short: record.short,
		long: record.long,
		tags,
		owner_guild: record.owner_id,
		owner_id: record.owner_id,
		owner_type: record.owner_type,
		price: record.price,
		review_state: record.review_state,
		created_at: record.created_at,
		last_updated_at: record.last_updated_at,
		content
	};
};

const isApprovedTemplate = (record: PartialGlobalKv): boolean =>
	APPROVED_REVIEW_STATES.has(record.review_state.toLowerCase());

const fetchTemplateRecords = async (query: string): Promise<PartialGlobalKv[]> => {
	const settled = await Promise.allSettled(
		TEMPLATE_SHOP_SCOPES.map((scope) => findGlobalKvs(scope, query))
	);
	const records = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
	if (records.length > 0) return records;

	const firstError = settled.find((result) => result.status === 'rejected');
	if (firstError?.status === 'rejected') {
		console.warn('Template shop scopes failed; returning empty list.', firstError.reason);
	}
	return [];
};

const fetchTemplateRecord = async (
	key: string,
	version: number
): Promise<PartialGlobalKv | null> => {
	const settled = await Promise.allSettled(
		TEMPLATE_SHOP_SCOPES.map((scope) => getGlobalKv(scope, key, version))
	);
	const record = settled.find(
		(result): result is PromiseFulfilledResult<PartialGlobalKv> =>
			result.status === 'fulfilled' && result.value !== null
	)?.value;
	if (record) return record;

	const firstError = settled.find((result) => result.status === 'rejected');
	if (firstError?.status === 'rejected') {
		console.warn('Template shop item lookup failed across all scopes.', firstError.reason);
	}
	return null;
};


const getAuthToken = (): string | null => {
	if (typeof window !== 'undefined') {
		const tokenData = localStorage.getItem('wistala');
		if (tokenData) {
			const { token } = JSON.parse(tokenData);
			return token;
		}
	}
	return null;
};

interface FetchOptions extends RequestInit {
	validateStatus?: (status: number) => boolean;
	timeout?: number;
}

const apiRequest = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
	const { validateStatus, timeout, ...fetchOptions } = options;
	const token = getAuthToken();

	// Build headers object
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	// Merge existing headers if provided
	if (fetchOptions.headers) {
		if (fetchOptions.headers instanceof Headers) {
			fetchOptions.headers.forEach((value, key) => {
				headers[key] = value;
			});
		} else if (Array.isArray(fetchOptions.headers)) {
			fetchOptions.headers.forEach(([key, value]) => {
				headers[key] = value;
			});
		} else {
			Object.assign(headers, fetchOptions.headers);
		}
	}

	if (token) {
		headers.Authorization = token;
	}

	const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

	// Handle timeout with AbortController
	let controller: AbortController | undefined;
	let timeoutId: NodeJS.Timeout | undefined;

	if (timeout) {
		controller = new AbortController();
		timeoutId = setTimeout(() => controller!.abort(), timeout);
	}

	try {
		const response = await fetch(url, {
			...fetchOptions,
			headers,
			signal: controller?.signal
		});

		// Clear timeout if request completed
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// Handle custom status validation
		if (validateStatus) {
			if (!validateStatus(response.status)) {
				// Status validation failed - handle specific status codes
				if (response.status === 401 || response.status === 403) {
					return undefined as T;
				}
				if (response.status === 404) {
					return null as T;
				}
				// For other invalid statuses, try to get error data
				const errorData = await response.json().catch(() => ({}));
				throw new Error(`Request failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
			}
			// Status is valid according to validateStatus - proceed to parse response
		} else {
			// No custom validation - use default behavior (throw on non-2xx)
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(`Request failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
			}
		}

		// Handle empty responses or non-JSON responses
		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
			// For 204 No Content or empty responses, return undefined
			if (response.status === 204 || response.status === 304) {
				return undefined as T;
			}
			// Try to parse anyway, might be JSON with wrong content-type
		}

		// Parse and return JSON response
		const text = await response.text();
		if (!text) {
			return undefined as T;
		}
		return JSON.parse(text);
	} catch (error) {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new Error('Request timeout - please try again later');
			}
			if (error.message.includes('timeout')) {
				throw new Error('Request timeout - please try again later');
			}
		}

		throw error;
	}
};

import { getBotStatusFn, getBotConfigFn, getBotCommandsFn } from './bot';

export { getBotStatus, getBotCommands, getBotConfig };
export const getApiConfig = async (): Promise<ApiConfig> => getBotConfigFn();
export const getSettings = syscallGetSettings;
export const executeSettings = syscallExecuteSettings;
export const getUserServers = syscallGetUserGuilds;
export const baseGuildUserInfo = syscallGetGuildInfo;
export const revokeSession = syscallDeleteSession;

export const apiConfigOptions = queryOptions({
	queryKey: ['apiConfig'],
	queryFn: () => getBotConfigFn()
});

export const botStatusOptions = queryOptions({
	queryKey: ['botStatus'],
	queryFn: () => getBotStatusFn()
});

export const botCommandsOptions = queryOptions({
	queryKey: ['botCommands'],
	queryFn: () => getBotCommandsFn()
});

export const getBotStats = async (): Promise<BotStatus> => getBotStatusFn();

export const botStatsOptions = queryOptions({
	queryKey: ['botStats'],
	queryFn: () => getBotStatusFn()
});

export const userServersOptions = queryOptions({
	queryKey: ['userServers'],
	queryFn: () => getUserServers(false)
});

export const getUserSessions = async (): Promise<UserSessionList> => {
	const sessions = await syscallGetUserSessions();
	return {
		sessions: sessions.map((s) => ({
			user_id: s.user_id,
			token: '',
			session_id: s.id,
			expiry: s.expiry,
			created_at: s.created_at,
			type: s.type
		})) as any
	};
};

export const userSessionsOptions = queryOptions({
	queryKey: ['userSessions'],
	queryFn: getUserSessions
});

export const createOauth2Session = async (
	req: AuthorizeRequest
): Promise<CreateUserSessionResponse> => {
	const res = await createLoginSession(req.code, req.redirect_uri, req.code_verifier);
	return {
		user_id: res.session.user_id,
		token: res.token,
		session_id: res.session.id,
		expiry: res.session.expiry,
		user: res.user as any
	};
};

/**
 * Gets the authorized session for the current user. Returns undefined if the user is not authorized or forbidden.
 * @returns AuthorizedSession | undefined
 */
export const getAuthorizedSession = async (): Promise<AuthorizedSession | undefined> => {
	return (await syscallGetAuthorizedSession()) as any;
};

export const authorizedSessionOptions = queryOptions({
	queryKey: ['session', 'me'],
	queryFn: getAuthorizedSession,
	retry: false
});

export const createSession = async (
	session: CreateUserSession
): Promise<CreateUserSessionResponse> => {
	const res = await createApiSession(session.name, session.expiry);
	return {
		user_id: res.session.user_id,
		token: res.token,
		session_id: res.session.id,
		expiry: res.session.expiry,
		user: null
	};
};

export const baseGuildUserInfoOptions = (guildId: string) =>
	queryOptions({
		queryKey: ['guildUserInfo', guildId],
		queryFn: () => baseGuildUserInfo(guildId)
	});

export const settingsOptions = (guildId: string) =>
	queryOptions({
		queryKey: ['guildSettings', guildId],
		queryFn: () => getSettings(guildId)
	});

export const listTemplateShop = async (): Promise<ScriptShopTemplate[]> => {
	const records = await fetchTemplateRecords('%');
	const latestByKey = new Map<string, PartialGlobalKv>();

	for (const record of records.filter(isApprovedTemplate)) {
		const existing = latestByKey.get(record.key);
		if (!existing || record.version > existing.version) {
			latestByKey.set(record.key, record);
		}
	}

	return Array.from(latestByKey.values())
		.sort(
			(a, b) =>
				new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime()
		)
		.map(normalizeGlobalKvTemplate);
};

export const templateShopOptions = queryOptions({
	queryKey: ['templateShop'],
	queryFn: listTemplateShop
});

export const getTemplateShop = async (id: string): Promise<ScriptShopTemplate | null> => {
	const parsed = parseTemplateId(id);

	if (parsed.version !== undefined) {
		const record = await fetchTemplateRecord(parsed.key, parsed.version);
		return record && isApprovedTemplate(record) ? normalizeGlobalKvTemplate(record) : null;
	}

	const records = await fetchTemplateRecords(parsed.key);
	const latest = records
		.filter((record) => record.key === parsed.key && isApprovedTemplate(record))
		.sort((a, b) => b.version - a.version)[0];

	return latest ? normalizeGlobalKvTemplate(latest) : null;
};

export const templateShopItemOptions = (id: string) =>
	queryOptions({
		queryKey: ['templateShop', id],
		queryFn: () => getTemplateShop(id)
	});

export const getForumUser = async (tag: string): Promise<users | Error> => {
	return apiRequest<users | Error>(`${FORUM_API_URL}/users/get?tag=${tag}`);
};

export const forumUserOptions = (tag: string) =>
	queryOptions({
		queryKey: ['forumUser', tag],
		queryFn: () => getForumUser(tag)
	});

export const listForumPosts = async (): Promise<posts[] | Error> => {
	return apiRequest<posts[] | Error>(`${FORUM_API_URL}/posts/list`);
};

export const forumPostsOptions = queryOptions({
	queryKey: ['forumPosts'],
	queryFn: listForumPosts
});

export const getForumPost = async (postId: string): Promise<posts[] | Error> => {
	return apiRequest<posts[] | Error>(`${FORUM_API_URL}/posts/get?post_id=${postId}`);
};

export const forumPostOptions = (postId: string) =>
	queryOptions({
		queryKey: ['forumPost', postId],
		queryFn: () => getForumPost(postId)
	});

export const listForumUserPosts = async (tag: string): Promise<posts[] | Error> => {
	return apiRequest<posts[] | Error>(`${FORUM_API_URL}/users/list_posts?tag=${tag}`);
};

export const forumUserPostsOptions = (tag: string) =>
	queryOptions({
		queryKey: ['forumUserPosts', tag],
		queryFn: () => listForumUserPosts(tag)
	});

export { fetchStrapiBlogs, fetchStrapiBlogBySlug, strapiBlogsOptions, strapiBlogBySlugOptions } from './blog';
