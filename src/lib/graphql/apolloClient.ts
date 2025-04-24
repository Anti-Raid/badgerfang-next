import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
	uri: 'https://strapi.purrquinox.com/graphql'
});

const authLink = setContext((_, { headers }) => {
	const token = process.env.NEXT_PUBLIC_STRAPI_AUTH_TOKEN;
	return {
		headers: {
			...headers,
			Authorization: token ? `Bearer ${token}` : ''
		}
	};
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache()
});

export default client;
