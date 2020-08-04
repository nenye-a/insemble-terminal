import { objectType } from 'nexus';
import { prisma } from '../prisma';
import { FirstArticle, OpenNewsData } from 'dataTypes';

export let OpenNews = objectType({
  name: 'OpenNews',
  definition(t) {
    t.model.id();
    t.model.businessTag();
    t.model.locationTag();
    t.model.polling();
    t.model.error();
    t.field('firstArticle', {
      type: 'Article',
      resolve: async ({ id }) => {
        /**
         * This resolve the firstArticle JSON string into Object FirstArticle.
         */
        let openNews = await prisma.openNews.findOne({
          where: { id },
        });
        let parseFirstArticle: FirstArticle = JSON.parse(
          openNews.firstArticle ||
            '{"title":"",source":"","published":"","link":""}',
        );
        return parseFirstArticle;
      },
    });
    t.field('data', {
      type: 'OpenNewsData',
      list: true,
      resolve: async ({ id }) => {
        /**
         * This resolve the openNews.data JSON string into array of Object OpenNewsData.
         */
        let openNews = await prisma.openNews.findOne({
          where: { id },
        });
        let parseData: Array<OpenNewsData> = JSON.parse(openNews.data || '[]');
        return parseData;
      },
    });
  },
});
