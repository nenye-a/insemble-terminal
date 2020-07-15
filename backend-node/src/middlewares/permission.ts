import { rule, shield } from 'graphql-shield';

import { Context } from 'serverTypes';

let isUserAuthenticated = rule()(async (_, __, ctx: Context) => {
  /**
   * This function is checking if there is userId on the context or not.
   */
  return ctx.userId != null;
});

/**
 * This permission is determine if the endpoint should have userId (bearer token)
 * or else it will throw error "Unauthenticated"
 */

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
    editTerminal: isUserAuthenticated,
    pinTable: isUserAuthenticated,
    removePinnedTable: isUserAuthenticated,
    createLicense: isUserAuthenticated,
    removeLicenses: isUserAuthenticated,
    removeMasterLicenses: isUserAuthenticated,
    incrementMaxLicense: isUserAuthenticated,
    activateAccount: isUserAuthenticated,
    feedback: isUserAuthenticated,
    createTerminalNote: isUserAuthenticated,
    editNote: isUserAuthenticated,
    createReferral: isUserAuthenticated,
  },
});

export { permissions };
