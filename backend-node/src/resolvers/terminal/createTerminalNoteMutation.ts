import { mutationField, FieldResolver, stringArg, arg } from 'nexus';

import { Context } from 'serverTypes';

export let createTerminalNoteResolver: FieldResolver<
  'Mutation',
  'createTerminalNote'
> = async (_, { terminalId, title, content }, context: Context) => {
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

  let table = await context.prisma.note.create({
    data: {
      title,
      content,
      user: {
        connect: { id: user.id },
      },
    },
  });

  await context.prisma.pinnedFeed.create({
    data: {
      tableId: table.id,
      tableType: 'NOTE',
      terminal: {
        connect: {
          id: terminalId,
        },
      },
    },
  });

  return selectedTerminal;
};

export let createTerminalNote = mutationField('createTerminalNote', {
  type: 'Terminal',
  args: {
    terminalId: stringArg({ required: true }),
    title: stringArg({ required: true }),
    content: stringArg({ required: true }),
  },
  resolve: createTerminalNoteResolver,
});
