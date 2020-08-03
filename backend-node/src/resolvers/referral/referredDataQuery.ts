import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';
import { RefferedData } from 'dataTypes';

let referredDataResolver: FieldResolver<'Query', 'referredData'> = async (
  _: Root,
  { referralCode },
  context: Context,
) => {
  /**
   * Endpoint for checking referralCode validation and give back the referredData.
   */
  let invitationId = Base64.decode(referralCode);
  let referralInvitation = await context.prisma.referralInvitation.findOne({
    where: {
      id: invitationId,
    },
  });
  /**
   * Here we check if the referralInvitation are exist on DB or not.
   */
  if (!referralInvitation) {
    throw new Error('Invalid referral code.');
  }
  /**
   * If it's exist then we parse the JSON string into RefferedDataObject
   * then send it to front end to fill the register form.
   */
  let referredData: RefferedData = JSON.parse(referralInvitation.referred);
  return referredData;
};

let referredData = queryField('referredData', {
  type: 'ReferredData',
  args: {
    referralCode: stringArg({ required: true }),
  },
  resolve: referredDataResolver,
});

export { referredData };
