import { GraphQLServer } from 'graphql-yoga';
import { ContextParameters } from 'graphql-yoga/dist/types';

import { prisma } from './prisma';
import { schema } from './schema';
import { authSession } from './helpers/auth';
import { permissions } from './middlewares/permission';
import { registerHandler } from './controllers/registerController';
import { emailVerificationHandler } from './controllers/emailVerificationController';
import { port, hostname, NODE_ENV } from './constants/constants';

import express from 'express';
import path from 'path';

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

// if (NODE_ENV === 'production') {
server.express.use(express.static(path.join(path.dirname(path.dirname(__dirname)), 'frontend', 'build')));
server.express.get('/*', (req, res) => {
  res.sendFile(path.join(path.dirname(path.dirname(__dirname)), 'frontend', 'build', 'index.html'));
})
// }

server.start({ port }, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on ${hostname}:${port}`);
});
