import { queryField, FieldResolver } from 'nexus';

import { Root, Context } from 'serverTypes';
import { LicenseToken } from 'dataTypes';

let licenseListResolver: FieldResolver<'Query', 'licenseList'> = async (
  _: Root,
  _args,
  context: Context,
) => {
  /**
   * Endpoint for showing license list. (ADMIN Only)
   */
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  /**
   * Check if the one who use this is ADMIN.
   */
  if (user.role !== 'ADMIN') {
    throw new Error('Admin only!');
  }

  /**
   * Search all of the masterLicense so the order of license will the same as
   * masterLicense.
   */
  let masterLicenses = await context.prisma.masterLicense.findMany({
    include: { licenses: { include: { user: true } } },
  });

  let tokens: Array<LicenseToken> = [];
  for (let masterLicense of masterLicenses) {
    /**
     * Here we arrange the license by order of masterLicense.
     * And then encode it as a token both master and license.
     */
    let masterLicenseTokens = masterLicense.licenses.map(({ id, user }) => ({
      token: Base64.encodeURI(masterLicense.id) + ':' + Base64.encodeURI(id),
      linkedEmail: user ? user.email : '-',
    }));
    tokens = tokens.concat(masterLicenseTokens);
  }

  return tokens;
};

let licenseList = queryField('licenseList', {
  type: 'Token',
  list: true,
  resolve: licenseListResolver,
});

export { licenseList };
