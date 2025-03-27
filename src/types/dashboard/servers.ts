export interface Server {
	id: string;
	name: string;
	avatar: string;
	permissions: number;
}

interface ApiResponse {
	guilds: Server[];
	has_bot: string[];
}