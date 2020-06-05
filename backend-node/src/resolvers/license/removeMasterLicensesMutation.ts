import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let removeMasterLicensesResolver: FieldResolver<
  'Mutation',
  'removeMasterLicenses'
> = async (_, { masterTokens }, context: Context) => {
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
  let masterDeleted = 0;
  for (let masterToken of masterTokens) {
    if (masterToken) {
      let masterLicenseId = Base64.decode(masterToken);
      let masterLicense = await context.prisma.masterLicense.findOne({
        where: { id: masterLicenseId },
      });

      if (masterLicense) {
        await context.prisma.license.deleteMany({
          where: {
            masterLicense: {
              id: masterLicense.id,
            },
          },
        });
        numLicenseDelete += masterLicense.maxLicense;
        await context.prisma.masterLicense.delete({
          where: {
            id: masterLicense.id,
          },
        });
        masterDeleted += 1;
      }
    }
  }
  return `Success with ${numLicenseDelete} license deleted from ${masterDeleted} master.`;
};

export let removeMasterLicenses = mutationField('removeMasterLicenses', {
  type: 'String',
  args: {
    masterTokens: stringArg({ required: true, list: true }),
  },
  resolve: removeMasterLicensesResolver,
});
