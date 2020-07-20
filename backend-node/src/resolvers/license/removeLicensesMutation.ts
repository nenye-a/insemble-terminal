import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let removeLicensesResolver: FieldResolver<
  'Mutation',
  'removeLicenses'
> = async (_, { tokens }, context: Context) => {
  /**
   * Endpoint for remove 1 or more license. (ADMIN Only)
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
  for (let token of tokens) {
    /**
     * Here we check all input tokens that user give to us.
     */
    let [masterToken, licenseToken] = token ? token.split(':') : [];
    if (masterToken && licenseToken) {
      /**
       * Here we decode the license to make sure it's valid.
       * If it's invalid then the token will be skiped and check next one.
       * The token are decoded into 2 masterLicenseId and licenseId
       */
      let masterLicenseId = Base64.decode(masterToken);
      let licenseId = Base64.decode(licenseToken);
      let license = await context.prisma.license.findOne({
        where: { id: licenseId },
        include: {
          masterLicense: true,
          user: true,
        },
      });

      /**
       * Here we check if the selected license are exist in our DB,
       * and also check if the masterLicenseId we got is the same as
       * masterLicense.id that linked to the license we found.
       * If it's not the same then it's invalid then the token is skiped.
       */
      if (license && masterLicenseId === license.masterLicense.id) {
        /**
         * If all pass then the license will be deleted.
         * Also if the license is deleted then the user linked to it will
         * loss his/her license.
         */
        await context.prisma.license.delete({
          where: {
            id: license.id,
          },
        });
        /**
         * This just for count how much license removed for return message.
         */
        numLicenseDelete += 1;
        /**
         * And then here we create new one so the the number of license in
         * masterLicense still the same.
         */
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
