import { queryField, FieldResolver, stringArg } from 'nexus';
import axios, { AxiosResponse } from 'axios';

import { Root, Context } from 'serverTypes';
import { PyNewsResponse, PyNewsData } from 'dataTypes';
import { API_URI } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';

let newsTableResolver: FieldResolver<'Query', 'newsTable'> = async (
  _: Root,
  { businessTagId, locationTagId, tableId },
  context: Context,
) => {
  let user = await context.prisma.user.findOne({
    where: {
      id: context.userId,
    },
    include: { license: true },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  if (!user.license && user.role === 'USER') {
    throw new Error('Pelase activate your account.');
  }

  let businessTag = businessTagId
    ? await context.prisma.businessTag.findOne({
        where: {
          id: businessTagId,
        },
      })
    : undefined;
  let locationTag = locationTagId
    ? await context.prisma.locationTag.findOne({
        where: {
          id: locationTagId,
        },
      })
    : undefined;
  let news;
  if (tableId) {
    let selectedNewsById = await context.prisma.news.findOne({
      where: { id: tableId },
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
    if (!selectedNewsById) {
      throw new Error('Table not found');
    }
    news = [selectedNewsById];
  } else {
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
  }

  let selectedNewsTable;
  if (news.length) {
    selectedNewsTable = news[0];
    let selectedTable = news[0];
    if (selectedNewsTable.error) {
      let table = await context.prisma.news.update({
        where: {
          id: selectedTable.id,
        },
        data: {
          error: null,
        },
      });
      return {
        table,
        error: selectedNewsTable.error,
        polling: selectedNewsTable.polling,
      };
    }
    let updateData = timeCheck(selectedNewsTable.updatedAt);
    if (updateData) {
      if (!selectedNewsTable.polling) {
        selectedNewsTable = await context.prisma.news.update({
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
        let mainDataPromise = axios.get(`${API_URI}/api/news`, {
          params: {
            location: selectedNewsTable.locationTag
              ? {
                  locationType: selectedNewsTable.locationTag.type,
                  params: selectedNewsTable.locationTag.params,
                }
              : undefined,
            business: selectedNewsTable.businessTag
              ? {
                  businessType: selectedNewsTable.businessTag.type,
                  params: selectedNewsTable.businessTag.params,
                }
              : undefined,
          },
          paramsSerializer: axiosParamsSerializer,
        });
        let compareDataPromises: Array<Promise<AxiosResponse>> = [];
        let compareIds: Array<string> = [];
        for (let comparationTag of selectedNewsTable.comparationTags) {
          let compareDataPromise = axios.get(`${API_URI}/api/news`, {
            params: {
              location: comparationTag.locationTag
                ? {
                    locationType: comparationTag.locationTag.type,
                    params: comparationTag.locationTag.params,
                  }
                : undefined,
              business: comparationTag.businessTag
                ? {
                    businessType: comparationTag.businessTag.type,
                    params: comparationTag.businessTag.params,
                  }
                : undefined,
            },
            paramsSerializer: axiosParamsSerializer,
          });
          compareDataPromises.push(compareDataPromise);
          compareIds.push(comparationTag.id);
        }
        Promise.all([mainDataPromise, ...compareDataPromises])
          .then(async (value) => {
            let [mainResponse, ...compareResponses] = value;
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
            let rawCompareData: Array<PyNewsData & {
              compareId: string;
            }> = [];
            for (let [index, compareResponse] of compareResponses.entries()) {
              let compareData: PyNewsResponse = compareResponse.data;
              rawCompareData = rawCompareData.concat(
                compareData.data.map((data) => ({
                  ...data,
                  compareId: compareIds[index],
                })),
              );
            }
            let compareData = rawCompareData.map(
              ({
                title,
                description,
                link,
                published,
                source,
                relevance,
                compareId,
              }) => {
                return {
                  title: title || '-',
                  description: description || '-',
                  link: link || '-',
                  published: published || '-',
                  source: source || '-',
                  relevance: relevance || 0,
                  compareId,
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
            await context.prisma.compareNewsData.deleteMany({
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
                compareData: { create: compareData },
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
              },
            });
          });
      }
    }
  } else {
    let newSelectedNewsTable = await context.prisma.news.create({
      data: {
        polling: true,
        businessTag: businessTag
          ? { connect: { id: businessTag.id } }
          : undefined,
        locationTag: locationTag
          ? { connect: { id: locationTag.id } }
          : undefined,
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
    selectedNewsTable = newSelectedNewsTable;
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
            id: newSelectedNewsTable.id,
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
          },
        });
      })
      .catch(async () => {
        await context.prisma.news.update({
          where: { id: newSelectedNewsTable.id },
          data: {
            error: 'Failed to update News. Please try again.',
            polling: false,
          },
        });
      });
  }
  return {
    table: selectedNewsTable,
    polling: selectedNewsTable.polling,
    error: selectedNewsTable.error,
  };
};

let newsTable = queryField('newsTable', {
  type: 'NewsPolling',
  args: {
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
  },
  resolve: newsTableResolver,
});

export { newsTable };
