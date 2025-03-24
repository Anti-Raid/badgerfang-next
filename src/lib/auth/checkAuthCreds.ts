import useSWR from 'swr';
import axios from 'axios';
import logger from '@/lib/logger';
import { CreateUserSessionResponse } from '@/types/splashtail/types';
import { SWRResponse } from 'swr';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splashtail.antiraid.xyz';

export interface AuthData {
	authorized: boolean;
	banned: boolean;
	data: {
		session_id: string;
		perm_limits: string[];
	};
	id: string;
	target_type: string;
}

interface UseAuthCheckResponse {
	authData: AuthData | undefined;
	isLoading: boolean;
	isError: any;
	isAuthorized: boolean;
	isBanned: boolean;
	mutateAuth: () => Promise<AuthData | undefined>;
}

const authFetcher = async (url: string, userId: string, token: string): Promise<AuthData> => {
	const response = await axios.post(url, {
		auth_type: 'User',
		target_id: userId,
		token: token
	});

	return response.data;
};

export const useAuthCheck = (sessionData: CreateUserSessionResponse | null) => {
	const { data, error, mutate }: SWRResponse<AuthData, any> = useSWR(
		sessionData ? [`${API_BASE_URL}/auth/test`, sessionData.user_id, sessionData.token] : null,
		(url: string, userId: string, token: string) => authFetcher(url, userId, token),
		{
			revalidateOnFocus: false,
			dedupingInterval: 300000, // 5 minutes
			onSuccess: () => {
				logger.info('Auth', 'Auth token validated successfully');
			},
			onError: (err: any) => {
				logger.error('Auth', 'Auth token validation failed', err);
			}
		}
	);

	return {
		authData: data,
		isLoading: !error && !data,
		isError: error,
		isAuthorized: data?.authorized || false,
		isBanned: data?.banned || false,
		mutateAuth: mutate
	} as UseAuthCheckResponse;

	return {
		authData: data,
		isLoading: !error && !data,
		isError: error,
		isAuthorized: data?.authorized || false,
		isBanned: data?.banned || false,
		mutateAuth: mutate
	};
};

// Non-hook version for server components or outside React
export const checkAuthCreds = async (
	data: CreateUserSessionResponse
): Promise<AuthData | false> => {
	try {
		const response = await axios.post(`${API_BASE_URL}/auth/test`, {
			auth_type: 'User',
			target_id: data.user_id,
			token: data.token
		});

		logger.info('Auth', 'Auth token is valid!');
		const testAuthData: AuthData = response.data;
		return testAuthData;
	} catch (error: any) {
		if (error.response && error.response.status === 401) {
			return false;
		}
		throw new Error('An error occurred while checking auth credentials');
	}
};
