'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, createOauth2Session } from '@/lib/api';
import { AuthorizeRequest } from '@/types/api/bindings/AuthorizeRequest';

export default function AuthorizePage() {
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const router = useRouter();

	const createSession = async () => {
		try {
			const searchParams = new URLSearchParams(window.location.search);

			if (!searchParams.has('code')) {
				throw new Error('No code in URL');
			}

			const json: AuthorizeRequest = {
				code: searchParams.get('code') || '',
				redirect_uri: `${window.location.origin}/authorize`
			};

			const data = await createOauth2Session(json);

			if (!data.user) {
				throw new Error('User data not found in session response');
			}

			localStorage.setItem('wistala', JSON.stringify(data));
			localStorage.setItem('authUser', JSON.stringify(data.user));

			setStatus('success');

			// Redirect to the dashboard instead of reloading the page
			router.push('/dashboard');
		} catch (err) {
			setStatus('error');
			setError(err instanceof Error ? err.message : 'An unknown error occurred');
		}
	};

	useEffect(() => {
		createSession();
	}, []);

	const renderMessage = () => {
		switch (status) {
			case 'loading':
				return (
					<div className="flex items-center justify-center min-h-screen bg-background">
						<div className="text-center">
							<div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
							<p className="text-xl text-foreground">Authorizing...</p>
						</div>
					</div>
				);
			case 'success':
				return (
					<div className="flex items-center justify-center min-h-screen bg-background">
						<div className="text-center">
							<div className="w-16 h-16 mx-auto mb-4 text-green-500">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<p className="text-xl text-foreground">Authorized! Redirecting...</p>
						</div>
					</div>
				);
			case 'error':
				return (
					<div className="flex items-center justify-center min-h-screen bg-background">
						<div className="text-center">
							<div className="w-16 h-16 mx-auto mb-4 text-destructive">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<p className="text-xl text-destructive">{error || 'Authorization Failed'}</p>
						</div>
					</div>
				);
		}
	};

	return renderMessage();
}
