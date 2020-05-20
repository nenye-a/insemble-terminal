import { queryField, FieldResolver } from 'nexus';

import { Root, Context } from 'serverTypes';

let businessTagsResolver: FieldResolver<'Query', 'businessTags'> = async (
  _: Root,
  _args,
  context: Context,
) => {
  let businessTags = await context.prisma.businessTag.findMany();
  return businessTags;
};

let businessTags = queryField('businessTags', {
  type: 'BusinessTag',
  list: true,
  resolve: businessTagsResolver,
});

export { businessTags };
