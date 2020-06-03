import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let createTerminalResolver: FieldResolver<
  'Mutation',
  'createTerminal'
> = async (_, { name, description }, context: Context) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  await context.prisma.terminal.create({
    data: {
      name,
      description,
      user: {
        connect: {
          id: user.id,
        },
      },
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

export let createTerminal = mutationField('createTerminal', {
  type: 'Terminal',
  args: {
    name: stringArg({ required: true }),
    description: stringArg(),
  },
  list: true,
  resolve: createTerminalResolver,
});
