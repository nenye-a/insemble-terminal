import { queryField, FieldResolver, stringArg } from 'nexus';

import { Root, Context } from 'serverTypes';

let sharedTerminalResolver: FieldResolver<'Query', 'sharedTerminal'> = async (
  _: Root,
  { sharedTerminalId },
  context: Context,
) => {
  /**
   * Endpoint for getting sharedTerminal data. Require sharedTerminalId.
   * First we check if shared terminal exist or not.
   */
  let sharedTerminal = await context.prisma.sharedTerminal.findOne({
    where: {
      id: sharedTerminalId,
    },
    include: {
      terminal: true,
    },
  });
  if (!sharedTerminal) {
    throw new Error('Shared terminal not found or expired.');
  }
  /**
   * Here if shared terminal expired, we also delete it from sharedTerminal.
   */
  if (sharedTerminal.expireDate.getTime() < new Date().getTime()) {
    await context.prisma.sharedTerminal.delete({
      where: { id: sharedTerminal.id },
    });
    throw new Error('Shared terminal not found or expired.');
  }
  /**
   * And here we return the terminal of the sharedTerminal.
   */
  return sharedTerminal.terminal;
};

let sharedTerminal = queryField('sharedTerminal', {
  type: 'Terminal',
  args: {
    sharedTerminalId: stringArg({ required: true }),
  },
  resolve: sharedTerminalResolver,
});

export { sharedTerminal };
