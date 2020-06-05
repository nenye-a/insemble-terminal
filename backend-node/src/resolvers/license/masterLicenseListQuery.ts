import { queryField, FieldResolver } from 'nexus';

import { Root, Context } from 'serverTypes';

let masterLicenseListResolver: FieldResolver<
  'Query',
  'masterLicenseList'
> = async (_: Root, _args, context: Context) => {
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

  let masterLicenses = await context.prisma.masterLicense.findMany();
  let masterTokens = masterLicenses.map(({ id, name, maxLicense }) => ({
    masterToken: Base64.encodeURI(id),
    name,
    numToken: maxLicense,
  }));
  return masterTokens;
};

let masterLicenseList = queryField('masterLicenseList', {
  type: 'MasterToken',
  list: true,
  resolve: masterLicenseListResolver,
});

export { masterLicenseList };
