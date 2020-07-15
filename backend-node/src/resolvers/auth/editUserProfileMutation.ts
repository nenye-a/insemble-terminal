import { FieldResolver, mutationField, arg } from 'nexus';
import bcrypt from 'bcrypt';

import { Root, Context } from 'serverTypes';
import { NODE_ENV, HOST } from '../../constants/constants';
import { sendVerificationEmail } from '../../helpers/sendEmail';
import getRandomBytes from '../../helpers/getRandomBytes';

let editUserProfileResolver: FieldResolver<
  'Mutation',
  'editUserProfile'
> = async (_: Root, { profile }, context: Context) => {
  /**
   * Endpoint for edit user profile.
   */
  let currentUser = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });
  if (!currentUser) {
    throw new Error('User not found');
  }
  /**
   * Check if user change the email.
   */
  if (
    profile.email &&
    profile.email.toLocaleLowerCase() !== currentUser.email
  ) {
    let lowercasedEmail = profile.email.toLocaleLowerCase();
    let emailExist = await context.prisma.user.findOne({
      where: {
        email: lowercasedEmail,
      },
    });
    /**
     * We throw error if the edited email is exist as user.
     */
    if (emailExist && emailExist.id !== context.userId) {
      throw new Error('Email already exist');
    }

    let bytesEmail = await getRandomBytes(18);
    /**
     * If the email can be used then we create userEmailVerification.
     * This will be used on emailVerificationController to verify the email.
     */
    let userEmailVerification = await context.prisma.userEmailVerification.create(
      {
        data: {
          email: lowercasedEmail,
          user: {
            connect: { id: context.userId },
          },
          tokenEmail: bytesEmail.toString('base64'),
        },
      },
    );
    let emailVerifyCode =
      Base64.encodeURI(userEmailVerification.id) +
      ':' +
      Base64.encodeURI(userEmailVerification.tokenEmail);

    await context.prisma.user.update({
      data: {
        pendingEmail: true,
      },
      where: {
        id: context.userId,
      },
    });
    /**
     * This where we send the link to email in production.
     * Or console the verifyCode if in dev.
     */
    if (NODE_ENV === 'production') {
      sendVerificationEmail(
        {
          email: userEmailVerification.email,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
        },
        `${HOST}/email-verification/${emailVerifyCode}`,
      );
    } else {
      // console the verification id so we could still test it on dev environment
      // eslint-disable-next-line no-console
      console.log('Change Email verify code: ', emailVerifyCode);
    }
  }

  /**
   * This the case that if user want to change password.
   * We check the oldPassword first if it's correct then we proceed to change it with newPassword.
   */
  if (profile.oldPassword && profile.newPassword) {
    if (!bcrypt.compareSync(profile.oldPassword, currentUser.password || '')) {
      throw new Error('Wrong current password');
    }
  }
  let { oldPassword, newPassword, email, ...updateData } = profile;
  let password = newPassword ? bcrypt.hashSync(newPassword, 10) : undefined;
  let user = await context.prisma.user.update({
    data: {
      ...updateData,
      password,
    },
    where: {
      id: context.userId,
    },
  });
  return user;
};

let editUserProfile = mutationField('editUserProfile', {
  type: 'User',
  args: { profile: arg({ type: 'EditProfileInput', required: true }) },
  resolve: editUserProfileResolver,
});

export { editUserProfile };
