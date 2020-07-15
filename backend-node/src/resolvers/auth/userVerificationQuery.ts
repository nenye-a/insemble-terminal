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
    /**
     * Endpoint for polling if user verified.
     * Then loged in the user if verified.
     */
    let [verifyId, tokenQuery] = verificationId
      ? verificationId.split(':')
      : [];
    if (!verifyId || !tokenQuery) {
      throw new Error('Invalid verification code');
    }
    /**
     * The token we got from verificationId will be decoded into two, id and tokenQuery.
     * Id used for searching the userRegisterVerification
     * Then we check if the userVerification tokenQuery is the same as we got.
     * NOTE: tokenQuery is different from emailQuery.
     */
    let userVerificationId = Base64.decode(verifyId);
    let userTokenQuery = Base64.decode(tokenQuery);
    let userVerification = await context.prisma.userRegisterVerification.findOne(
      {
        where: {
          id: userVerificationId,
        },
      },
    );
    /**
     * This part is checking if the verification is valid or not.
     * If invalid then throw error.
     */
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
    /**
     * If all check are good, then we create userSession to loged in User.
     */
    return {
      ...userVerification,
      auth: {
        token: createSession(user),
        user: { ...user },
      },
    };
  },
});
