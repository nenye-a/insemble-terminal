import { mutationField, FieldResolver, arg } from 'nexus';

import { Context } from 'serverTypes';
import { NODE_ENV, HOST } from '../../constants/constants';
import { sendReferralEmail } from '../../helpers/sendEmail';

export let createReferralResolver: FieldResolver<
  'Mutation',
  'createReferral'
> = async (_, { referredData }, context: Context) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
    include: {
      license: true,
    },
  });
  let { email, ...otherData } = referredData;

  if (!user) {
    throw new Error('User not found!');
  }
  let lowerCasedEmail = email.toLocaleLowerCase();
  let exist = await context.prisma.user.findMany({
    where: {
      email: lowerCasedEmail,
    },
  });

  if (exist.length) {
    throw new Error('Referred email already exist as user.');
  }

  let referralInvitation = await context.prisma.referralInvitation.create({
    data: {
      referrer: user.id,
      referred: JSON.stringify({
        ...otherData,
        email: lowerCasedEmail,
      }),
    },
  });

  let emailReferralCode = Base64.encodeURI(referralInvitation.id);

  if (NODE_ENV === 'production') {
    sendReferralEmail(
      {
        email: `${lowerCasedEmail}`,
        name: `${referredData.firstName} ${referredData.lastName}`,
      },
      {
        email: `${user.email}`,
        name: `${user.firstName} ${user.lastName}`,
      },
      `${HOST}/verify-referral/${emailReferralCode}`,
    );
  } else {
    // console the verification id so we could still test it on dev environment
    // eslint-disable-next-line no-console
    console.log('email referral code:', emailReferralCode);
  }

  return 'success';
};

export let createReferral = mutationField('createReferral', {
  type: 'String',
  args: {
    referredData: arg({ type: 'ReferredDataInput', required: true }),
  },
  resolve: createReferralResolver,
});
