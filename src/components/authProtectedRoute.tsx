'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthCheck } from '@/lib/auth/checkAuthCreds';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sessionData = getAuthCreds();
  const { isAuthorized, isLoading, isError } = useAuthCheck(sessionData);

  useEffect(() => {
    if (!isLoading && !isAuthorized && !isError) {
      router.push(`/unauthorized?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthorized, isLoading, isError, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading authorization data. Please try again later.</div>;
  }

  if (!isAuthorized) {
    return <div>You are not authorized to view this page.</div>;
  }

  return <>{children}</>;
}
