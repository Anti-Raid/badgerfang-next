import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/graphql/apolloClient';
import { gql } from 'graphql-tag';

const GET_ALL_BLOGS_QUERY = gql`
	query GetAllBlogs($filters: BlogFiltersInput) {
		blogs(filters: $filters) {
			title
			slug
			description
			content
			createdAt
			updatedAt
			publishedAt
			locale
			tags
			badges
			documentId
			author {
				name
				bio
				socials
				avatar {
					url
					caption
				}
			}
			image {
				url
				alternativeText
				caption
			}
			localizations_connection(filters: $filters) {
				nodes {
					title
					slug
					description
					content
					locale
					publishedAt
				}
			}
		}
	}
`;

/**
 * Handles HTTP GET requests to retrieve blog posts, optionally filtered by criteria provided in the request URL.
 *
 * If a `filters` parameter is present in the URL, it is parsed as JSON and used to filter the blog results. If absent, the handler defaults to returning blogs published within the last 30 days. Responds with a JSON array of blogs on success, or an error message with an appropriate HTTP status code on failure.
 *
 * @returns A JSON response containing the list of blogs or an error message.
 */
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	let filters: any = undefined;

	if (searchParams.has('filters')) {
		try {
			filters = JSON.parse(searchParams.get('filters') as string);
		} catch (err) {
			console.error('Failed to parse filters:', err);
			return NextResponse.json({ error: 'Invalid filters parameter' }, { status: 400 });
		}
	} else {
		filters = {
			publishedAt: {
				gte: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
			}
		};
	}

	try {
		const { data } = await client.query({
			query: GET_ALL_BLOGS_QUERY,
			variables: { filters }
		});
		return NextResponse.json(data.blogs);
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || 'Failed to fetch data', details: error },
			{ status: 500 }
		);
	}
}
