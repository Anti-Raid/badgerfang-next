import { SupportConfig } from '@/types/support';

const client_id = '858308969998974987';
const permissions = '1512634182902';

const redirect_url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://antiraid.xyz';

export const supportConfig: SupportConfig = {
  invite: {
    permissions,
    client_id,
    no_bot: `https://discord.com/api/oauth2/authorize?client_id={client_id}&response_type=code&redirect_uri={redirect_url}&scope=guilds+identify&prompt=none`,
    basic: `https://discord.com/api/oauth2/authorize?client_id=${client_id}&permissions=${permissions}&scope=bot%20applications.commands`,
    full: `https://discord.com/api/oauth2/authorize?client_id=${client_id}&permissions=${permissions}&response_type=code&redirect_uri=${redirect_url}&scope=bot+applications.commands+guilds+identify`,
  },
};
