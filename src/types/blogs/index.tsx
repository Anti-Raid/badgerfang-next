export interface Author {
	__typename: string;
	name: string;
	bio: string;
	avatar: Image;
	socials: Socials[];
}

export interface Image {
	__typename: string;
	url: string;
	caption: string;
	alternativeText: string;
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
	image: Image;
	og?: Image;
}
