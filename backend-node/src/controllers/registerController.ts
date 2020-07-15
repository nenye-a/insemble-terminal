import { Request, Response } from 'express';
import { Base64 } from 'js-base64';

import { prisma } from '../prisma';
import { FRONTEND_HOST } from '../constants/constants';

export let registerHandler = async (req: Request, res: Response) => {
  /**
   * This function is for verify user register /register-verification/:token.
   */
  let [verifyId, tokenEmail] = req.params.token
    ? req.params.token.split(':')
    : [];
  if (!verifyId || !tokenEmail) {
    throw new Error('Invalid verification code');
  }
  /**
   * The token we got from params will be decoded into two, id and tokenEmail.
   * Id used for searching the userRegisterVerification
   * Then we check if the verification tokenEmail is the same as we got.
   */
  let verificationId = Base64.decode(verifyId);
  let decodedTokenEmail = Base64.decode(tokenEmail);
  let verification = await prisma.userRegisterVerification.findOne({
    where: {
      id: verificationId,
    },
  });
  /**
   * This part is checking if the verification is valid or not.
   * If not we redirected user to front end to show the fail.
   */
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
    /**
     * If there is referralCode on user register input then we refer the registered to referrer.
     * The userId referrer is exist in referralInvitation. So if referralInvitation doesn't exist,
     * then it won't refer to anyone.
     */
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
