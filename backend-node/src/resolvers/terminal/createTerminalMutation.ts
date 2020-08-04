import { mutationField, FieldResolver, stringArg } from 'nexus';

import { Context } from 'serverTypes';

export let createTerminalResolver: FieldResolver<
  'Mutation',
  'createTerminal'
> = async (_, { name, description }, context: Context) => {
  /**
   * Endpoint for creating the terminal.
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
   * Here we create the terminal with the input name and description.
   * And also linked it to user who create it.
   */
  let terminal = await context.prisma.terminal.create({
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
  return terminal;
};

export let createTerminal = mutationField('createTerminal', {
  type: 'Terminal',
  args: {
    name: stringArg({ required: true }),
    description: stringArg(),
  },
  resolve: createTerminalResolver,
});
