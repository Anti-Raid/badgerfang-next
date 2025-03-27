export interface Server {
	id: string;
	name: string;
	avatar: string;
	permissions: number;
}

export interface ApiResponse {
	guilds: Server[];
	has_bot: string[];
}