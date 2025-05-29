import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
	uri: 'https://strapi.purrquinox.com/graphql'
});

const authLink = setContext((_, { headers }) => {
	return {
		headers: {
			...headers,
			Authorization: `Bearer 46c2ac374e977304d2ab121cba95e7337d19304bc0e880f5b06376a0c687618644123a3fa20cbc675ae70494e991e92903ad0d02dbf916d0cd40eb72fad1aca4132c9a80556cb5068475673907029497c4eec323b387a33c068e17d834867cb30c3166d5b266987421338a44c4fe05f9753559ae622975ada35a4e9f11f77558`
		}
	};
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache()
});

export default client;
