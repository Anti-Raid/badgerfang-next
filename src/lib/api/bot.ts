import { createServerFn } from '@tanstack/react-start';
import { getBotStatus as fetchBotStatus, getBotConfig as fetchBotConfig, getBotCommands as fetchBotCommands } from '@/lib/msyscall/bot';
import type { BotStatus, BotConfig } from '@/types/msyscall/types/bot';

export const getBotStatusFn = createServerFn({ method: 'GET' })
  .handler(async (): Promise<BotStatus> => {
    return await fetchBotStatus();
  });

export const getBotConfigFn = createServerFn({ method: 'GET' })
  .handler(async (): Promise<BotConfig> => {
    return await fetchBotConfig();
  });

export const getBotCommandsFn = createServerFn({ method: 'GET' })
  .handler(async (): Promise<any[]> => {
    return await fetchBotCommands();
  });
