import logger from '@/lib/logger';
import { ApiError } from '@/types/splashtail/types';
import DOMPurify from 'dompurify';
import * as marked from 'marked';

export class ClientResponse {
	private response: Response;

	constructor(response: Response) {
		this.response = response;
	}

	get status(): number {
		return this.response.status;
	}

	get ok(): boolean {
		return this.response.ok;
	}

	async error(base?: string, type?: 'markdown' | 'html'): Promise<string> {
		if (this.ok) {
			throw new Error(`Cannot call error() when response.ok is true`);
		}

		type = type || 'html';

		try {
			const json: ApiError = await this.response.json();

			if (type === 'html') {
				const htmlOut = await marked.parse(this.formatApiError(base || '', json));
				const sanitized = DOMPurify.sanitize(htmlOut);

				return !sanitized.startsWith('<p') ? `<p class="mb-2">${sanitized}</p>` : sanitized;
			}

			return DOMPurify.sanitize(this.formatApiError(base || '', json));
		} catch (err) {
			return base
				? `${base}: ${this.response.statusText} (${err})`
				: `${this.response.statusText} (${err})`;
		}
	}

	private formatApiError(base: string, err: ApiError) {
		const message = err?.context ? `${err.message} [${err.context}]` : err.message;

		return base ? `${base}: ${message}` : message;
	}

	async json(): Promise<any> {
		if (!this.ok) {
			throw new Error(`Cannot call json() when response.ok is false`);
		}
		return this.response.json();
	}
}

export async function fetchClient(
	url: string,
	options?: FetchClientOptions
): Promise<ClientResponse> {
	const rawOptions = options;
	options = options || {};

	const headers: Record<string, string> = options.noExtraHeaders
		? {}
		: { 'Content-Type': 'application/json' };

	if (options.headers) {
		Object.assign(headers, options.headers as Record<string, string>);
	}

	let modifier = '';

	if (options.auth) {
		headers['Authorization'] = `User ${options.auth}`;
		modifier += ' (authorized)';
	} else if (headers['Authorization']) {
		throw new Error('options.auth must be used for auth');
	}

	logger.info(
		'FetchClient',
		(options.method ? options.method.toUpperCase() : 'GET') + modifier,
		url
	);

	try {
		const res = await fetch(url, {
			headers: headers,
			...options
		});

		if ([408, 502, 503, 504].includes(res.status)) {
			throw new Error('Server currently undergoing maintenance');
		}

		const retryAfter = res.headers.get('Retry-After');
		if (retryAfter) {
			logger.info('FetchClient', 'Rate limited', retryAfter, res.headers);

			const err: ApiError = await res.json();
			const n = parseFloat(retryAfter || '3') * 1000;

			if (options.onRatelimit) {
				options.onRatelimit(n, err);
			}

			if (!options.noWait) {
				logger.info('FetchClient', `Rate limited, waiting ${retryAfter} seconds`);
				await new Promise((resolve) => setTimeout(resolve, n));

				if (options.onRatelimit) {
					options.onRatelimit(0, err);
				}

				return await fetchClient(url, rawOptions);
			}
		}

		return new ClientResponse(res);
	} catch (err) {
		logger.error('FetchClient', 'Error', err);
		throw err;
	}
}

// Add the missing type definition for FetchClientOptions
interface FetchClientOptions extends RequestInit {
	auth?: string;
	noExtraHeaders?: boolean;
	noWait?: boolean;
	onRatelimit?: (n: number, err: ApiError) => void;
}
