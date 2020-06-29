import { mutationField, FieldResolver, stringArg, arg } from 'nexus';

import { Context } from 'serverTypes';

export let removePinnedTableResolver: FieldResolver<
  'Mutation',
  'removePinnedTable'
> = async (_, { pinTableId }, context: Context) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  let selectedPinnedTable = await context.prisma.pinnedFeed.findOne({
    where: {
      id: pinTableId,
    },
    include: { terminal: { include: { user: true } } },
  });

  if (!selectedPinnedTable) {
    throw new Error('Pinned table not found.');
  }
  if (!selectedPinnedTable.terminal) {
    throw new Error('Pinned table not connected to terminal.');
  }

  if (!selectedPinnedTable.terminal.user) {
    throw new Error('Terminal not connected to user.');
  }

  if (selectedPinnedTable.terminal.user.id !== user.id) {
    throw new Error('This is not your terminal.');
  }

  if (selectedPinnedTable.tableType === 'NOTE') {
    await context.prisma.note.delete({
      where: {
        id: selectedPinnedTable.tableId,
      },
    });
  }

  await context.prisma.pinnedFeed.delete({
    where: {
      id: selectedPinnedTable.id,
    },
  });

  return selectedPinnedTable.terminal;
};

export let removePinnedTable = mutationField('removePinnedTable', {
  type: 'Terminal',
  args: {
    pinTableId: stringArg({ required: true }),
  },
  resolve: removePinnedTableResolver,
});
