import { GraphQLServer } from 'graphql-yoga';
import { ContextParameters } from 'graphql-yoga/dist/types';

import { prisma } from './prisma';
import { schema } from '../src/schema';

const server = new GraphQLServer({
  schema,
  context: async ({}: ContextParameters) => {
    return {
      prisma,
    };
  },
});

server.start({}, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:4000`);
});
