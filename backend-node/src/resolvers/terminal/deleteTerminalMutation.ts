import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let deleteTerminalResolver: FieldResolver<
  'Mutation',
  'deleteTerminal'
> = async (_, { terminalId }, context: Context) => {
  /**
   * Endpoint for delete terminal.
   */
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  /**
   * Here we check the terminal that user select.
   * The checks are: if exist? if terminal have user?
   * if terminal user are the same who use this endpoint?
   */
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
  /**
   * If we terminal is deleted then the sharedTerminal must be deleted also.
   */
  await context.prisma.sharedTerminal.deleteMany({
    where: {
      terminal: { id: terminalId },
    },
  });

  /**
   * Here we delete the terminal. We delete sharedTerminal first because relational
   * issue, we can't delete something if it's still relate to other.
   */
  await context.prisma.terminal.delete({
    where: {
      id: terminalId,
    },
  });

  /**
   * Then we return back the user terminals.
   */
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
