import * as forumTypes from '../types/forums/types';
import { api_url } from '../components/common';
import { ApiConfig } from '../types/api/bindings/ApiConfig';
import { GetStatusResponse } from '../types/api/bindings/GetStatusResponse';
import { BaseGuildUserInfo } from '../types/api/bindings/BaseGuildUserInfo';
import { UserSessionList } from '../types/api/bindings/UserSessionList';
import { CreateUserSession } from '../types/api/bindings/CreateUserSession';
import { CreateUserSessionResponse } from '../types/api/bindings/CreateUserSessionResponse';
import { ApiDispatchResult } from '../types/api/bindings/ApiDispatchResult';
import { Setting } from '../types/api/bindings/Setting';
import { JsonValue } from '../types/api/bindings/serde_json/JsonValue';
import { AuthorizedSession } from '../types/api/bindings/AuthorizedSession';
import { DashboardGuildData } from '../types/api/bindings/DashboardGuildData';
import { AuthorizeRequest } from '../types/api/bindings/AuthorizeRequest';
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
	BotStatus
} from './msyscall';
import { getSettings as syscallGetSettings, executeSettings as syscallExecuteSettings } from './msyscall/ext';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || api_url;
export const FORUM_API_URL = 'https://potsypaw.purrquinox.com';
export const IMAGE_PROXY_URL = 'https://bytepurr.purrquinox.com';

const fixImageUrl = (url: string | undefined | null): string => {
	if (!url) return '';
	// Replace strapi.purrquinox.com with bytepurr.purrquinox.com
	const fixed = url.replace(/https:\/\/strapi\.purrquinox\.com/g, IMAGE_PROXY_URL);
	// Handle relative paths if any
	if (fixed.startsWith('/uploads')) {
		return `${IMAGE_PROXY_URL}${fixed}`;
	}
	// Case for purrquinox.com/uploads
	if (fixed.startsWith('https://purrquinox.com/uploads')) {
		return fixed.replace('https://purrquinox.com/uploads', `${IMAGE_PROXY_URL}/uploads`);
	}
	return fixed;
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

export { getBotStatus, getBotCommands, getBotConfig };
export const getSettings = syscallGetSettings;
export const executeSettings = syscallExecuteSettings;
export const getUserServers = syscallGetUserGuilds;
export const baseGuildUserInfo = syscallGetGuildInfo;
export const revokeSession = syscallDeleteSession;

export const apiConfigOptions = queryOptions({
	queryKey: ['apiConfig'],
	queryFn: getBotConfig
});

export const botStatusOptions = queryOptions({
	queryKey: ['botStatus'],
	queryFn: getBotStatus
});

export const botCommandsOptions = queryOptions({
	queryKey: ['botCommands'],
	queryFn: getBotCommands
});

export const getBotStats = async (): Promise<GetStatusResponse> => {
	const status = await getBotStatus();
	return {
		shard_conns: status.shard_conns as any,
		total_guilds: status.total_guilds,
		total_users: status.total_users
	};
};

export const botStatsOptions = queryOptions({
	queryKey: ['botStats'],
	queryFn: getBotStats
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

export const listTemplateShop = async (): Promise<any> => {
	console.log('listTemplateShop');
	return [];
};

export const templateShopOptions = queryOptions({
	queryKey: ['templateShop'],
	queryFn: listTemplateShop
});

export const getTemplateShop = async (id: string): Promise<any | null> => {
	console.log('getTemplateShop', id);
	return null;

	return apiRequest<any | null>(`/template-shop/${id}`, {
		validateStatus: (status) => status === 200 || status === 404 // Allow 404 for not found
	});
};

export const templateShopItemOptions = (id: string) =>
	queryOptions({
		queryKey: ['templateShop', id],
		queryFn: () => getTemplateShop(id)
	});

export const getForumUser = async (tag: string): Promise<forumTypes.users | Error> => {
	return apiRequest<forumTypes.users | Error>(`${FORUM_API_URL}/users/get?tag=${tag}`);
};

export const forumUserOptions = (tag: string) =>
	queryOptions({
		queryKey: ['forumUser', tag],
		queryFn: () => getForumUser(tag)
	});

export const listForumPosts = async (): Promise<forumTypes.posts[] | Error> => {
	return apiRequest<forumTypes.posts[] | Error>(`${FORUM_API_URL}/posts/list`);
};

export const forumPostsOptions = queryOptions({
	queryKey: ['forumPosts'],
	queryFn: listForumPosts
});

export const getForumPost = async (postId: string): Promise<forumTypes.posts[] | Error> => {
	return apiRequest<forumTypes.posts[] | Error>(`${FORUM_API_URL}/posts/get?post_id=${postId}`);
};

export const forumPostOptions = (postId: string) =>
	queryOptions({
		queryKey: ['forumPost', postId],
		queryFn: () => getForumPost(postId)
	});

export const listForumUserPosts = async (tag: string): Promise<forumTypes.posts[] | Error> => {
	return apiRequest<forumTypes.posts[] | Error>(`${FORUM_API_URL}/users/list_posts?tag=${tag}`);
};

export const forumUserPostsOptions = (tag: string) =>
	queryOptions({
		queryKey: ['forumUserPosts', tag],
		queryFn: () => listForumUserPosts(tag)
	});

export const fetchStrapiBlogs = async (): Promise<any> => {
	try {
		const response = await fetch(`https://purrquinox.com/api/data/blog/list`, {
			method: 'GET',
			headers: {
				// Avoid Content-Type if possible to prevent preflight if the server doesn't support it
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch blogs: ${response.statusText}`);
		}

		const blogs = await response.json();

		// Apply fixImageUrl to all images and avatars
		const fixedBlogs = (blogs || []).map((blog: any) => ({
			...blog,
			image: fixImageUrl(blog.image),
			author: blog.author ? {
				...blog.author,
				avatar: fixImageUrl(blog.author.avatar)
			} : { name: 'Unknown', avatar: '' }
		}));

		return { data: fixedBlogs };
	} catch (error) {
		console.error('Error fetching blogs:', error);
		throw error;
	}
};

export const strapiBlogsOptions = queryOptions({
	queryKey: ['strapiBlogs'],
	queryFn: fetchStrapiBlogs
});

export const fetchStrapiBlogBySlug = async (slug: string): Promise<any> => {
	try {
		const response = await fetch(`https://purrquinox.com/api/data/blog/get?slug=${slug}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`Failed to fetch blog post: ${response.statusText}`);
		}

		const blog = await response.json();

		if (!blog) return null;

		// Apply fixImageUrl
		return {
			...blog,
			image: fixImageUrl(blog.image),
			author: blog.author ? {
				...blog.author,
				avatar: fixImageUrl(blog.author.avatar)
			} : { name: 'Unknown', avatar: '' }
		};
	} catch (error) {
		console.error('Error fetching blog by slug:', error);
		throw error;
	}
};

export const strapiBlogBySlugOptions = (slug: string) =>
	queryOptions({
		queryKey: ['strapiBlog', slug],
		queryFn: () => fetchStrapiBlogBySlug(slug)
	});
