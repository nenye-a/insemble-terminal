import { mutationField, stringArg } from 'nexus';
import bcrypt from 'bcrypt';

import { Root, Context } from 'serverTypes';
import { createSession } from '../../helpers/auth';

let login = mutationField('login', {
  type: 'Auth',
  args: {
    email: stringArg({ required: true }),
    password: stringArg({ required: true }),
  },
  resolve: async (_: Root, { email, password }, context: Context) => {
    /**
     * Endpoint for user login.
     */
    let lowercasedEmail = email.toLowerCase();
    let user = await context.prisma.user.findOne({
      where: {
        email: lowercasedEmail,
      },
    });
    /**
     * Here will check if the user email and the password are correct.
     */
    if (!user) {
      throw new Error('Email not found or wrong password');
    }
    let validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      throw new Error('Email not found or wrong password');
    }
    /**
     * If all correct then we create userSession then give back the bearer token.
     */
    return {
      token: createSession(user),
      user,
    };
  },
});

export { login };
