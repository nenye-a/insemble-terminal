import { mutationField, FieldResolver, stringArg, arg } from 'nexus';

import { Context } from 'serverTypes';

export let editNoteResolver: FieldResolver<'Mutation', 'editNote'> = async (
  _,
  { noteId, title, content },
  context: Context,
) => {
  /**
   * Endpoint for editing exist note. Require noteId.
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
   * Here we check the note that user select.
   * The checks are: if exist? if note have user?
   * if note user are the same who use this endpoint?
   */
  let note = await context.prisma.note.findOne({
    where: { id: noteId },
    include: { user: true },
  });

  if (!note) {
    throw new Error('Note not found.');
  }

  if (!note.user) {
    throw new Error('Note not connected to user.');
  }

  if (note.user.id !== user.id) {
    throw new Error('This is not your note.');
  }
  /**
   * If all check pass then we update the note with title and content input.
   */
  note = await context.prisma.note.update({
    where: { id: note.id },
    data: {
      title,
      content,
    },
    include: { user: true },
  });

  return note;
};

export let editNote = mutationField('editNote', {
  type: 'Note',
  args: {
    noteId: stringArg({ required: true }),
    title: stringArg(),
    content: stringArg(),
  },
  resolve: editNoteResolver,
});
