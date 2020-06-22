import { objectType } from 'nexus';
import { prisma } from '../prisma';
import { FirstArticle } from 'dataTypes';

export let OpenNews = objectType({
  name: 'OpenNews',
  definition(t) {
    t.model.id();
    t.model.businessTag();
    t.model.locationTag();
    t.boolean('polling');
    t.string('error', { nullable: true });
    t.field('firstArticle', {
      type: 'Article',
      resolve: async ({ id }) => {
        let openNews = await prisma.openNews.findOne({
          where: { id },
        });
        let parseFirstArticle: FirstArticle = JSON.parse(
          openNews.firstArticle ||
            '{"title":"",source":"","published":"","link":""}',
        );
        console.log(parseFirstArticle);
        return parseFirstArticle;
      },
    });
    t.field('table', {
      type: 'News',
      nullable: true,
    });
  },
});
