export interface Author {
	__typename: string;
	name: string;
	bio: string;
	avatar: Avatar;
	socials: Socials[];
}

export interface Avatar {
	__typename: string;
	url: string;
	caption: string;
}

export interface Socials {
	__typename: string;
	url: string;
	platform: string;
}

export interface Blog {
	__typename: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
	tags: string[];
	badges: null;
	documentId: string;
	author: Author;
	image: null;
}