import axios from 'axios';
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
import * as forumTypes from '@/types/forums/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splashtail-staging.antiraid.xyz';
const FORUM_API_URL = 'https://potsypaw.purrquinox.com';
const STRAPI_API_URL = 'https://strapi.purrquinox.com'

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
		config.headers.Authorization = `User ${token}`;
	}
	return config;
});

export const getApiConfig = async (): Promise<ApiConfig> => {
	const response = await axiosInstance.get('/config');
	return response.data;
};

export const getBotState = async (): Promise<BotState> => {
	const response = await axiosInstance.get('/bot-state');
	return response.data;
};

export const getBotStats = async (): Promise<BotStats> => {
	const { data } = await axiosInstance.get('/bot-stats');
	return data;
};

export const getGuildStaffTeam = async (guildId: string): Promise<GuildStaffTeam> => {
	const response = await axiosInstance.get(`/guilds/${guildId}/staff-team`);
	return response.data;
};

export const getUserServers = async (refetch: boolean = false): Promise<ApiResponse> => {
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
		const response = await axios.get(
			`${STRAPI_API_URL}/api/blogs?populate[author][populate]=avatar&populate[image]=true`,
			{
				headers: {
					Authorization: `Bearer 17f20a5f7c6d039fe839e38c944d7d435b41ba3968f389df28725652c4e6e10779f7c9fd4f146554ab86a967e81a90dec350ab1f348ffc9582115aacab3e4bb29ed36e49f2e218ea9a7978369ff2f27cb175c9fb560cb46534ff2c83f2e32bfff208fd43b468e557125dba1ccb4761b18b5b4bab84ff655a1d3cb921591bfe7d`
				}
			}
		);
		return response.data;
};
