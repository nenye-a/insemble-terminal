import { mutationField, arg } from 'nexus';
import bcrypt from 'bcrypt';

import { Context } from 'serverTypes';
import { NODE_ENV, HOST } from '../../constants/constants';
import { sendVerificationEmail } from '../../helpers/sendEmail';
import getRandomBytes from '../../helpers/getRandomBytes';

export let register = mutationField('register', {
  type: 'UserRegisterResult',
  args: {
    user: arg({ type: 'UserRegisterInput', required: true }),
  },
  resolve: async (_, { user }, context: Context) => {
    let password = bcrypt.hashSync(user.password, 10);
    let lowerCasedEmail = user.email.toLocaleLowerCase();
    let exist = await context.prisma.user.findMany({
      where: {
        email: lowerCasedEmail,
      },
    });
    if (exist.length) {
      throw new Error('user already exist');
    }
    let bytesEmail = await getRandomBytes(18);
    let bytesQuery = await getRandomBytes(18);

    let verification = await context.prisma.userRegisterVerification.create({
      data: {
        userInput: JSON.stringify({
          ...user,
          email: lowerCasedEmail,
          password,
        }),
        email: lowerCasedEmail,
        tokenEmail: bytesEmail.toString('base64'),
        tokenQuery: bytesQuery.toString('base64'),
      },
    });

    let emailVerifyCode =
      Base64.encodeURI(verification.id) +
      ':' +
      Base64.encodeURI(verification.tokenEmail);
    if (NODE_ENV === 'production') {
      sendVerificationEmail(
        {
          email: `${user.email}`,
          name: `${user.firstName} ${user.lastName}`,
        },
        `${HOST}/register-verification/${emailVerifyCode}`,
      );
    } else {
      // console the verification id so we could still test it on dev environment
      // eslint-disable-next-line no-console
      console.log('email verification code:', emailVerifyCode);
    }
    return {
      message: 'success',
      verificationId:
        Base64.encodeURI(verification.id) +
        ':' +
        Base64.encodeURI(verification.tokenQuery),
    };
  },
});
