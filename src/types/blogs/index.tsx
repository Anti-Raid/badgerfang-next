export type Blog = BlogPost;

export interface BlogPost {
	id: number;
	documentId: string;
	slug: string;
	title: string;
	description: string;
	content: string;
	tags: string[];
	badges: string[];
	locale: string;
	platform: string;
	image: string | null;
	createdAt: string; // ISO date
	updatedAt: string; // ISO date
	publishedAt: string; // ISO date
	authorId: number;
	author: Author;
}

export interface Author {
	id: number;
	documentId: string;
	name: string;
	username: string;
	uid: string;
	bio: string;
	avatar: string;
	createdAt: string; // ISO date
	updatedAt: string; // ISO date
	publishedAt: string | null;
	socials: unknown[]; // adjust if you define structure later
}
