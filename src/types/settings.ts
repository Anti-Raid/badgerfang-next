// --- Setting Values and Validation ---

import { BaseGuildUserInfo } from './api/bindings/BaseGuildUserInfo';

export interface SettingEntry {
	[key: string]: unknown;
	title?: string;
}

export interface SettingErrors {
	[templateName: string]: string;
}

export interface ValidationParams {
	op: 'Create' | 'Update' | 'Delete' | 'Reorder';
	fields: { [key: string]: unknown } | { [key: string]: unknown }[];
	entries: SettingEntry[];
	guildData: BaseGuildUserInfo; // Replace with actual type
}

export interface DispatchResult {
	type: 'Ok' | 'Error';
	data?: unknown;
}

export interface TemplateExecutionContext {
	fields: { [key: string]: unknown };
	guildData: BaseGuildUserInfo; // Replace with actual type
}
