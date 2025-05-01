import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
	uri: 'https://strapi.purrquinox.com/graphql'
});

const authLink = setContext((_, { headers }) => {
	return {
		headers: {
			...headers,
			Authorization: `Bearer 17f20a5f7c6d039fe839e38c944d7d435b41ba3968f389df28725652c4e6e10779f7c9fd4f146554ab86a967e81a90dec350ab1f348ffc9582115aacab3e4bb29ed36e49f2e218ea9a7978369ff2f27cb175c9fb560cb46534ff2c83f2e32bfff208fd43b468e557125dba1ccb4761b18b5b4bab84ff655a1d3cb921591bfe7d`
		}
	};
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache()
});

export default client;
