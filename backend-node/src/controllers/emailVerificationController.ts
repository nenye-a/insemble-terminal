import { Request, Response } from 'express';
import { Base64 } from 'js-base64';

import { prisma } from '../prisma';
import { FRONTEND_HOST } from '../constants/constants';

export let emailVerificationHandler = async (req: Request, res: Response) => {
  let [verifyId, tokenEmail] = req.params.token
    ? req.params.token.split(':')
    : [];
  if (!verifyId || !tokenEmail) {
    throw new Error('Invalid verification code');
  }
  let emailVerificationId = Base64.decode(verifyId);
  let decodedTokenEmail = Base64.decode(tokenEmail);
  let emailVerification = await prisma.userEmailVerification.findOne({
    where: {
      id: emailVerificationId,
    },
    include: {
      user: true,
    },
  });
  if (!emailVerification) {
    res.redirect(`${FRONTEND_HOST}/verification-failed/invalid`);
    return;
  }
  if (emailVerification.verified) {
    res.redirect(`${FRONTEND_HOST}/verification-failed/used`);
    return;
  }
  if (decodedTokenEmail !== emailVerification.tokenEmail) {
    res.redirect(`${FRONTEND_HOST}/verification-failed/invalid`);
    return;
  }
  await prisma.user.update({
    data: {
      email: emailVerification.email,
      pendingEmail: false,
    },
    where: {
      id: emailVerification.user.id,
    },
  });
  res.redirect(`${FRONTEND_HOST}/verification-successful`);
};
