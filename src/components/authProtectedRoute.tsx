'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthCheck } from '@/lib/auth/checkAuthCreds';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sessionData = getAuthCreds();
  const { isAuthorized, isError } = useAuthCheck(sessionData);

  useEffect(() => {
    if (!isAuthorized && !isError) {
    }
  }, [isAuthorized, isError, router]);

  if (isError) {
    return <div>Error loading authorization data. Please try again later.</div>;
  }

  if (!isAuthorized) {
    return <div>You are not authorized to view this page.</div>;
  }

  return <>{children}</>;
}
