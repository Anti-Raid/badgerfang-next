import axios from 'axios';
import useSWR from 'swr';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splashtail-staging.antiraid.xyz';

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

const fetcher = async (url: string) => {
	const response = await axiosInstance.get(url);
	return response.data;
};

export const useApiConfig = () => {
	return useSWR<ApiConfig>('/config', fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});
};

export const useBotState = () => {
	return useSWR<BotState>('/bot-state', fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});
};

export const getBotStats = async (): Promise<BotStats> => {
	try {
		const response = await fetch('https://splashtail-staging.antiraid.xyz/bot-stats', {
			next: {
				revalidate: 60
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch bot state');
		}

		return response.json();
	} catch (error) {
		console.error('Error fetching bot stats:', error);
		throw error;
	}
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
