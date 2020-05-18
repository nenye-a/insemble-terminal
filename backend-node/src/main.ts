import { GraphQLServer } from 'graphql-yoga';
import { ContextParameters } from 'graphql-yoga/dist/types';

import { prisma } from './prisma';
import { schema } from '../src/schema';
import { authSession } from './helpers/auth';
import { permissions } from './middlewares/permission';
import { registerHandler } from './controllers/registerController';
import { emailVerificationHandler } from './controllers/emailVerificationController';

const server = new GraphQLServer({
  schema,
  context: async ({ request }: ContextParameters) => {
    let authorization = request.get('Authorization') || '';
    let token = authorization.replace(/^Bearer /, '');
    let authSessionResult = await authSession(token);

    return {
      prisma,
      ...authSessionResult,
    };
  },
  middlewares: [permissions],
});

server.express.get('/register-verification/:token', registerHandler);

server.express.get('/email-verification/:token', emailVerificationHandler);

server.start({}, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:4000`);
});
