import { GraphQLServer } from 'graphql-yoga';
import { ContextParameters } from 'graphql-yoga/dist/types';

import { prisma } from './prisma';
import { schema } from './schema';
import { authSession } from './helpers/auth';
import { permissions } from './middlewares/permission';
import { registerHandler } from './controllers/registerController';
import { emailVerificationHandler } from './controllers/emailVerificationController';
import { verifyReferralCodeHandler } from './controllers/verifyReferralCodeController';
import { port, hostname } from './constants/constants';

import express from 'express';
import path from 'path';

/**
 * This file contain main initial create server for GQL Server.
 */
const server = new GraphQLServer({
  schema,
  context: async ({ request }: ContextParameters) => {
    /**
     * This is the context config for GQLServer
     */
    let authorization = request.get('Authorization') || '';
    /**
     * Token check for bearer token
     */
    let token = authorization.replace(/^Bearer /, '');
    let authSessionResult = await authSession(token);

    return {
      prisma,
      ...authSessionResult,
    };
  },
  middlewares: [permissions],
});

/**
 * server.express is the gql server way to use express rest (path endpoints)
 */
server.express.get('/register-verification/:token', registerHandler);
server.express.get('/email-verification/:token', emailVerificationHandler);
server.express.get('/verify-referral/:token', verifyReferralCodeHandler);

server.express.use(
  express.static(
    path.join(path.dirname(path.dirname(__dirname)), 'frontend', 'build'),
  ),
);
server.express.get('/*', (req, res) => {
  res.sendFile(
    path.join(
      path.dirname(path.dirname(__dirname)),
      'frontend',
      'build',
      'index.html',
    ),
  );
});

server.start({ port }, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on ${hostname}:${port}`);
});
