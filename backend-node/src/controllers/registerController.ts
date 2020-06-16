import { Request, Response } from 'express';
import { Base64 } from 'js-base64';

import { prisma } from '../prisma';
import { FRONTEND_HOST } from '../constants/constants';

export let registerHandler = async (req: Request, res: Response) => {
  let [verifyId, tokenEmail] = req.params.token
    ? req.params.token.split(':')
    : [];
  if (!verifyId || !tokenEmail) {
    throw new Error('Invalid verification code');
  }
  let verificationId = Base64.decode(verifyId);
  let decodedTokenEmail = Base64.decode(tokenEmail);
  let verification = await prisma.userRegisterVerification.findOne({
    where: {
      id: verificationId,
    },
  });
  if (!verification) {
    res.redirect(`${FRONTEND_HOST}/verification-failed/invalid`);
    return;
  }
  if (verification.verified) {
    res.redirect(`${FRONTEND_HOST}/verification-failed/used`);
    return;
  }
  if (decodedTokenEmail !== verification.tokenEmail) {
    res.redirect(`${FRONTEND_HOST}/verification-failed/invalid`);
    return;
  }
  let user = JSON.parse(verification.userInput);

  await prisma.user.create({
    data: {
      ...user,
    },
  });

  await prisma.userRegisterVerification.update({
    data: {
      verified: true,
    },
    where: {
      id: verificationId,
    },
  });
  res.redirect(`${FRONTEND_HOST}/verification-successful`);
};
