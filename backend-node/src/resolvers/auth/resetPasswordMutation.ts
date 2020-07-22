import { mutationField, FieldResolver, stringArg } from 'nexus';
import { Base64 } from 'js-base64';
import bcrypt from 'bcrypt';

import { Context } from 'serverTypes';

let resetPasswordResolver: FieldResolver<'Mutation', 'resetPassword'> = async (
  _,
  { verificationCode, password },
  context: Context,
) => {
  let [verifyId, tokenQuery] = verificationCode
    ? verificationCode.split(':')
    : [];
  let userResetPasswordTokenQuery = Base64.decode(tokenQuery);
  if (!verifyId || !tokenQuery) {
    throw new Error('Invalid verification code');
  }
  let userRPVerificationId = Base64.decode(verifyId);
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
