import { queryType, stringArg, makeSchema } from 'nexus';
import { nexusPrismaPlugin } from 'nexus-prisma';
import * as path from 'path';

import * as Types from './typeSchemas';
import * as Resolvers from './resolvers';
import * as Scalars from './scalars';

let Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg({ nullable: true }) },
      resolve: (_, { name }) => `Hello ${name || 'World'}!`,
    });
  },
});

let schema = makeSchema({
  types: [Query, Types, Resolvers, Scalars],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/generated/schema.graphql',
    typegen: path.join(
      __dirname,
      '../node_modules/@types/nexus-typegen/index.d.ts',
    ),
  },
});

export { schema };
