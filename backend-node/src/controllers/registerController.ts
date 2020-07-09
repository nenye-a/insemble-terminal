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
  let { referralCode, ...user } = JSON.parse(verification.userInput);
  let userReferrer;
  if (referralCode) {
    let invitationId = Base64.decode(referralCode);
    let referralInvitation = await prisma.referralInvitation.findOne({
      where: {
        id: invitationId,
      },
    });
    if (referralInvitation) {
      userReferrer = await prisma.user.findOne({
        where: {
          id: referralInvitation.referrer,
        },
      });
      await prisma.referralInvitation.update({
        where: { id: referralInvitation.id },
        data: {
          used: true,
        },
      });
    }
  }

  await prisma.user.create({
    data: {
      referrer: userReferrer
        ? {
            connect: { id: userReferrer.id },
          }
        : undefined,
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
