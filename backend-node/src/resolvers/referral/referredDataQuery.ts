import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';
import { RefferedData } from 'dataTypes';

let referredDataResolver: FieldResolver<'Query', 'referredData'> = async (
  _: Root,
  { referralCode },
  context: Context,
) => {
  let invitationId = Base64.decode(referralCode);
  let referralInvitation = await context.prisma.referralInvitation.findOne({
    where: {
      id: invitationId,
    },
  });
  if (!referralInvitation) {
    throw new Error('Invalid referral code.');
  }
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
