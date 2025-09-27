import axios from 'axios';
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

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

axiosInstance.interceptors.request.use((config) => {
	const token = getAuthToken();
	if (token) {
		config.headers.Authorization = token;
	}
	return config;
});

export const getApiConfig = async (): Promise<ApiConfig> => {
	const response = await axiosInstance.get('/config');
	return response.data;
};

export const getBotState = async (): Promise<TwState> => {
	const response = await axiosInstance.get('/bot-state');
	return response.data;
};

export const getBotStats = async (): Promise<GetStatusResponse> => {
	const { data } = await axiosInstance.get('/bot-stats');
	return data;
};

export const getUserServers = async (refetch: boolean = false): Promise<DashboardGuildData> => {
	const url = refetch ? '/users/@me/guilds?refresh=true' : '/users/@me/guilds';
	const response = await axiosInstance.get(url);
	return response.data;
};

export const getUserSessions = async (): Promise<UserSessionList> => {
	try {
		const { data } = await axiosInstance.get('/sessions');
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

export const revokeSession = async (sessionId: string): Promise<void> => {
	try {
		await axiosInstance.delete(`/sessions/${sessionId}`);
	} catch (error) {
		console.error('Failed to revoke session:', error);
		throw error;
	}
};

export const createOauth2Session = async (
	req: AuthorizeRequest
): Promise<CreateUserSessionResponse> => {
	try {
		const { data } = await axiosInstance.post('/oauth2', req);
		return data;
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
	const resp = await axiosInstance.get('/sessions/@me', {
		validateStatus: (status) => status === 200 || status === 401 || status == 403
	});

	if (resp.status === 401 || resp.status === 403) {
		return undefined; // Unauthorized or forbidden
	}

	if (resp.status !== 200) {
		throw new Error(`Failed to fetch authorized session: ${resp.statusText}`);
	}

	return resp.data;
};

export const createSession = async (
	session: CreateUserSession
): Promise<CreateUserSessionResponse> => {
	try {
		const { data } = await axiosInstance.post('/sessions', session);
		return data;
	} catch (error) {
		console.error('Failed to create session:', error);
		throw error;
	}
};

export const baseGuildUserInfo = async (guildId: string): Promise<BaseGuildUserInfo> => {
	const response = await axiosInstance.get(`/users/@me/guilds/${guildId}`);
	return response.data;
};

export const getSettings = async (
	guildId: string
): Promise<{ [template: string]: ApiDispatchResult<Setting[]> }> => {
	const response = await axiosInstance.get(`/guilds/${guildId}/settings`);
	if (response.status !== 200) {
		let err = response.data;
		throw new Error(
			`Failed to fetch settings: ${JSON.stringify(err || { error: 'Unknown error' })}`
		);
	}
	return response.data;
};

export const executeSettings = async (
	guildId: string,
	payload: any
): Promise<{ [template: string]: ApiDispatchResult<JsonValue> }> => {
	const response = await axiosInstance.post(`/guilds/${guildId}/settings`, payload);
	return response.data;
};

export const listTemplateShop = async (): Promise<any> => {
	throw new Error('Currently disabled as the template shop is being rethought');
	const response = await axiosInstance.get(`/template-shop`);
	return response.data;
};

export const getTemplateShop = async (id: string): Promise<any | null> => {
	throw new Error('Currently disabled as the template shop is being rethought');

	const response = await axiosInstance.get(`/template-shop/${id}`, {
		validateStatus: (status) => status === 200 || status === 404 // Allow 404 for not found
	});
	if (response.status === 404) {
		return null; // Template not found
	}
	return response.data;
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

export const fetchStrapiBlogs = async (): Promise<any> => {
	try {
		const response = await axios.get(
			`${STRAPI_API_URL}/api/blogs?populate[author][populate]=avatar&populate[image]=true`,
			{
				headers: {
					Authorization: `Bearer 46c2ac374e977304d2ab121cba95e7337d19304bc0e880f5b06376a0c687618644123a3fa20cbc675ae70494e991e92903ad0d02dbf916d0cd40eb72fad1aca4132c9a80556cb5068475673907029497c4eec323b387a33c068e17d834867cb30c3166d5b266987421338a44c4fe05f9753559ae622975ada35a4e9f11f77558`
				},
				timeout: 5000, // Reduced to 5 second timeout
				validateStatus: (status) => status === 200 || status === 304 // Allow 304 Not Modified
			}
		);
		return response.data;
	} catch (error) {
		console.error('Error fetching Strapi blogs:', error);

		// If it's a timeout or network error, throw a more specific error
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
				throw new Error('Strapi API timeout - please try again later');
			}
			if (error.response?.status === 429) {
				throw new Error('Strapi API rate limited - please try again later');
			}
		}

		throw error;
	}
};

export const fetchStrapiBlogBySlug = async (slug: string): Promise<any> => {
	try {
		const response = await axios.get(
			`${STRAPI_API_URL}/api/blogs?filters[slug][$eq]=${slug}&populate[author][populate]=avatar&populate[image]=true`,
			{
				headers: {
					Authorization: `Bearer 46c2ac374e977304d2ab121cba95e7337d19304bc0e880f5b06376a0c687618644123a3fa20cbc675ae70494e991e92903ad0d02dbf916d0cd40eb72fad1aca4132c9a80556cb5068475673907029497c4eec323b387a33c068e17d834867cb30c3166d5b266987421338a44c4fe05f9753559ae622975ada35a4e9f11f77558`
				},
				timeout: 3000, // Reduced to 3 second timeout for single blog fetch
				validateStatus: (status) => status === 200 || status === 304
			}
		);

		// Return the first (and should be only) blog post
		return response.data.data?.[0] || null;
	} catch (error) {
		console.error('Error fetching Strapi blog by slug:', error);

		// If it's a timeout or network error, throw a more specific error
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
				throw new Error('Strapi API timeout - please try again later');
			}
			if (error.response?.status === 429) {
				throw new Error('Strapi API rate limited - please try again later');
			}
		}

		throw error;
	}
};
