import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let incrementMaxLicenseResolver: FieldResolver<
  'Mutation',
  'incrementMaxLicense'
> = async (_, { masterTokens }, context: Context) => {
  /**
   * Endpoint for increase 1 max license on masters. (ADMIN Only)
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

  let numLicenseAdded = 0;
  for (let masterToken of masterTokens) {
    if (masterToken) {
      /**
       * Check every masterToken on masterTokens.
       */
      let masterLicenseId = Base64.decode(masterToken);
      let masterLicense = await context.prisma.masterLicense.findOne({
        where: { id: masterLicenseId },
      });

      if (masterLicense) {
        /**
         * If masterLicense is exist then we add license to it.
         * And also update maxLicense in masterLicense.
         * If it's not exist then do nothing and do check on next masterLicense.
         */
        await context.prisma.license.create({
          data: {
            masterLicense: { connect: { id: masterLicense.id } },
          },
        });
        await context.prisma.masterLicense.update({
          where: {
            id: masterLicense.id,
          },
          data: {
            maxLicense: masterLicense.maxLicense + 1,
          },
        });
        /**
         * This just for count how much license added for return message.
         */
        numLicenseAdded += 1;
      }
    }
  }
  return `Success with ${numLicenseAdded} license added.`;
};

export let incrementMaxLicense = mutationField('incrementMaxLicense', {
  type: 'String',
  args: {
    masterTokens: stringArg({ required: true, list: true }),
  },
  resolve: incrementMaxLicenseResolver,
});
