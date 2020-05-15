import { queryType, stringArg, makeSchema } from 'nexus';
import { nexusPrismaPlugin } from 'nexus-prisma';
import * as path from 'path';

let Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg({ nullable: true }) },
      resolve: (_, { name }) => `Hello ${name || 'World'}!`,
    });
  },
});

let schema = makeSchema({
  types: [Query],
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
