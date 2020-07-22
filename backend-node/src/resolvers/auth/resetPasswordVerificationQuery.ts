import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let resetPasswordResolver: FieldResolver<
  'Query',
  'resetPasswordVerification'
> = async (_: Root, { verificationCode }, context: Context) => {
  /**
   * Endpoint for verify the token that email give to Front end then returning
   * the queryToken for reseting password.
   */
  let [verifyId, tokenEmail] = verificationCode
    ? verificationCode.split(':')
    : [];
  if (!verifyId || !tokenEmail) {
    throw new Error('Invalid verification code');
  }
  let userRPVerificationId = Base64.decode(verifyId);
  let decodedTokenEmail = Base64.decode(tokenEmail);
  /**
   * The token we got from verificationCode will be decoded into two, id and tokenEmail.
   * Id used for searching the userRegisterVerification
   * Then we check if the userRPVerification tokenEmail is the same as we got.
   * NOTE: tokenEmail is different from tokenQuery.
   */
  let userRPVerification = await context.prisma.userResetPasswordVerification.findOne(
    {
      where: {
        id: userRPVerificationId,
      },
      include: {
        user: true,
      },
    },
  );
  if (!userRPVerification) {
    throw new Error('Invalid verification code');
  }

  if (userRPVerification.verified) {
    throw new Error('Verification code already used.');
  }

  if (decodedTokenEmail !== userRPVerification.tokenEmail) {
    throw new Error('Invalid token');
  }
  /**
   * If all check are passed, then we return back the verificationId with tokenQuery.
   * This verificationId will be used on resetPasswordMutation to change password.
   */
  return {
    message: 'success',
    verificationId:
      Base64.encodeURI(userRPVerification.id) +
      ':' +
      Base64.encodeURI(userRPVerification.tokenQuery),
  };
};

let resetPasswordVerification = queryField('resetPasswordVerification', {
  type: 'MessageWithVerificationId',
  resolve: resetPasswordResolver,
  args: {
    verificationCode: stringArg({ required: true }),
  },
});

export { resetPasswordVerification };
