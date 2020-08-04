import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let noteQueryResolver: FieldResolver<'Query', 'note'> = async (
  _: Root,
  { noteId },
  context: Context,
) => {
  /**
   * Endpoint for geting note table only with noteId.
   */
  let note = await context.prisma.note.findOne({
    where: {
      id: noteId,
    },
    include: { user: true },
  });

  /**
   * Check if the id is valid or not.
   */
  if (!note) {
    throw new Error('Invalid note id.');
  }

  return note;
};

let noteQuery = queryField('note', {
  type: 'Note',
  args: {
    noteId: stringArg({ required: true }),
  },
  resolve: noteQueryResolver,
});

export { noteQuery };
