import { Request, Response } from 'express';
import { Base64 } from 'js-base64';

import { prisma } from '../prisma';
import { FRONTEND_HOST } from '../constants/constants';

export let emailVerificationHandler = async (req: Request, res: Response) => {
  /**
   * This function is for verify email change /email-verification/:token.
   */
  let [verifyId, tokenEmail] = req.params.token
    ? req.params.token.split(':')
    : [];
  if (!verifyId || !tokenEmail) {
    throw new Error('Invalid verification code');
  }
  /**
   * The token we got from params will be decoded into two, id and tokenEmail.
   * Id used for searching the userEmailVerification
   * Then we check if the emailVerification tokenEmail is the same as we got.
   */
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
  /**
   * This part is checking if the verification is valid or not.
   * If not we redirected user to front end to show the fail.
   */
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
