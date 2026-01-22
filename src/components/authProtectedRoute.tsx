'use client';

import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthCheck } from '@/lib/auth/checkAuthCreds';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const { isAuthorized, isError, isLoading } = useAuthCheck();

	useEffect(() => {
		if (!isAuthorized && !isError && !isLoading) {
			navigate({ to: '/authorize', replace: true });
		}
	}, [isAuthorized, isError, isLoading, navigate]);

	if (isLoading) {
		return <div>Loading authorization data...</div>;
	}

	if (isError) {
		return <div>Error loading authorization data. Please try again later.</div>;
	}

	if (!isAuthorized) {
		return <div>You are not authorized to view this page.</div>;
	}

	return <>{children}</>;
}
