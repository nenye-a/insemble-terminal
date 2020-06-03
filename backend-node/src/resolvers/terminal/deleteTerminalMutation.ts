import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let deleteTerminalResolver: FieldResolver<
  'Mutation',
  'deleteTerminal'
> = async (_, { terminalId }, context: Context) => {
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
    include: { user: true },
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

  await context.prisma.terminal.delete({
    where: {
      id: terminalId,
    },
  });

  let terminals = await context.prisma.terminal.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return terminals;
};

export let deleteTerminal = mutationField('deleteTerminal', {
  type: 'Terminal',
  args: {
    terminalId: stringArg({ required: true }),
  },
  list: true,
  resolve: deleteTerminalResolver,
});
