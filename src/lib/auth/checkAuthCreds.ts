import useSWR from 'swr';
import axios from 'axios';
import logger from '@/lib/logger';
import { CreateUserSessionResponse } from '@/types/gosdk/types';
import { SWRResponse } from 'swr';
import { API_BASE_URL } from '../api';

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

const authFetcher = async (
	url: string,
	payload: { auth_type: string; target_id: string; token: string }
): Promise<AuthData> => {
	const response = await axios.post(url, payload);
	return response.data;
};

export const useAuthCheck = (sessionData: CreateUserSessionResponse | null) => {
	const { data, error, mutate }: SWRResponse<AuthData, any> = useSWR(
		sessionData ? `${API_BASE_URL}/auth/test` : null,
		(url) =>
			authFetcher(url, {
				auth_type: 'User',
				target_id: sessionData!.user_id,
				token: sessionData!.token
			}),
		{
			revalidateOnFocus: false,
			dedupingInterval: 300000 // 5 minutes
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
