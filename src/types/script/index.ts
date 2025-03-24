export interface TemplateShopProps {
	id: string;
	name: string;
	version: string;
	description: string;
	owner_guild: string;
	created_at: string;
	created_by: string;
	last_updated_at: string;
	last_updated_by: string;
	tags?: string[];
	downloads?: number;
	rating?: number;
	thumbnailUrl?: string;
}

export const TemplateShopPropsOperations = ['View', 'Install', 'Preview'] as const;
export type TemplateShopPropsOperations = (typeof TemplateShopPropsOperations)[number];
