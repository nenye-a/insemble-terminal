import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let resetPasswordResolver: FieldResolver<
  'Query',
  'resetPasswordVerification'
> = async (_: Root, { verificationCode }, context: Context) => {
  let [verifyId, tokenEmail] = verificationCode
    ? verificationCode.split(':')
    : [];
  if (!verifyId || !tokenEmail) {
    throw new Error('Invalid verification code');
  }
  let userRPVerificationId = Base64.decode(verifyId);
  let decodedTokenEmail = Base64.decode(tokenEmail);
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

  return {
    message: 'success',
    verificationId:
      Base64.encodeURI(userRPVerification.id) +
      ':' +
      Base64.encodeURI(userRPVerification.tokenQuery),
  };
};

let resetPasswordVerification = queryField('resetPasswordVerification', {
  type: 'UserRegisterResult',
  resolve: resetPasswordResolver,
  args: {
    verificationCode: stringArg({ required: true }),
  },
});

export { resetPasswordVerification };
