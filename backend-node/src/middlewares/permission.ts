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
    licenseList: isUserAuthenticated,
    masterLicenseList: isUserAuthenticated,
    search: isUserAuthenticated,
  },
  Mutation: {
    editUserProfile: isUserAuthenticated,
    search: isUserAuthenticated,
    createTerminal: isUserAuthenticated,
    deleteTerminal: isUserAuthenticated,
    shareTerminal: isUserAuthenticated,
    pinTable: isUserAuthenticated,
    removePinnedTable: isUserAuthenticated,
    createLicense: isUserAuthenticated,
    removeLicenses: isUserAuthenticated,
    removeMasterLicenses: isUserAuthenticated,
    incrementMaxLicense: isUserAuthenticated,
    activateAccount: isUserAuthenticated,
    feedback: isUserAuthenticated,
  },
});

export { permissions };
