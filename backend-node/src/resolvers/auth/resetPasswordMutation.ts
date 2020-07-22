import { mutationField, FieldResolver, stringArg } from 'nexus';
import { Base64 } from 'js-base64';
import bcrypt from 'bcrypt';

import { Context } from 'serverTypes';

let resetPasswordResolver: FieldResolver<'Mutation', 'resetPassword'> = async (
  _,
  { verificationCode, password },
  context: Context,
) => {
  /**
   * Endpoint for reseting old password with new password and verificationCode.
   * verificationCode is not from email but from resetPasswordVerificationQuery.
   */
  let [verifyId, tokenQuery] = verificationCode
    ? verificationCode.split(':')
    : [];
  if (!verifyId || !tokenQuery) {
    throw new Error('Invalid verification code');
  }
  let userResetPasswordTokenQuery = Base64.decode(tokenQuery);
  let userRPVerificationId = Base64.decode(verifyId);
  /**
   * The token we got from verificationCode will be decoded into two, id and tokenQuery.
   * Id used for searching the userRegisterVerification
   * Then we check if the userRPVerification tokenQuery is the same as we got.
   * And also we check if user exist or not.
   * NOTE: tokenQuery is different from tokenEmail.
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

  if (userResetPasswordTokenQuery !== userRPVerification.tokenQuery) {
    throw new Error('Invalid token');
  }

  let targetUser = await context.prisma.user.findOne({
    where: { id: userRPVerification.user.id },
  });

  if (!targetUser) {
    throw new Error('User not found!');
  }

  /**
   * If all check are passed then we change the password here.
   * Then also mark the userResetPasswordVerification request as verified.
   */
  let cryptedPassword = bcrypt.hashSync(password, 10);
  await context.prisma.user.update({
    data: {
      password: cryptedPassword,
    },
    where: {
      id: targetUser.id,
    },
  });
  await context.prisma.userResetPasswordVerification.update({
    data: {
      verified: true,
    },
    where: {
      id: userRPVerification.id,
    },
  });

  return {
    message: 'success',
    verificationId:
      Base64.encodeURI(userRPVerification.id) +
      ':' +
      Base64.encodeURI(userRPVerification.tokenQuery),
  };
};

export let resetPassword = mutationField('resetPassword', {
  type: 'UserRegisterResult',
  args: {
    password: stringArg({ required: true }),
    verificationCode: stringArg({ required: true }),
  },
  resolve: resetPasswordResolver,
});
