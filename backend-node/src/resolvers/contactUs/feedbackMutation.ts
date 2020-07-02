import { mutationField, FieldResolver, stringArg, arg } from 'nexus';

import { Context } from 'serverTypes';
import { sendFeedbackEmail } from '../../helpers/sendEmail';
import { NODE_ENV } from '../../constants/constants';
import getFeedString from '../../helpers/getFeedString';
import { AllTableType } from 'dataTypes';

export let feedbackResolver: FieldResolver<'Mutation', 'feedback'> = async (
  _,
  { feedbackTitle, feedbackDetail, tableType, tableId, customFeed },
  context: Context,
) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });
  if (!user) {
    throw new Error('User not found');
  }

  let feed = customFeed ? customFeed : 'General';
  if (tableType && tableId) {
    let table;
    let type: undefined | AllTableType;
    switch (tableType) {
      case 'ACTIVITY':
        table = await context.prisma.activity.findOne({
          where: { id: tableId },
          include: {
            businessTag: true,
            locationTag: true,
          },
        });
        break;
      case 'MAP':
        table = await context.prisma.map.findOne({
          where: { id: tableId },
          include: {
            businessTag: true,
            locationTag: true,
          },
        });
        break;
      case 'NEWS':
        table = await context.prisma.news.findOne({
          where: { id: tableId },
          include: {
            businessTag: true,
            locationTag: true,
          },
        });
        break;
      case 'OWNERSHIP_CONTACT':
        table = await context.prisma.ownershipContact.findOne({
          where: { id: tableId },
          include: {
            businessTag: true,
            locationTag: true,
          },
        });
        type = table.type;
        break;
      case 'OWNERSHIP_INFO':
        table = await context.prisma.ownershipInfo.findOne({
          where: { id: tableId },
          include: {
            businessTag: true,
            locationTag: true,
          },
        });
        type = table.type;
        break;
      case 'PERFORMANCE':
        table = await context.prisma.performance.findOne({
          where: { id: tableId },
          include: {
            businessTag: true,
            locationTag: true,
          },
        });
        type = table.type;
        break;
    }
    if (!table) {
      throw new Error('Table not found');
    }
    feed = getFeedString({
      tableType,
      type,
      businessTag: table.businessTag,
      locationTag: table.locationTag,
    });
  }
  let name = `${user.firstName} ${user.lastName}`;
  await context.prisma.feedBack.create({
    data: {
      feed,
      email: user.email,
      title: feedbackTitle,
      detail: feedbackDetail,
    },
  });
  if (NODE_ENV === 'production') {
    sendFeedbackEmail(
      {
        email: user.email,
        name,
      },
      {
        feed,
        title: feedbackTitle,
        detail: feedbackDetail,
      },
    );
  } else {
    // console the verification id so we could still test it on dev environment
    // eslint-disable-next-line no-console
    console.log('Email send from: ', user.email);
  }

  return 'Success';
};

export let feedback = mutationField('feedback', {
  type: 'String',
  args: {
    feedbackTitle: stringArg({ required: true }),
    feedbackDetail: stringArg(),
    customFeed: stringArg(),
    tableType: arg({ type: 'TableType' }),
    tableId: stringArg(),
  },
  resolve: feedbackResolver,
});
