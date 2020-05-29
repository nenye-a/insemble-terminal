import { queryField, FieldResolver, stringArg } from 'nexus';
import axios from 'axios';

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
    let updateData = timeCheck(selectedNewsTable.updatedAt);
    if (updateData) {
      try {
        let newsUpdate: PyNewsResponse = (
          await axios.get(`${API_URI}/api/news`, {
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
          })
        ).data;
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
        let rawCompareData: Array<PyNewsData> = [];
        for (let comparationTag of selectedNewsTable.comparationTags) {
          let compareDataUpdate: PyNewsResponse = (
            await axios.get(`${API_URI}/api/news`, {
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
            })
          ).data;
          rawCompareData = rawCompareData.concat(compareDataUpdate.data);
        }
        let compareData = rawCompareData.map(
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
              id: selectedNewsTable.id,
            },
          },
        });
        await context.prisma.compareNewsData.deleteMany({
          where: {
            news: {
              id: selectedNewsTable.id,
            },
          },
        });
        selectedNewsTable = await context.prisma.news.update({
          where: { id: selectedNewsTable.id },
          data: {
            data: { create: newsData },
            compareData: { create: compareData },
            updatedAt: new Date(),
          },
        });
      } catch {
        throw new Error('Fail to update data.');
      }
    }
  } else {
    try {
      let newsUpdate: PyNewsResponse = (
        await axios.get(`${API_URI}/api/news`, {
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
      ).data;
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
      selectedNewsTable = await context.prisma.news.create({
        data: {
          data: { create: newsData },
          businessTag: businessTag
            ? { connect: { id: businessTag.id } }
            : undefined,
          locationTag: locationTag
            ? { connect: { id: locationTag.id } }
            : undefined,
        },
      });
    } catch (e) {
      throw new Error('Fail to create data.');
    }
  }
  return selectedNewsTable;
};

let newsTable = queryField('newsTable', {
  type: 'News',
  args: {
    businessTagId: stringArg(),
    locationTagId: stringArg(),
    tableId: stringArg(),
  },
  resolve: newsTableResolver,
});

export { newsTable };
