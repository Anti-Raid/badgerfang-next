import * as forumTypes from '@/types/forums/types';
import { api_url } from '@/components/common';
import { ApiConfig } from '@/types/api/bindings/ApiConfig';
import { TwState } from '@/types/api/bindings/TwState';
import { GetStatusResponse } from '@/types/api/bindings/GetStatusResponse';
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
import { queryOptions } from '@tanstack/react-query';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || api_url;
export const FORUM_API_URL = 'https://potsypaw.purrquinox.com';
export const STRAPI_API_URL = 'https://strapi.purrquinox.com';

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

const apiRequest = async <T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> => {
	const { validateStatus, timeout, ...fetchOptions } = options;
	const token = getAuthToken();

	// Build headers object
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
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
			signal: controller?.signal,
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
				throw new Error(
					`Request failed: ${response.statusText} - ${JSON.stringify(errorData)}`
				);
			}
			// Status is valid according to validateStatus - proceed to parse response
		} else {
			// No custom validation - use default behavior (throw on non-2xx)
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					`Request failed: ${response.statusText} - ${JSON.stringify(errorData)}`
				);
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

export const getApiConfig = async (): Promise<ApiConfig> => {
	return apiRequest<ApiConfig>('/config');
};

export const apiConfigOptions = queryOptions({
    queryKey: ['apiConfig'],
    queryFn: getApiConfig
});

export const getBotState = async (): Promise<TwState> => {
	return apiRequest<TwState>('/bot-state');
};

export const botStateOptions = queryOptions({
    queryKey: ['botState'],
    queryFn: getBotState
});

export const getBotStats = async (): Promise<GetStatusResponse> => {
	return apiRequest<GetStatusResponse>('/bot-stats');
};

export const botStatsOptions = queryOptions({
    queryKey: ['botStats'],
    queryFn: getBotStats
});

export const getUserServers = async (refetch: boolean = false): Promise<DashboardGuildData> => {
	const url = refetch ? '/users/@me/guilds?refresh=true' : '/users/@me/guilds';
	return apiRequest<DashboardGuildData>(url);
};

export const userServersOptions = queryOptions({
    queryKey: ['userServers'],
    queryFn: () => getUserServers(false)
});

export const getUserSessions = async (): Promise<UserSessionList> => {
	try {
		const data = await apiRequest<{ sessions: any[] }>('/sessions');
		return {
			sessions: data.sessions.map((session: any) => ({
				...session,
				created_at: new Date(session.created_at).toISOString()
			}))
		};
	} catch (error) {
		console.error('Failed to fetch user sessions:', error);
		throw error;
	}
};

export const userSessionsOptions = queryOptions({
    queryKey: ['userSessions'],
    queryFn: getUserSessions
});

export const revokeSession = async (sessionId: string): Promise<void> => {
	try {
		await apiRequest(`/sessions/${sessionId}`, { method: 'DELETE' });
	} catch (error) {
		console.error('Failed to revoke session:', error);
		throw error;
	}
};

export const createOauth2Session = async (
	req: AuthorizeRequest
): Promise<CreateUserSessionResponse> => {
	try {
		return apiRequest<CreateUserSessionResponse>('/oauth2', {
			method: 'POST',
			body: JSON.stringify(req),
		});
	} catch (error) {
		console.error('Failed to create OAuth2 session:', error);
		throw error;
	}
};

/**
 * Gets the authorized session for the current user. Returns undefined if the user is not authorized or forbidden.
 * @returns AuthorizedSession | undefined
 */
export const getAuthorizedSession = async (): Promise<AuthorizedSession | undefined> => {
	return apiRequest<AuthorizedSession | undefined>('/sessions/@me', {
		validateStatus: (status) => status === 200 || status === 401 || status === 403
	});
};

export const authorizedSessionOptions = queryOptions({
    queryKey: ['session', 'me'],
    queryFn: getAuthorizedSession,
    retry: false
});

export const createSession = async (
	session: CreateUserSession
): Promise<CreateUserSessionResponse> => {
	try {
		return apiRequest<CreateUserSessionResponse>('/sessions', {
			method: 'POST',
			body: JSON.stringify(session),
		});
	} catch (error) {
		console.error('Failed to create session:', error);
		throw error;
	}
};

export const baseGuildUserInfo = async (guildId: string): Promise<BaseGuildUserInfo> => {
	return apiRequest<BaseGuildUserInfo>(`/users/@me/guilds/${guildId}`);
};

export const baseGuildUserInfoOptions = (guildId: string) => queryOptions({
    queryKey: ['guildUserInfo', guildId],
    queryFn: () => baseGuildUserInfo(guildId)
});

export const getSettings = async (
	guildId: string
): Promise<{ [template: string]: ApiDispatchResult<Setting[]> }> => {
	return apiRequest<{ [template: string]: ApiDispatchResult<Setting[]> }>(
		`/guilds/${guildId}/settings`
	);
};

export const settingsOptions = (guildId: string) => queryOptions({
    queryKey: ['guildSettings', guildId],
    queryFn: () => getSettings(guildId)
});

