import { mutationField, FieldResolver, stringArg, intArg } from 'nexus';

import { Context } from 'serverTypes';

export let createLicenseResolver: FieldResolver<
  'Mutation',
  'createLicense'
> = async (_, { numToken, masterName }, context: Context) => {
  /**
   * Endpoint for creating numToken of license. (ADMIN Only)
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
   * This part is for creating array with length numToken.
   */
  let createLicenses = Array.from({ length: numToken }, () => ({}));

  let masterLicense = await context.prisma.masterLicense.create({
    data: {
      maxLicense: numToken,
      name: masterName,
      licenses: {
        create: createLicenses,
      },
    },
    include: { licenses: true },
  });
  /**
   * Then created license and master are encoded before send back to frontEnd
   */
  let masterToken = Base64.encodeURI(masterLicense.id);
  let licensesToken = masterLicense.licenses.map(
    ({ id }) => masterToken + ':' + Base64.encodeURI(id),
  );

  return { masterToken, tokens: licensesToken };
};

export let createLicense = mutationField('createLicense', {
  type: 'CreateLicense',
  args: {
    numToken: intArg({ required: true }),
    masterName: stringArg({ required: true }),
  },
  resolve: createLicenseResolver,
});
