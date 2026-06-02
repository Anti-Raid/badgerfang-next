import type { MGkvSyscallRet } from '../../types/msyscall/syscall/gkv';
import type { PartialGlobalKv } from '../../types/msyscall/types/gkv';
import { opFetcher } from './index';

/**
 * Finds global key-value entries within a scope.
 */
export async function findGlobalKvs(
	scope: string,
	query: string = '%'
): Promise<PartialGlobalKv[]> {
	const res = await opFetcher('Gkv', { op: 'FindGlobalKvs', scope, query });
	if (res.op === 'GlobalKvList') {
		return res.gkvs;
	}
	throw new Error(`Unexpected global KV response: ${res.op}`);
}

/**
 * Gets one global key-value entry by key and version.
 */
export async function getGlobalKv(
	scope: string,
	key: string,
	version: number
): Promise<PartialGlobalKv | null> {
	const res = await opFetcher('Gkv', { op: 'GetGlobalKv', scope, key, version });
	if (res.op === 'GlobalKv') {
		return res.gkv;
	}
	return null;
}

/**
 * Sets review state for a global key-value entry. Requires a secure/admin context.
 */
export async function setGlobalKvReviewState(
	scope: string,
	key: string,
	version: number,
	reviewState: string
): Promise<void> {
	const res: MGkvSyscallRet = await opFetcher('Gkv', {
		op: 'AdminSetGlobalKvReviewState',
		scope,
		key,
		version,
		review_state: reviewState
	});
	if (res.op !== 'Ack') {
		throw new Error(`Unexpected global KV response: ${res.op}`);
	}
}
