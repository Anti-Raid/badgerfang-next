// Imports
import axios from 'axios';
import useSWR from 'swr';
import * as forumTypes from '@/types/forums/types';
import {
	ApiConfig,
	BotState,
	GuildStaffTeam,
	UserSessionList,
	CreateUserSession,
	CreateUserSessionResponse
} from '@/types/splashtail/types';
import { ApiResponse } from '@/types/dashboard/servers';
import { BotStats } from '@/types/bot-stats';

// API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splashtail-staging.antiraid.xyz';
const FORUM_API_URL = 'https://potsypaw.purrquinox.com';

// Auth Token Utility
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

// Axios Setup
const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

axiosInstance.interceptors.request.use((config) => {
	const token = getAuthToken();
	if (token) {
		config.headers.Authorization = `User ${token}`;
	}
	return config;
});

// SWR Fetcher
const fetcher = async (url: string) => {
	const response = await axiosInstance.get(url);
	return response.data;
};

// ========== SplashTail Routes ==========

export const useApiConfig = () =>
	useSWR<ApiConfig>('/config', fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});

export const useBotState = () =>
	useSWR<BotState>('/bot-state', fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});

export const getBotStats = async (): Promise<BotStats> => {
	const { data } = await axiosInstance.get('/bot-stats');
	return data;
};

export const getApiConfig = async (): Promise<ApiConfig> => {
	const response = await axiosInstance.get('/config');
	return response.data;
};

export const getGuildStaffTeam = async (guildId: string): Promise<GuildStaffTeam> => {
	const response = await axiosInstance.get(`/guilds/${guildId}/staff-team`);
	return response.data;
};

export const getBotState = async (): Promise<BotState> => {
	const response = await axiosInstance.get('/bot-state');
	return response.data;
};

export const getUserServers = async (refetch = false): Promise<ApiResponse> => {
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
	await axiosInstance.delete(`/sessions/${sessionId}`);
};

export const createSession = async (
	session: CreateUserSession
): Promise<CreateUserSessionResponse> => {
	const { data } = await axiosInstance.post('/sessions', session);
	return data;
};

export const getUserGuildBaseInfo = async (guildId: string): Promise<any> => {
	const response = await axiosInstance.get(`/users/@me/guilds/${guildId}`);
	return response.data;
};

export const executeSettings = async (guildId: string, payload: any): Promise<any> => {
	const response = await axiosInstance.post(`/guilds/${guildId}/settings`, payload);
	return response.data;
};

export const anonexecuteSettings = async (payload: any): Promise<any> => {
	const response = await axiosInstance.post(`/settings`, payload);
	return response.data;
};

export const anonuserDetails = async (userId: string): Promise<any> => {
	const response = await axiosInstance.get(`/users/${userId}`);
	return response.data;
};

// ========== Forum Routes ==========

export const createForumUser = async (
	name: string,
	userid: string,
	usertag: string,
	bio: string,
	avatar: string
): Promise<boolean | Error> => {
	try {
		const { data } = await axios.post(`${FORUM_API_URL}/users/create`, {
			name,
			userid,
			usertag,
			bio,
			avatar
		});
		return data.success;
	} catch (error) {
		console.error('Failed to create forum user:', error);
		return error as Error;
	}
};

export const getForumUser = async (tag: string): Promise<forumTypes.users | Error> => {
	try {
		const { data } = await axios.get(`${FORUM_API_URL}/users/get?tag=${tag}`);
		return data;
	} catch (error) {
		console.error('Failed to get forum user:', error);
		return error as Error;
	}
};

export const followForumUser = async (
	target: string,
	type: 'follow' | 'unfollow'
): Promise<boolean | Error> => {
	try {
		const { data } = await axios.post(`${FORUM_API_URL}/users/follow`, {
			target,
			type
		});
		return data.success;
	} catch (error) {
		console.error('Failed to follow/unfollow forum user:', error);
		return error as Error;
	}
};

export const listForumUserPosts = async (tag: string): Promise<forumTypes.posts[] | Error> => {
	try {
		const { data } = await axios.get(`${FORUM_API_URL}/users/list_posts?tag=${tag}`);
		return data;
	} catch (error) {
		console.error('Failed to list forum user posts:', error);
		return error as Error;
	}
};

export const listForumPosts = async (): Promise<forumTypes.posts[] | Error> => {
	try {
		const { data } = await axios.get(`${FORUM_API_URL}/posts/list`);
		return data;
	} catch (error) {
		console.error('Failed to list forum posts:', error);
		return error as Error;
	}
};
