import useSWR from 'swr';
import axios from 'axios';
import { SWRResponse } from 'swr';
import { API_BASE_URL, getAuthorizedSession } from '../api';
import { AuthorizedSession } from '@/types/api/bindings/AuthorizedSession';
import { CreateUserSessionResponse } from '@/types/api/bindings/CreateUserSessionResponse';

export interface UseAuthCheckResponse {
	authData: AuthorizedSession | undefined;
	isLoading: boolean;
	isError: any;
	isAuthorized: boolean;
	mutateAuth: () => Promise<AuthorizedSession | undefined>;
}

export const useAuthCheck = () => {
	const { data, error, mutate }: SWRResponse<AuthorizedSession | false, any> = useSWR(
		['@authCheck', API_BASE_URL],
		async (_) => {
			let res = await getAuthorizedSession();
			if (!res) {
				return false; // Not authorized
			}

			return res;
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 300000 // 5 minutes
		}
	);

	if (!data) {
		return {
			authData: undefined,
			isLoading: data === undefined && !error,
			isError: error,
			isAuthorized: data === false,
			mutateAuth: mutate
		};
	}

	return {
		authData: data,
		isLoading: !error && !data,
		isError: error,
		isAuthorized: true,
		mutateAuth: mutate
	};
};

// Non-hook version for server components or outside React
export const checkAuthCreds = async (
	data: CreateUserSessionResponse
): Promise<AuthorizedSession | undefined> => {
	const resp = await axios.get('/sessions/@me', {
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
