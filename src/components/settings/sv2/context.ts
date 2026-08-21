import { createContext, useContext } from 'react';
import type { Event, Page } from '@/lib/settings/events.parse';
import type { RawKhronosValue } from '@/lib/msyscall/khronosvalue';

export interface Choice {
	label: string;
	value: string;
}

/**
 * Everything the settings-v2 component tree needs to render and mutate a page.
 * `settings` mirrors willow's `mps.state.settings` — a page per template id, each
 * carrying its parsed components and the mutable per-form field data.
 */
export interface SettingsContextValue {
	guildId: string;
	roleChoices: Choice[];
	channelChoices: Choice[];
	settings: Record<string, Page>;
	/** Immutably updates `settings[template].formdata[formsetId][formIdx].data[fieldId]`. */
	setFieldValue: (
		template: string,
		formsetId: string,
		formIdx: number,
		fieldId: string,
		value: unknown
	) => void;
	/** Dispatches a `WebSettings` event and returns the decoded response. */
	dispatchEvent: (event: Event) => Promise<RawKhronosValue>;
	/** Re-fetches the settings pages (used after a form action or reorder). */
	refetch: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export const useSettings = (): SettingsContextValue => {
	const ctx = useContext(SettingsContext);
	if (!ctx) {
		throw new Error('useSettings must be used within a SettingsContext provider');
	}
	return ctx;
};