export const executeSettings = async (
	guildId: string,
	payload: any
): Promise<{ [template: string]: ApiDispatchResult<JsonValue> }> => {
	return apiRequest<{ [template: string]: ApiDispatchResult<JsonValue> }>(
		`/guilds/${guildId}/settings`,
		{
			method: 'POST',
			body: JSON.stringify(payload),
		}
	);
};

export const listTemplateShop = async (): Promise<any> => {
	throw new Error('Currently disabled as the template shop is being rethought');
};

export const templateShopOptions = queryOptions({
    queryKey: ['templateShop'],
    queryFn: listTemplateShop
});

export const getTemplateShop = async (id: string): Promise<any | null> => {
	throw new Error('Currently disabled as the template shop is being rethought');

	return apiRequest<any | null>(`/template-shop/${id}`, {
		validateStatus: (status) => status === 200 || status === 404 // Allow 404 for not found
	});
};

export const templateShopItemOptions = (id: string) => queryOptions({
    queryKey: ['templateShop', id],
    queryFn: () => getTemplateShop(id)
});

export const getForumUser = async (tag: string): Promise<forumTypes.users | Error> => {
	return apiRequest<forumTypes.users | Error>(`${FORUM_API_URL}/users/get?tag=${tag}`);
};

export const forumUserOptions = (tag: string) => queryOptions({
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
	return apiRequest<forumTypes.posts[] | Error>(
		`${FORUM_API_URL}/posts/get?post_id=${postId}`
	);
};

export const forumPostOptions = (postId: string) => queryOptions({
    queryKey: ['forumPost', postId],
    queryFn: () => getForumPost(postId)
});

export const listForumUserPosts = async (tag: string): Promise<forumTypes.posts[] | Error> => {
	return apiRequest<forumTypes.posts[] | Error>(
		`${FORUM_API_URL}/users/list_posts?tag=${tag}`
	);
};

export const forumUserPostsOptions = (tag: string) => queryOptions({
    queryKey: ['forumUserPosts', tag],
    queryFn: () => listForumUserPosts(tag)
});

export const fetchStrapiBlogs = async (): Promise<any> => {
	try {
		return await apiRequest<any>(
			`${STRAPI_API_URL}/api/blogs?populate[author][populate]=avatar&populate[image]=true&populate`,
			{
				headers: {
					Authorization: `Bearer 46c2ac374e977304d2ab121cba95e7337d19304bc0e880f5b06376a0c687618644123a3fa20cbc675ae70494e991e92903ad0d02dbf916d0cd40eb72fad1aca4132c9a80556cb5068475673907029497c4eec323b387a33c068e17d834867cb30c3166d5b266987421338a44c4fe05f9753559ae622975ada35a4e9f11f77558`
				},
				timeout: 5000, // Reduced to 5 second timeout
				validateStatus: (status) => status === 200 || status === 304 // Allow 304 Not Modified
			}
		);
	} catch (error) {
		console.error('Error fetching Strapi blogs:', error);

		// If it's a timeout or network error, throw a more specific error
		if (error instanceof Error) {
			if (error.message.includes('timeout')) {
				throw new Error('Strapi API timeout - please try again later');
			}
			if (error.message.includes('429')) {
				throw new Error('Strapi API rate limited - please try again later');
			}
		}

		throw error;
	}
};

export const strapiBlogsOptions = queryOptions({
    queryKey: ['strapiBlogs'],
    queryFn: fetchStrapiBlogs
});

export const fetchStrapiBlogBySlug = async (slug: string): Promise<any> => {
	try {
		const data = await apiRequest<{ data?: any[] }>(
			`${STRAPI_API_URL}/api/blogs?filters[slug][$eq]=${slug}&populate[author][populate]=avatar&populate[image]=true&populate`,
			{
				headers: {
					Authorization: `Bearer 46c2ac374e977304d2ab121cba95e7337d19304bc0e880f5b06376a0c687618644123a3fa20cbc675ae70494e991e92903ad0d02dbf916d0cd40eb72fad1aca4132c9a80556cb5068475673907029497c4eec323b387a33c068e17d834867cb30c3166d5b266987421338a44c4fe05f9753559ae622975ada35a4e9f11f77558`
				},
				timeout: 3000, // Reduced to 3 second timeout for single blog fetch
				validateStatus: (status) => status === 200 || status === 304
			}
		);

		// Return the first (and should be only) blog post
		return data?.data?.[0] || null;
	} catch (error) {
		console.error('Error fetching Strapi blog by slug:', error);

		// If it's a timeout or network error, throw a more specific error
		if (error instanceof Error) {
			if (error.message.includes('timeout')) {
				throw new Error('Strapi API timeout - please try again later');
			}
			if (error.message.includes('429')) {
				throw new Error('Strapi API rate limited - please try again later');
			}
		}

		throw error;
	}
};

export const strapiBlogBySlugOptions = (slug: string) => queryOptions({
    queryKey: ['strapiBlog', slug],
    queryFn: () => fetchStrapiBlogBySlug(slug)
});
