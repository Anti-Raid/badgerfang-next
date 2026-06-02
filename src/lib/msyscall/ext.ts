import { dispatchEvent } from './bot';

/**
 * Gets settings for a guild
 */
export async function getSettings(guildId: string): Promise<any> {
    return await dispatchEvent(guildId, "WebGetSettings", null);
}

/**
 * Executes a settings operation
 */
export async function executeSettings(guildId: string, payload: any): Promise<any> {
    return await dispatchEvent(guildId, "WebExecuteSetting", payload);
}
