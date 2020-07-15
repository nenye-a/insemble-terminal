import { queryType, stringArg, makeSchema } from 'nexus';
import { nexusPrismaPlugin } from 'nexus-prisma';
import * as path from 'path';

import * as Types from './typeSchemas';
import * as Resolvers from './resolvers';
import * as Scalars from './scalars';

let Query = queryType({
  definition(t) {
    /**
     * Query example, can be removed.
     */
    t.string('hello', {
      args: { name: stringArg({ nullable: true }) },
      resolve: (_, { name }) => `Hello ${name || 'World'}!`,
    });
  },
});

let schema = makeSchema({
  /**
   * Schema generator
   * Resolvers: The functions that run for endpoint.
   * Types: The type definition like object or input.
   * Scalars: Same as Types but usually for enum and spesific scalar like DateTime
   * Query: Example above, can be removed.
   */
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
