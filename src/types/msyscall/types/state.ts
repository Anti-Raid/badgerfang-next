import { KhronosValue } from '../khronosvalue'

export type StateOp = 
  | { op: "KvFind"; query: string; scope: string }
  | { op: "KvGet"; key: string; scope: string }
  | { op: "KvGetWithBlob"; key: string; scope: string }
  | { op: "KvSignUrl"; key: string; scope: string }
  | { op: "KvSet"; key: string; scope: string; value: KhronosValue; blob?: BlobTaker | null }
  | { op: "KvDelete"; key: string; scope: string }
  | { op: "SubscribeEvent"; event: string; system: string }
  | { op: "UnsubscribeEvent"; event: string; system: string }
  | { op: "GlobalKvFind"; query: string; scope: string }
  | { op: "GlobalKvGet"; key: string; version: number; scope: string }
  | { op: "GlobalKvCreate"; key: string; version: number; short: string; public_metadata: KhronosValue; scope: string; public_data: boolean; long?: string | null; data: KhronosValue }
  | { op: "GlobalKvDelete"; key: string; version: number; scope: string };

export type BlobTaker = Uint8Array | string | Blob;

export interface Blob {
  readonly __blob: unique symbol;
}

export interface KvLookup {
  key: string;
  value: KhronosValue;
  scope: string;
  created_at: string;
  last_updated_at: string;
}

export interface KvLookupWithBlob extends KvLookup {
  blob?: Blob | null;
}

export interface KvSignedUrl {
  url: string;
  expiry: number;
}

export interface GlobalKv {
  key: string;
  version: number;
  owner_id: string;
  owner_type: string;
  price?: number | null;
  short: string;
  public_metadata: KhronosValue;
  scope: string;
  created_at: string;
  last_updated_at: string;
  public_data: boolean;
  review_state: string;
  long?: string | null;
}

export type StateExecResult = 
  | ({ op: "Kv" } & KvLookup)
  | ({ op: "KvWithBlob" } & KvLookupWithBlob)
  | ({ op: "KvSignUrl" } & KvSignedUrl)
  | ({ op: "GlobalKv" } & GlobalKv)
  | { op: "GlobalKvData"; data: KhronosValue }
  | { op: "GlobalKvDataOpaque"; data: KhronosValue };

export interface TenantState {
  events: Record<string, Record<string, boolean>>;
  flags: number;
}

export interface StateExecResponse {
  results: StateExecResult[];
  new_tenant_state?: TenantState | null;
}
