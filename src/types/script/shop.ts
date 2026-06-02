export interface ScriptShopTemplate {
	id: string;
	key: string;
	name: string;
	version: string;
	description: string;
	short: string;
	long?: string | null;
	tags: string[];
	owner_guild: string;
	owner_id: string;
	owner_type: string;
	price?: number | null;
	review_state: string;
	created_at: string;
	last_updated_at: string;
	content: Record<string, string>;
}
