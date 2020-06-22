import { queryField, FieldResolver, stringArg } from 'nexus';
import axios from 'axios';

import { Root, Context } from 'serverTypes';
import { PyNewsResponse } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { todayMinOneH } from '../../helpers/todayMinOneH';

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

  let businessTag = selectedOpenNews.businessTag;
  let locationTag = selectedOpenNews.locationTag;
  let news;
  // searching news from tag.
  news = await context.prisma.news.findMany({
    where: {
      businessTag: businessTag ? { id: businessTag.id } : null,
      locationTag: locationTag ? { id: locationTag.id } : null,
    },
    include: {
      locationTag: true,
      businessTag: true,
      comparationTags: {
        include: {
          locationTag: true,
          businessTag: true,
        },
      },
    },
  });
  news = news.filter(({ comparationTags }) => comparationTags.length === 0);
  let selectedNews;
  if (news.length) {
    let selectedTable = news[0];
    selectedNews = news[0];
    if (selectedTable.error) {
      let table = await context.prisma.news.update({
        where: {
          id: selectedTable.id,
        },
        data: {
          error: null,
          updatedAt: todayMinOneH(),
        },
      });
      return {
        ...selectedOpenNews,
        table,
        error: selectedTable.error,
        polling: selectedTable.polling,
      };
    }
    let updateData = timeCheck(selectedTable.updatedAt);
    if (updateData) {
      if (!selectedTable.polling) {
        selectedNews = await context.prisma.news.update({
          where: { id: selectedTable.id },
          data: {
            polling: true,
          },
          include: {
            locationTag: true,
            businessTag: true,
            comparationTags: {
              include: {
                locationTag: true,
                businessTag: true,
              },
            },
          },
        });
        axios
          .get(`${API_URI}/api/news`, {
            params: {
              location: selectedOpenNews.locationTag
                ? {
                    locationType: selectedOpenNews.locationTag.type,
                    params: selectedOpenNews.locationTag.params,
                  }
                : undefined,
              business: selectedOpenNews.businessTag
                ? {
                    businessType: selectedOpenNews.businessTag.type,
                    params: selectedOpenNews.businessTag.params,
                  }
                : undefined,
            },
            paramsSerializer: axiosParamsSerializer,
          })
          .then(async (mainResponse) => {
            let mainData: PyNewsResponse = mainResponse.data;
            let newsData = mainData.data.map(
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
            await context.prisma.newsData.deleteMany({
              where: {
                news: {
                  id: selectedTable.id,
                },
              },
            });
            await context.prisma.news.update({
              where: { id: selectedTable.id },
              data: {
                data: { create: newsData },
                polling: false,
                updatedAt: new Date(),
              },
            });
          })
          .catch(async () => {
            await context.prisma.news.update({
              where: { id: selectedTable.id },
              data: {
                error: 'Failed to update News. Please try again.',
                polling: false,
                updatedAt: todayMinOneH(),
              },
            });
          });
      }
    }
  } else {
    let newSelectedNews = await context.prisma.news.create({
      data: {
        polling: true,
        businessTag: businessTag
          ? { connect: { id: businessTag.id } }
          : undefined,
        locationTag: locationTag
          ? { connect: { id: locationTag.id } }
          : undefined,
        updatedAt: todayMinOneH(),
      },
      include: {
        locationTag: true,
        businessTag: true,
        comparationTags: {
          include: {
            locationTag: true,
            businessTag: true,
          },
        },
      },
    });
    selectedNews = newSelectedNews;
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
        await context.prisma.news.update({
          where: {
            id: newSelectedNews.id,
          },
          data: {
            data: { create: newsData },
            businessTag: businessTag
              ? { connect: { id: businessTag.id } }
              : undefined,
            locationTag: locationTag
              ? { connect: { id: locationTag.id } }
              : undefined,
            polling: false,
            updatedAt: new Date(),
          },
        });
      })
      .catch(async () => {
        await context.prisma.news.update({
          where: { id: newSelectedNews.id },
          data: {
            error: 'Failed to update News. Please try again.',
            polling: false,
            updatedAt: todayMinOneH(),
          },
        });
      });
  }
  return {
    ...selectedOpenNews,
    table: selectedNews,
    polling: selectedNews.polling,
    error: selectedNews.error,
  };
};

let openNews = queryField('openNews', {
  type: 'OpenNews',
  args: {
    openNewsId: stringArg({ required: true }),
  },
  resolve: openNewsResolver,
});

export { openNews };
