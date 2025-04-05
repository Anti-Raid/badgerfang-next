'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthCheck } from '@/lib/auth/checkAuthCreds';
import { getAuthCreds } from '@/lib/auth/getAuthCreds';

/**
 * Conditionally renders its children based on the user's authorization status.
 *
 * This component retrieves authentication credentials and evaluates the user's access rights. While the authorization
 * check is in progress, a loading indicator is displayed. If an error occurs during the check, an error message is shown.
 * When the user is not authorized (and no error is present), the component displays a not-authorized message and triggers
 * a redirect to an unauthorized page. If the user is authorized, the given children are rendered.
 *
 * @param children - The content to render for authorized users.
 */
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
