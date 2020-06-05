import { mutationField, FieldResolver, stringArg, intArg } from 'nexus';

import { Context } from 'serverTypes';

export let activateAccountResolver: FieldResolver<
  'Mutation',
  'activateAccount'
> = async (_, { activationToken }, context: Context) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
    include: {
      license: true,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  if (user.role === 'ADMIN') {
    throw new Error('No need to activate license for admin.');
  }

  if (user.license) {
    return user;
  }

  let [masterToken, licenseToken] = activationToken
    ? activationToken.split(':')
    : [];
  if (!masterToken || !licenseToken) {
    throw new Error('Invalid license token.');
  }
  let masterLicenseId = Base64.decode(masterToken);
  let licenseId = Base64.decode(licenseToken);
  let license = await context.prisma.license.findOne({
    where: { id: licenseId },
    include: {
      masterLicense: true,
      user: true,
    },
  });

  if (!license || masterLicenseId !== license.masterLicense.id) {
    throw new Error('Invalid license token.');
  }

  if (license.user) {
    throw new Error('License already used.');
  }

  await context.prisma.user.update({
    where: { id: user.id },
    data: {
      license: { connect: { id: license.id } },
    },
  });

  return user;
};

export let activateAccount = mutationField('activateAccount', {
  type: 'User',
  args: {
    activationToken: stringArg({ required: true }),
  },
  resolve: activateAccountResolver,
});
