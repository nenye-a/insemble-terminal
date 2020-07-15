import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';
import { sendContactUsEmail } from '../../helpers/sendEmail';
import { NODE_ENV } from '../../constants/constants';

export let contactUsResolver: FieldResolver<'Mutation', 'contactUs'> = async (
  _,
  { firstName, lastName, company, email, msg },
  context: Context,
) => {
  /**
   * Endpoint for creating contact email and send to sales@insemblegroup.com.
   */
  if (context.userId) {
    /**
     * This checking if the one who contact is from user or not.
     */
    let user = await context.prisma.user.findOne({
      where: {
        id: context.userId,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    /**
     * If user then use user data to fill the information field.
     * Else using from frontend input.
     */
    firstName = user.firstName;
    lastName = user.lastName;
    company = user.company;
    email = user.email;
  }
  /**
   * Here check if not user, then all required field must be exist.
   */
  if (!firstName || !company || !email) {
    throw new Error('Name, company, and email must be filled.');
  }
  /**
   * If user doesn't have last name then it will be only frist name.
   */
  let name = lastName ? `${firstName} ${lastName}` : firstName;
  /**
   * This where we send the message to CP in production.
   * Or console the email if in dev.
   */
  if (NODE_ENV === 'production') {
    sendContactUsEmail(
      {
        email,
        name,
        company,
      },
      msg,
    );
  } else {
    // console the email so we know it from who on dev environment
    // eslint-disable-next-line no-console
    console.log('Email send from: ', email);
  }

  return 'Success';
};

export let contactUs = mutationField('contactUs', {
  type: 'String',
  args: {
    firstName: stringArg(),
    lastName: stringArg(),
    company: stringArg(),
    email: stringArg(),
    msg: stringArg({ required: true }),
  },
  resolve: contactUsResolver,
});
