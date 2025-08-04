import { CreateUserSessionResponse } from '@/types/api/bindings/CreateUserSessionResponse';
import logger from '../logger';

export const getAuthCreds = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	let token = localStorage.getItem('wistala');

	let data: CreateUserSessionResponse | null = null;

	if (token) {
		try {
			data = JSON.parse(token);
			if (data?.expiry) {
				let expiry = new Date(data.expiry);
				let current = new Date();
				if (expiry < current) {
					logger.info('Auth', 'Auth data expired');
					localStorage.removeItem('wistala');
					return null;
				}
			}

			if (!data?.user_id || !data?.token) {
				return null;
			}

			return data;
		} catch (err) {
			logger.error('Layout', 'Auth data invalid', err);
		}
	}

	return null;
};
