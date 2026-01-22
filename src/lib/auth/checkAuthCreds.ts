import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedSessionOptions, getAuthorizedSession } from '../api';
import { AuthorizedSession } from '@/types/api/bindings/AuthorizedSession';

export interface UseAuthCheckResponse {
	authData: AuthorizedSession | undefined;
	isLoading: boolean;
	isError: any;
	isAuthorized: boolean;
	mutateAuth: () => Promise<AuthorizedSession | undefined>;
}

export const useAuthCheck = (): UseAuthCheckResponse => {
	const queryClient = useQueryClient();
	
	const { data, isLoading, error } = useQuery({
		...authorizedSessionOptions,
		refetchOnWindowFocus: false,
		staleTime: 300000, // 5 minutes
		gcTime: 300000, // 5 minutes (formerly cacheTime)
	});

	const mutateAuth = async (): Promise<AuthorizedSession | undefined> => {
		await queryClient.invalidateQueries({ queryKey: ['session', 'me'] });
		const data = queryClient.getQueryData<AuthorizedSession | undefined>(['session', 'me']);
		return data;
	};

	return {
		authData: data,
		isLoading,
		isError: error,
		isAuthorized: data !== undefined,
		mutateAuth
	};
};

// Non-hook version for server components or outside React
export const checkAuthCreds = async (): Promise<AuthorizedSession | undefined> => {
	return getAuthorizedSession();
};
