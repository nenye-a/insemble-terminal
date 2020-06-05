import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let removeLicensesResolver: FieldResolver<
  'Mutation',
  'removeLicenses'
> = async (_, { tokens }, context: Context) => {
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

  let numLicenseDelete = 0;
  for (let token of tokens) {
    let [masterToken, licenseToken] = token ? token.split(':') : [];
    if (masterToken && licenseToken) {
      let masterLicenseId = Base64.decode(masterToken);
      let licenseId = Base64.decode(licenseToken);
      let license = await context.prisma.license.findOne({
        where: { id: licenseId },
        include: {
          masterLicense: true,
          user: true,
        },
      });

      if (license && masterLicenseId === license.masterLicense.id) {
        await context.prisma.license.delete({
          where: {
            id: license.id,
          },
        });
        numLicenseDelete += 1;
        await context.prisma.license.create({
          data: {
            masterLicense: { connect: { id: license.masterLicense.id } },
          },
        });
      }
    }
  }
  return `Success with ${numLicenseDelete} license deleted.`;
};

export let removeLicenses = mutationField('removeLicenses', {
  type: 'String',
  args: {
    tokens: stringArg({ required: true, list: true }),
  },
  resolve: removeLicensesResolver,
});
