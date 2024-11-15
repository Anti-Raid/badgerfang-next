// Packages
import * as types from '@/types/forums/types';

// Types
type Response<T> = Promise<
	| T
	| {
			success: boolean;
			error: string;
	  }
	| Error
>;

// Auth
class Auth {
	// Create User
	static async createUser(
		name: string,
		userid: string,
		usertag: string,
		bio: string,
		avatar: string
	): Response<boolean> {
		throw new Error('Placeholder');
	}
}

// Users
class Users {
	// Get User
	static async get(tag: string): Response<types.users> {
		throw new Error('Placeholder');
	}

	// Follow User
	static async follow(target: string, type: 'follow' | 'unfollow'): Response<boolean> {
		throw new Error('Placeholder');
	}

	// List Posts
	static async listPosts(tag: string): Response<types.posts[]> {
		throw new Error('Placeholder');
	}
}

// Posts
class Posts {}

// Applications
class Applications {}

// Export
export { Auth, Users, Posts, Applications };
