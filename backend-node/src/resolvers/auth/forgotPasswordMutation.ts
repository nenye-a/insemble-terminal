import { mutationField, FieldResolver, stringArg } from 'nexus';
import { Base64 } from 'js-base64';

import { Context } from 'serverTypes';
import { sendForgotPasswordEmail } from '../../helpers/sendEmail';
import { NODE_ENV, FRONTEND_HOST } from '../../constants/constants';
import getRandomBytes from '../../helpers/getRandomBytes';

let forgotPasswordResolver: FieldResolver<
  'Mutation',
  'forgotPassword'
> = async (_, { email }, context: Context) => {
  let lowerCasedEmail = email.toLocaleLowerCase();
  let existing = await context.prisma.user.findOne({
    where: { email: lowerCasedEmail },
  });
  if (!existing) {
    throw new Error('User not found!');
  }
  let userRPVerification;
  let existingUserRPVerification = await context.prisma.userResetPasswordVerification.findMany(
    {
      where: {
        email: lowerCasedEmail,
        verified: false,
      },
    },
  );
  if (existingUserRPVerification.length) {
    userRPVerification = existingUserRPVerification[0];
  } else {
    let bytesEmail = await getRandomBytes(18);
    let bytesQuery = await getRandomBytes(18);
    userRPVerification = await context.prisma.userResetPasswordVerification.create(
      {
        data: {
          user: { connect: { id: existing.id } },
          email: lowerCasedEmail,
          tokenEmail: bytesEmail.toString('base64'),
          tokenQuery: bytesQuery.toString('base64'),
        },
      },
    );
  }
  let emailVerifyCode =
    Base64.encodeURI(userRPVerification.id) +
    ':' +
    Base64.encodeURI(userRPVerification.tokenEmail);

  if (NODE_ENV === 'production') {
    sendForgotPasswordEmail(
      {
        email: `${existing.email}`,
        name: `${existing.firstName} ${existing.lastName}`,
      },
      `We received a request to reset the 
      password directed to this e-mail address. 
      Please proceed by clicking this link :`,
      `${FRONTEND_HOST}/reset-password/${emailVerifyCode}`,
    );
  } else {
    // console the verification id so we could still test it on dev environment
    // eslint-disable-next-line no-console
    console.log('Reset password verify code: ', emailVerifyCode);
  }

  return 'success';
};

export let forgotPassword = mutationField('forgotPassword', {
  type: 'String',
  args: {
    email: stringArg({ required: true }),
  },
  resolve: forgotPasswordResolver,
});
