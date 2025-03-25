import axios from 'axios';
import { ApiConfig, BotState, GuildStaffTeam } from '@/types/splashtail/types';
import useSWR from 'swr';
import { Server } from "@/types/dashboard/servers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splashtail-staging.antiraid.xyz';

const fetcher = async (url: string) => {
	const response = await axios.get(url);
	return response.data;
};

export const useApiConfig = () => {
	return useSWR<ApiConfig>(`${API_BASE_URL}/config`, fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});
};

export const useBotState = () => {
	return useSWR<BotState>(`${API_BASE_URL}/bot-state`, fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	});
};

export const getApiConfig = async (): Promise<ApiConfig> => {
	const response = await axios.get(`${API_BASE_URL}/config`);
	return response.data;
};

export const getGuildStaffTeam = async (guildId: string): Promise<GuildStaffTeam> => {
	const response = await axios.get(`${API_BASE_URL}/guilds/${guildId}/staff-team`);
	return response.data;
};

export const getBotState = async (): Promise<BotState> => {
	const response = await axios.get(`${API_BASE_URL}/bot-state`);
	return response.data;
};

export const getUserServers = async (): Promise<{ guilds: Server[] }> => {
	const tokenData = localStorage.getItem('wistala');
	if (!tokenData) {
		throw new Error('API token not found in local storage');
	}

	const { token } = JSON.parse(tokenData);

	const response = await axios.get(`${API_BASE_URL}/users/@me/guilds?refresh=false`, {
		headers: {
			Authorization: `User ${token}`, // Ensure correct format
		},
	});
	return response.data;
};

