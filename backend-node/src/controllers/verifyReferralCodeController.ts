import { Request, Response } from 'express';
import { Base64 } from 'js-base64';

import { prisma } from '../prisma';
import { FRONTEND_HOST } from '../constants/constants';

export let verifyReferralCodeHandler = async (req: Request, res: Response) => {
  /**
   * This function is for verify the referralCode /verify-referral/:token.
   * It's checking if the referralCode is valid or not.
   */
  let referralCode = req.params.token;
  if (!referralCode) {
    throw new Error('Invalid verification code');
  }
  /**
   * The token we got from params will be decoded into invitationId.
   * Id used for searching the referralInvitation
   */
  let invitationId = Base64.decode(referralCode);
  let referralInvitation = await prisma.referralInvitation.findOne({
    where: {
      id: invitationId,
    },
  });
  /**
   * This part is checking if the referralInvitation is valid or not.
   * If not we redirected user to front end to show the invalid.
   */
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

  /**
   * If the referred user is already exist in our user then we also redirected it as fail.
   */
  if (exist.length) {
    res.redirect(`${FRONTEND_HOST}/verify-referral-code-failed/exist`);
    return;
  }
  /**
   * If it's success we redirect it to register scene with referral Code.
   */
  res.redirect(`${FRONTEND_HOST}/signup/${referralCode}`);
};
