import { mutationField, FieldResolver, stringArg, arg } from 'nexus';

import { Context } from 'serverTypes';

export let createTerminalNoteResolver: FieldResolver<
  'Mutation',
  'createTerminalNote'
> = async (_, { terminalId, title, content }, context: Context) => {
  /**
   * Endpoint for creating note on terminal.
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
   * Here we create the note with input title and content.
   * And also linked it to user who create it.
   */
  let table = await context.prisma.note.create({
    data: {
      title,
      content,
      user: {
        connect: { id: user.id },
      },
    },
  });

  /**
   * And then we pinned the note to selectedTerminal.
   */
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
