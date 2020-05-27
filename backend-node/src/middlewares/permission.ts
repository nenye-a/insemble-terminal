import { rule, shield } from 'graphql-shield';

import { Context } from 'serverTypes';

let isUserAuthenticated = rule()(async (_, __, ctx: Context) => {
  return ctx.userId != null;
});

let permissions = shield({
  Query: {},
  Mutation: {
    search: isUserAuthenticated,
  },
});

export { permissions };
