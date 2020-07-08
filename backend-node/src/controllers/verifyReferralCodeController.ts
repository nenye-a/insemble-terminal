import { Request, Response } from 'express';
import { Base64 } from 'js-base64';

import { prisma } from '../prisma';
import { FRONTEND_HOST } from '../constants/constants';

export let verifyReferralCodeHandler = async (req: Request, res: Response) => {
  let referralCode = req.params.token;
  if (!referralCode) {
    throw new Error('Invalid verification code');
  }
  let invitationId = Base64.decode(referralCode);
  let referralInvitation = await prisma.referralInvitation.findOne({
    where: {
      id: invitationId,
    },
  });
  if (!referralInvitation) {
    res.redirect(`${FRONTEND_HOST}/verify-referral-code-failed/invalid`);
    return;
  }
  if (referralInvitation.used) {
    res.redirect(`${FRONTEND_HOST}/verify-referral-code-failed/used`);
    return;
  }

  let referred = JSON.parse(referralInvitation.referred);

  let exist = await prisma.user.findMany({
    where: {
      email: referred.email,
    },
  });

  if (exist.length) {
    res.redirect(`${FRONTEND_HOST}/verify-referral-code-failed/exist`);
    return;
  }
  res.redirect(`${FRONTEND_HOST}/signup/${referralCode}`);
};
