export interface Author {
	__typename: string;
	name: string;
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
