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
  let existingOpenNews = await context.prisma.openNews.findMany({
    where: {
      businessTag: selectedOpenNews.businessTag,
      locationTag: selectedOpenNews.locationTag,
    },
  });
  let latestOpenNews = existingOpenNews.find(
    (openNews) => !timeCheck(openNews.updatedAt, 300),
  );
  if (latestOpenNews) {
    // Note: input the data if there is latestOpenNews
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

  if (!selectedOpenNews.polling) {
    let updateData = timeCheck(selectedOpenNews.updatedAt, 300); // Note: 300 minute (5 hour)
    if (updateData || !selectedOpenNews.data) {
      selectedOpenNews = {
        ...selectedOpenNews,
        polling: true,
      };
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
          let newsUpdate: PyNewsResponse = response.data;
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
