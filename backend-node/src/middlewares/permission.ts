import { rule, shield } from 'graphql-shield';

import { Context } from 'serverTypes';

let isUserAuthenticated = rule()(async (_, __, ctx: Context) => {
  return ctx.userId != null;
});

let permissions = shield({
  Query: {
    userProfile: isUserAuthenticated,
    userTerminals: isUserAuthenticated,
    terminal: isUserAuthenticated,
  },
  Mutation: {
    search: isUserAuthenticated,
    createTerminal: isUserAuthenticated,
    deleteTerminal: isUserAuthenticated,
  },
});

export { permissions };
