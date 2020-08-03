import { mutationField, FieldResolver, stringArg, arg } from 'nexus';

import { Context } from 'serverTypes';

export let pinTableResolver: FieldResolver<'Mutation', 'pinTable'> = async (
  _,
  { terminalId, tableId, tableType },
  context: Context,
) => {
  /**
   * Endpoint for pin the table into selected terminal. Require all input.
   */
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }
  let table;
  /**
   * First we check if the table exist first.
   */
  switch (tableType) {
    /**
     * Since it on all table different on DB table so tableId will be searched on
     * tableType
     */
    case 'ACTIVITY':
      table = await context.prisma.activity.findOne({
        where: { id: tableId },
      });
      break;
    case 'MAP':
      table = await context.prisma.map.findOne({
        where: { id: tableId },
      });
      break;
    case 'NEWS':
      table = await context.prisma.news.findOne({
        where: { id: tableId },
      });
      break;
    case 'OWNERSHIP_CONTACT':
      table = await context.prisma.ownershipContact.findOne({
        where: { id: tableId },
      });
      break;
    case 'OWNERSHIP_INFO':
      table = await context.prisma.ownershipInfo.findOne({
        where: { id: tableId },
      });
      break;
    case 'PERFORMANCE':
      table = await context.prisma.performance.findOne({
        where: { id: tableId },
      });
      break;
  }
  if (!table) {
    throw new Error('Table not found');
  }

  /**
   * After get the table,
   * Here we check the terminal that user select.
   * The checks are: if exist? if terminal have user?
   * if terminal user are the same who use this endpoint?
   */
  let selectedTerminal = await context.prisma.terminal.findOne({
    where: {
      id: terminalId,
    },
    include: { user: true, pinnedFeeds: true },
  });

  if (!selectedTerminal) {
    throw new Error('Terminal not found.');
  }

  if (!selectedTerminal.user) {
    throw new Error('Terminal not connected to user.');
  }

  if (selectedTerminal.user.id !== user.id) {
    throw new Error('This is not your terminal.');
  }
  /**
   * Here we check if feed already exist so there won't be 2 same table pinned.
   */
  let isFeedExist = selectedTerminal.pinnedFeeds.some(
    ({ tableId: existTableId, tableType: existTableType }) =>
      existTableId === tableId && existTableType === tableType,
  );
  if (isFeedExist) {
    throw new Error('This table already on the terminal');
  }
  /**
   * If all passed then we create pinnedFeed with table ID and table type.
   * And also linked it to selected terminal.
   */
  await context.prisma.pinnedFeed.create({
    data: {
      tableId,
      tableType,
      terminal: {
        connect: {
          id: terminalId,
        },
      },
    },
  });

  return selectedTerminal;
};

export let pinTable = mutationField('pinTable', {
  type: 'Terminal',
  args: {
    terminalId: stringArg({ required: true }),
    tableId: stringArg({ required: true }),
    tableType: arg({ type: 'TableType', required: true }),
  },
  resolve: pinTableResolver,
});
