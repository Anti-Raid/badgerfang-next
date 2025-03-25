import useSWR from 'swr';
import axios from 'axios';
import logger from '@/lib/logger';
import { User } from '@/types/splashtail/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splashtail-staging.antiraid.xyz';

// SWR fetcher for users
const userFetcher = async (url: string): Promise<User> => {
	const res = await axios.get(url);
	return res.data;
};

// Hook for getting user data with SWR
export const useUser = (userId: string | undefined) => {
	const { data, error, mutate } = useSWR<User>(
		userId ? `${API_BASE_URL}/users/${userId}` : null,
		userFetcher,
		{
			revalidateOnFocus: false,
			dedupingInterval: 60000, // 1 minute
			onSuccess: (data) => {
				logger.info('User', 'Successfully fetched user data', data.user);
			},
			onError: (err) => {
				logger.error('User', 'Failed to fetch user data', err);
			}
		}
	);

	return {
		user: data,
		isLoading: !error && !data,
		isError: error,
		mutateUser: mutate
	};
};

// Non-hook version for server components or outside React
export const getUser = async (userId: string): Promise<User | null> => {
	try {
		const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
		const userData: User = res.data;
		return userData;
	} catch (error) {
		if (userId) {
			logger.error('Auth', 'Could not find user information from API');
		}
		return null;
	}
};
