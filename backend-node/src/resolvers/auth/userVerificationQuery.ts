import { queryField, stringArg } from 'nexus';

import { createSession } from '../../helpers/auth';
import { Context } from 'serverTypes';

export let userVerification = queryField('userRegisterVerification', {
  type: 'UserRegisterVerification',
  args: {
    verificationId: stringArg({
      required: true,
    }), // TODO: fix naming args
  },
  resolve: async (_, { verificationId }, context: Context) => {
    let [verifyId, tokenQuery] = verificationId
      ? verificationId.split(':')
      : [];
    if (!verifyId || !tokenQuery) {
      throw new Error('Invalid verification code');
    }
    let userVerificationId = Base64.decode(verifyId);
    let userTokenQuery = Base64.decode(tokenQuery);
    let userVerification = await context.prisma.userRegisterVerification.findOne(
      {
        where: {
          id: userVerificationId,
        },
      },
    );
    if (!userVerification) {
      throw new Error('Invalid verification ID');
    }
    let user = await context.prisma.user.findOne({
      where: {
        email: userVerification.email,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }

    if (userTokenQuery !== userVerification.tokenQuery) {
      throw new Error('Invalid token');
    }
    return {
      ...userVerification,
      auth: {
        token: createSession(user),
        user: { ...user },
      },
    };
  },
});
