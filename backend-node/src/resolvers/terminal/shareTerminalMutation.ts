import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';
import { FRONTEND_HOST } from '../../constants/constants';

export let shareTerminalResolver: FieldResolver<
  'Mutation',
  'shareTerminal'
> = async (_, { terminalId }, context: Context) => {
  /**
   * Endpoint for share the terminal. Require terminalId.
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
  let terminal = await context.prisma.terminal.findOne({
    where: {
      id: terminalId,
    },
    include: {
      user: true,
    },
  });
  if (!terminal) {
    throw new Error('Terminal not found.');
  }
  if (!terminal.user) {
    throw new Error('Terminal not connected to user.');
  }
  if (terminal.user.id !== context.userId) {
    throw new Error('This is not your terminal.');
  }
  /**
   * We put the expire here for 10 day.
   */
  let expireDay = 10;
  let sharedTerminal;
  /**
   * Here we check if there is already sharedTerminal with selected terminal.
   */
  let sharedTerminals = await context.prisma.sharedTerminal.findMany({
    where: {
      terminal: { id: terminalId },
    },
  });
  if (sharedTerminals.length) {
    /**
     * If there is it then we use it the first found.
     */
    sharedTerminal = sharedTerminals[0];
  } else {
    /**
     * Else we create the new sharedTerminal that connect to selected terminal.
     */
    sharedTerminal = await context.prisma.sharedTerminal.create({
      data: {
        expireDate: new Date(
          new Date().getTime() + expireDay * 24 * 60 * 60000,
        ),
        terminal: {
          connect: {
            id: terminal.id,
          },
        },
      },
    });
  }

  /**
   * Then we return the link of sharedTerminal to front end.
   */
  let sharedTerminalLink = `${FRONTEND_HOST}/shared/${sharedTerminal.id}`;
  return sharedTerminalLink;
};

export let shareTerminal = mutationField('shareTerminal', {
  type: 'String',
  args: {
    terminalId: stringArg({ required: true }),
  },
  resolve: shareTerminalResolver,
});
