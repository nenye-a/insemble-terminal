import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let removeMasterLicensesResolver: FieldResolver<
  'Mutation',
  'removeMasterLicenses'
> = async (_, { masterTokens }, context: Context) => {
  /**
   * Endpoint for delete 1 or more masterLicense. (ADMIN Only)
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
  let numLicenseDelete = 0;
  let masterDeleted = 0;
  for (let masterToken of masterTokens) {
    /**
     * Here we check all input masterTokens that user give to us.
     */
    if (masterToken) {
      /**
       * Here we decode the license to make sure it's valid.
       * If it's invalid then the token will be skiped and check next one.
       * The token are decoded into masterLicenseId.
       */
      let masterLicenseId = Base64.decode(masterToken);
      let masterLicense = await context.prisma.masterLicense.findOne({
        where: { id: masterLicenseId },
      });

      /**
       * Here we check if the selected masterLicense are exist in our DB.
       * If it's not exist then it's invalid then the token is skiped.
       */
      if (masterLicense) {
        /**
         * If all pass then all license on masterLicense will be deleted.
         * Also if the license is deleted then the user linked to it will
         * loss his/her license.
         */
        await context.prisma.license.deleteMany({
          where: {
            masterLicense: {
              id: masterLicense.id,
            },
          },
        });
        /**
         * This just for count how much license removed for return message.
         */
        numLicenseDelete += masterLicense.maxLicense;
        /**
         * Then we delete the masterLicense here.
         */
        await context.prisma.masterLicense.delete({
          where: {
            id: masterLicense.id,
          },
        });
        /**
         * This just for count how much masterLicense removed for return message.
         */
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
