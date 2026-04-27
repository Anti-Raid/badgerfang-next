import { MAuthSyscallRet } from '../../types/msyscall/syscall/auth';
import { UserSession, AuthorizedSession } from '../../types/msyscall/types/auth';
import { opFetcher, rawMsyscall } from './index';

/**
 * Creates a login session using oauth2
 */
export async function createLoginSession(code: string, redirect_uri: string, code_verifier?: string | null): Promise<Extract<MAuthSyscallRet, { op: "CreatedSession" }>> {
  const res = await opFetcher("Auth", { op: "CreateLoginSession", code, redirect_uri, code_verifier });
  if (res.op === 'CreatedSession') {
    return res;
  }
  throw new Error(`Unexpected auth response: ${res.op}`);
}

/**
 * Creates an API token session
 */
export async function createApiSession(name: string, expiry: number): Promise<Extract<MAuthSyscallRet, { op: "CreatedSession" }>> {
  const res = await opFetcher("Auth", { op: "CreateApiSession", name, expiry });
  if (res.op === 'CreatedSession') {
    return res;
  }
  throw new Error(`Unexpected auth response: ${res.op}`);
}

/**
 * Gets the current user's sessions
 */
export async function getUserSessions(): Promise<UserSession[]> {
  const res = await opFetcher("Auth", { op: "GetUserSessions" });
  if (res.op === 'UserSessions') {
    return res.sessions;
  }
  return [];
}

/**
 * Deletes a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await opFetcher("Auth", { op: "DeleteSession", session_id: sessionId });
}

/**
 * Gets the authorized session for the current user. 
 */
export async function getAuthorizedSession(): Promise<AuthorizedSession | undefined> {
  try {
    const res = await rawMsyscall({
      op: "Auth",
      req: { op: "GetAuthorizedSession" } as any // Not yet in documented types but exists in backend
    });
    if (res.op === 'Auth' && (res.data as any).op === 'AuthorizedSession') {
      return (res.data as any).session;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}
