import { mutationField, FieldResolver, stringArg, arg } from 'nexus';

import { Context } from 'serverTypes';

export let pinTableResolver: FieldResolver<'Mutation', 'pinTable'> = async (
  _,
  { terminalId, tableId, tableType },
  context: Context,
) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

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
  let isFeedExist = selectedTerminal.pinnedFeeds.some(
    ({ tableId: existTableId, tableType: existTableType }) =>
      existTableId === tableId && existTableType === tableType,
  );
  if (isFeedExist) {
    throw new Error('This table already on the terminal');
  }
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
