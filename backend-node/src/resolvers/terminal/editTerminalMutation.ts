import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let editTerminalResolver: FieldResolver<
  'Mutation',
  'editTerminal'
> = async (_, { terminalId, name, description }, context: Context) => {
  /**
   * Endpoint for editing terminal. Require terminalId.
   */
  if (!name && !description) {
    throw new Error('Please at least input one field.');
  }
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  /**
   * Here we check the terminal user select.
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
   * If all check pass then we update the terminal with name and description input.
   */
  selectedTerminal = await context.prisma.terminal.update({
    where: {
      id: selectedTerminal.id,
    },
    data: {
      name,
      description,
    },
    include: { user: true },
  });

  return selectedTerminal;
};

export let editTerminal = mutationField('editTerminal', {
  type: 'Terminal',
  args: {
    terminalId: stringArg({ required: true }),
    name: stringArg(),
    description: stringArg(),
  },
  resolve: editTerminalResolver,
});
