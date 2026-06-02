export type Id =
  | { tenant_type: "guild"; tenant_id: string }
  | { tenant_type: "user"; tenant_id: string };
