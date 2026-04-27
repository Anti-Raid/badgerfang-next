import { MSyscallArgs, MSyscallRet, MSyscallError } from '../../types/msyscall/syscall/index';
import { UserSession, AuthorizedSession } from '../../types/msyscall/types/auth';
import { BotStatus, BotConfig } from '../../types/msyscall/types/bot';

// Re-export types for convenience
export type { UserSession, AuthorizedSession, BotStatus, BotConfig };

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const tokenData = localStorage.getItem('wistala');
    if (tokenData) {
      try {
        const { token } = JSON.parse(tokenData);
        return token;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

/**
 * The core underlying raw msyscall
 */
export async function rawMsyscall(args: MSyscallArgs): Promise<MSyscallRet> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = token;
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${API_BASE_URL}/msyscall`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(args)
  });

  if (!response.ok) {
    let errorData: MSyscallError;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { op: 'Generic', message: await response.text() };
    }
    throw new Error(`msyscall failed: ${errorData.op === 'Generic' ? errorData.message : errorData.op}`);
  }

  return await response.json();
}

/**
 * Type-safe fetcher for msyscall operations
 */
export async function opFetcher<O extends MSyscallArgs['op']>(
  op: O,
  req: Extract<MSyscallArgs, { op: O }>['req']
): Promise<Extract<MSyscallRet, { op: O }>['data']> {
  const res = await rawMsyscall({ op, req } as any);
  if (res.op === op) {
    return res.data as any;
  }
  throw new Error(`Unexpected msyscall response: expected ${op}, got ${res.op}`);
}

// Export domain-specific functions
export * from './auth';
export * from './bot';
export * from './discord';
