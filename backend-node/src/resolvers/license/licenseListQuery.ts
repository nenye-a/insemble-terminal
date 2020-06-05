import { queryField, FieldResolver } from 'nexus';

import { Root, Context } from 'serverTypes';
import { LicenseToken } from 'dataTypes';

let licenseListResolver: FieldResolver<'Query', 'licenseList'> = async (
  _: Root,
  _args,
  context: Context,
) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Admin only!');
  }

  let masterLicenses = await context.prisma.masterLicense.findMany({
    include: { licenses: { include: { user: true } } },
  });

  let tokens: Array<LicenseToken> = [];
  for (let masterLicense of masterLicenses) {
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
