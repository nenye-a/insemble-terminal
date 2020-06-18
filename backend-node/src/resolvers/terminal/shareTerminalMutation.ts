import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';
import { FRONTEND_HOST } from '../../constants/constants';

export let shareTerminalResolver: FieldResolver<
  'Mutation',
  'shareTerminal'
> = async (_, { terminalId }, context: Context) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

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
  let expireDay = 10;
  let sharedTerminal;
  let sharedTerminals = await context.prisma.sharedTerminal.findMany({
    where: {
      terminal: { id: terminalId },
    },
  });
  if (sharedTerminals.length) {
    sharedTerminal = sharedTerminals[0];
  } else {
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
