import { queryField, FieldResolver, stringArg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyNewsResponse } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { todayMinXHour } from '../../helpers/todayMinXHour';

let openNewsResolver: FieldResolver<'Query', 'openNews'> = async (
  _: Root,
  { openNewsId },
  context: Context,
) => {
  /**
   * Endpoint for viewing news form open news. This is polling endpoint.
   */
  let selectedOpenNews = await context.prisma.openNews.findOne({
    where: { id: openNewsId },
    include: {
      businessTag: true,
      locationTag: true,
    },
  });
  if (!selectedOpenNews) {
    throw new Error('News not found');
  }
  if (selectedOpenNews.error) {
    /**
     * Because it's polling the error can come not in sync,
     * if there is an error on selectedOpenNews then we return it here
     * and remove it so next poll wont show error anymore.
     */
    await context.prisma.openNews.update({
      where: {
        id: selectedOpenNews.id,
      },
      data: {
        error: null,
        updatedAt: todayMinXHour(10),
      },
    });
    return selectedOpenNews;
  }
  let businessTag = selectedOpenNews.businessTag;
  let locationTag = selectedOpenNews.locationTag;
  /**
   * Here we search for existingOpenNews that have the same tag as selected.
   */
  let existingOpenNews = await context.prisma.openNews.findMany({
    where: {
      businessTag: selectedOpenNews.businessTag,
      locationTag: selectedOpenNews.locationTag,
    },
  });
  /**
   * Then we search it the latest one with timeCheck.
   */
  let latestOpenNews = existingOpenNews.find(
    (openNews) => !timeCheck(openNews.updatedAt, 300),
  );
  if (latestOpenNews) {
    // Note: input the data if there is latestOpenNews
    /**
     * Here we update data so it will same as the latestOpenNews Data.
     */
    selectedOpenNews = await context.prisma.openNews.update({
      where: { id: selectedOpenNews.id },
      data: {
        data: latestOpenNews.data,
        updatedAt: latestOpenNews.updatedAt,
      },
      include: {
        businessTag: true,
        locationTag: true,
      },
    });
  }

  /**
   * If selectedOpenNews process is not polling
   * and the data must be updated then we start the process polling.
   */
  if (!selectedOpenNews.polling) {
    let updateData = timeCheck(selectedOpenNews.updatedAt, 300); // Note: 300 minute (5 hour)
    if (updateData || !selectedOpenNews.data) {
      selectedOpenNews = {
        ...selectedOpenNews,
        polling: true,
      };
      /**
       * Here we flag all the openNews that have same tags as polling.
       * We're going to update all of them.
       */
      await context.prisma.openNews.updateMany({
        where: {
          businessTag: selectedOpenNews.businessTag,
          locationTag: selectedOpenNews.locationTag,
        },
        data: {
          error: null,
          polling: true,
        },
      });
      /**
       * Here we fetch to python API to get the latest data.
       * We're not await it so this function will fetch,
       * after fetch done the ".then"  will run async.
       */
      axios
        .get(`${API_URI}/api/news`, {
          params: {
            location: locationTag
              ? { locationType: locationTag.type, params: locationTag.params }
              : undefined,
            business: businessTag
              ? { businessType: businessTag.type, params: businessTag.params }
              : undefined,
          },
          paramsSerializer: axiosParamsSerializer,
        })
        .then(async (response) => {
          /**
           * Here the response of the endpoint will be processed.
           */
          let newsUpdate: PyNewsResponse = response.data;
          /**
           * Here where the data parse the response data if null then we make it '-' or 0.
           */
          let newsData = newsUpdate.data.map(
            ({ title, description, link, published, source, relevance }) => {
              return {
                title: title || '-',
                description: description || '-',
                link: link || '-',
                published: published || '-',
                source: source || '-',
                relevance: relevance || 0,
              };
            },
          );
          /**
           * Then we parse it again to JSON string and then save the data in all
           * of openNews data that have same tags.
           * And also mark polling false as it's completed.
           */
          let stringifyNewsData = JSON.stringify(newsData);
          await context.prisma.openNews.updateMany({
            where: {
              businessTag: selectedOpenNews.businessTag,
              locationTag: selectedOpenNews.locationTag,
            },
            data: {
              data: stringifyNewsData,
              error: null,
              polling: false,
            },
          });
        })
        .catch(async () => {
          /**
           * ".catch" is if the fetch failed. We put the error here.
           * Then mark the updatedAt as outdated and polling false
           * so if it run again it will poll again.
           */
          await context.prisma.openNews.updateMany({
            where: {
              businessTag: selectedOpenNews.businessTag,
              locationTag: selectedOpenNews.locationTag,
            },
            data: {
              error: 'Failed to update News. Please try again.',
              polling: false,
              updatedAt: todayMinXHour(10),
            },
          });
        });
    }
  }
  /**
   * Here we return all data front end need.
   * Including polling status, error message, and the data.
   */
  return selectedOpenNews;
};

let openNews = queryField('openNews', {
  type: 'OpenNews',
  args: {
    openNewsId: stringArg({ required: true }),
  },
  resolve: openNewsResolver,
});

export { openNews };
