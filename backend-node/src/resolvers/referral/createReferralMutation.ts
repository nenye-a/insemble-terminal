import { mutationField, FieldResolver, arg } from 'nexus';

import { Context } from 'serverTypes';
import { NODE_ENV, HOST } from '../../constants/constants';
import { sendReferralEmail } from '../../helpers/sendEmail';

export let createReferralResolver: FieldResolver<
  'Mutation',
  'createReferral'
> = async (_, { referredData }, context: Context) => {
  /**
   * Endpoint for create referral and send email to referred.
   */
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
    include: {
      license: true,
    },
  });
  /**
   * referredData is data input from referrer.
   */
  let { email, ...otherData } = referredData;

  if (!user) {
    throw new Error('User not found!');
  }
  let lowerCasedEmail = email.toLocaleLowerCase();
  /**
   * We check first if the referred email already exist as user.
   * If it's then we throw an error.
   */
  let exist = await context.prisma.user.findMany({
    where: {
      email: lowerCasedEmail,
    },
  });

  if (exist.length) {
    throw new Error('Referred email already exist as user.');
  }

  /**
   * Then we create the invitation and save referred data in JSON String.
   */
  let referralInvitation = await context.prisma.referralInvitation.create({
    data: {
      referrer: user.id,
      referred: JSON.stringify({
        ...otherData,
        email: lowerCasedEmail,
      }),
    },
  });

  /**
   * Then created invitationId encoded then send it to email as referralCode.
   */
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
