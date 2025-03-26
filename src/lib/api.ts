import axios from 'axios';
import { ApiConfig, BotState, GuildStaffTeam, UserSessionList, CreateUserSession, CreateUserSessionResponse } from '@/types/splashtail/types';
import useSWR from 'swr';
import { Server } from "@/types/dashboard/servers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splashtail-staging.antiraid.xyz';

const getAuthToken = () => {
	const tokenData = localStorage.getItem('wistala');
	if (!tokenData) {
		return null;
	}
	const { token } = JSON.parse(tokenData);
	return token;
};

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
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

export const getUserServers = async (): Promise<{ guilds: Server[] }> => {
	const response = await axiosInstance.get('/users/@me/guilds?refresh=false');
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

export const createSession = async (session: CreateUserSession): Promise<CreateUserSessionResponse> => {
  try {
    const { data } = await axiosInstance.post('/sessions', session);
    return data;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
};

// New routes
export const getUserGuildBaseInfo = async (guildId: string): Promise<any> => {
	const response = await axiosInstance.get(`/users/@me/guilds/${guildId}`);
	return response.data;
};

export const executeSettings = async (guildId: string, payload: any): Promise<any> => {
	const response = await axiosInstance.post(`/guilds/${guildId}/settings`, payload);
	return response.data;
};
