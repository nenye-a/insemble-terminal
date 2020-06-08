import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';
import { sendContactUsEmail } from '../../helpers/sendEmail';
import { NODE_ENV } from '../../constants/constants';

export let contactUsResolver: FieldResolver<'Mutation', 'contactUs'> = async (
  _,
  { firstName, lastName, company, email, msg },
  context: Context,
) => {
  if (context.userId) {
    let user = await context.prisma.user.findOne({
      where: {
        id: context.userId,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    firstName = user.firstName;
    lastName = user.lastName;
    company = user.company;
    email = user.email;
  }
  if (!firstName || !company || !email) {
    throw new Error('Name, company, and email must be filled.');
  }
  let name = lastName ? `${firstName} ${lastName}` : firstName;
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
    // console the verification id so we could still test it on dev environment
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
