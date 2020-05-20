import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';

import { API_URI } from '../constants/uri';

const cache = new InMemoryCache();

const errorLink = onError((_) => {
  // TODO: handle error
});

const httpLink = new HttpLink({
  uri: API_URI,
});

function initApolloClient() {
  cache.writeData({
    data: {
      // default state
    },
  });
  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    resolvers: {},
    cache,
  });
  return client;
}
let apolloClient = initApolloClient();

export default apolloClient;
