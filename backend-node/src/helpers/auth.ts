import { prisma } from '../prisma';
import getRandomBytes from './getRandomBytes';
import { User } from '@prisma/client';

export async function authSession(authToken: string | undefined) {
  let [sessionID, sessionToken] = authToken ? authToken.split(':') : [];
  /**
   * This function is for checking if the authToken is valid by checking our userSession id and token.
   */
  if (!sessionID || !sessionToken) {
    return null;
  }
  let session = await prisma.userSession.findOne({
    where: { id: sessionID },
    include: { user: true },
  });
  if (!session) {
    return null;
  }
  let { user, token } = session;

  if (token !== sessionToken) {
    return null;
  }
  return {
    userId: user.id,
  };
}

export async function createSession(user: User) {
  /**
   * This function is for creating userSession with random generated token.
   */
  let bytes = await getRandomBytes(18);
  let sessionData = {
    data: {
      token: bytes.toString('base64'),
      user: { connect: { id: user.id } },
    },
  };
  let session = await prisma.userSession.create(sessionData);
  return session.id + ':' + session.token;
}
