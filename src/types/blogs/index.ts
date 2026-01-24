import { type } from 'arktype';

export const BlogSocial = type({
	url: 'string',
	platform: 'string'
});

export type Socials = typeof BlogSocial.infer;

export const BlogAuthor = type({
	id: 'number',
	documentId: 'string',
	name: 'string',
	username: 'string',
	uid: 'string',
	socials: BlogSocial.array(),
	createdAt: 'string',
	updatedAt: 'string',
	publishedAt: 'string',
	bio: 'string',
	avatar: 'string'
});

export type Author = typeof BlogAuthor.infer;

export const BlogPost = type({
	id: 'number',
	documentId: 'string',
	slug: 'string',
	title: 'string',
	description: 'string',
	content: 'string',
	tags: 'string[]',
	badges: 'string[]',
	createdAt: 'string',
	updatedAt: 'string',
	publishedAt: 'string',
	locale: 'string',
	platform: 'string',
	author: BlogAuthor,
	image: 'string'
});

export type Blog = typeof BlogPost.infer;
