import { mutationField, arg, stringArg } from 'nexus';
import bcrypt from 'bcrypt';

import { Context } from 'serverTypes';
import { NODE_ENV, HOST } from '../../constants/constants';
import { sendVerificationEmail } from '../../helpers/sendEmail';
import getRandomBytes from '../../helpers/getRandomBytes';

export let register = mutationField('register', {
  type: 'MessageWithVerificationId',
  args: {
    user: arg({ type: 'UserRegisterInput', required: true }),
    referralCode: stringArg(),
  },
  resolve: async (_, { user, referralCode }, context: Context) => {
    /**
     * Endpoint for register user.
     */
    let password = bcrypt.hashSync(user.password, 10);
    let lowerCasedEmail = user.email.toLocaleLowerCase();
    let exist = await context.prisma.user.findMany({
      where: {
        email: lowerCasedEmail,
      },
    });
    /**
     * This check if the user already exist.
     */
    if (exist.length) {
      throw new Error('user already exist');
    }
    let bytesEmail = await getRandomBytes(18);
    let bytesQuery = await getRandomBytes(18);

    /**
     * This part is for creating userRegisterVerification that will be used on
     * registerController.
     */
    let verification = await context.prisma.userRegisterVerification.create({
      data: {
        userInput: JSON.stringify({
          ...user,
          email: lowerCasedEmail,
          password,
          referralCode,
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
    /**
     * This where we send the link to email in production.
     * Or console the verifyCode if in dev.
     */
    if (NODE_ENV === 'production') {
      sendVerificationEmail(
        {
          email: `${user.email}`,
          name: `${user.firstName} ${user.lastName}`,
        },
        `Thank you for signing up with Insemble Terminal.
        Please use the following link to verify your email
        address and complete your registration.`,
        `${HOST}/register-verification/${emailVerifyCode}`,
      );
    } else {
      // console the verification id so we could still test it on dev environment
      // eslint-disable-next-line no-console
      console.log('email verification code:', emailVerifyCode);
    }
    /**
     * Then if success, we giving back message and the verificationId.
     * This verificationId will be used on userVerificationQuery Polling.
     */
    return {
      message: 'success',
      verificationId:
        Base64.encodeURI(verification.id) +
        ':' +
        Base64.encodeURI(verification.tokenQuery),
    };
  },
});
