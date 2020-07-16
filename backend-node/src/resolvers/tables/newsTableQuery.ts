import { queryField, FieldResolver, stringArg, arg } from 'nexus';
import axios, { AxiosResponse } from 'axios';

import { BusinessTagCreateInput, LocationTagCreateInput } from '@prisma/client';
import { Root, Context } from 'serverTypes';
import { PyNewsResponse, PyNewsData } from 'dataTypes';
import { API_URI, TABLE_UPDATE_TIME } from '../../constants/constants';
import { axiosParamsSerializer } from '../../helpers/axiosParamsCustomSerializer';
import { timeCheck } from '../../helpers/timeCheck';
import { todayMinXHour } from '../../helpers/todayMinXHour';
import { NewsDemoData } from '../../constants/demoData';

let newsTableResolver: FieldResolver<'Query', 'newsTable'> = async (
  _: Root,
  { businessTagId, locationTagId, tableId, demo },
  context: Context,
) => {
  /**
   * Endpoint for geting news table. This is polling endpoint.
   * If there is demo in args then it's automaticaly use demo data.
   * demo consist 'BASIC' and 'WITH_COMPARE'
   */
  if (demo) {
    /**
     * Here we search all table with the same demo params.
     */
    let demoTables = await context.prisma.news.findMany({
      where: {
        demo,
      },
    });
    let demoTable;
    if (!demoTables.length) {
      /**
       * If it's doesn't exist then we create new with this parameter.
       */
      let businessTag: BusinessTagCreateInput = {
        params: 'Starbucks',
        type: 'BUSINESS',
      };
      let demoBusinessTag;
      /**
       * Here we checking if tag exist or not.
       */
      let businessTagsCheck = await context.prisma.businessTag.findMany({
        where: {
          params: businessTag.params,
          type: businessTag.type,
        },
      });
      if (businessTagsCheck.length) {
        /**
         * If exist then use the first found.
         */
        demoBusinessTag = businessTagsCheck[0];
      } else {
        /**
         * Else create new tags.
         */
        demoBusinessTag = await context.prisma.businessTag.create({
          data: {
            params: businessTag.params,
            type: businessTag.type,
          },
        });
      }
      let locationTag: LocationTagCreateInput = {
        params: 'Los Angeles, CA, USA',
        type: 'CITY',
      };
      let demoLocationTag;
      /**
       * Here we checking if tag exist or not.
       */
      let locationTagsCheck = await context.prisma.locationTag.findMany({
        where: {
          params: locationTag.params,
          type: locationTag.type,
        },
      });
      if (locationTagsCheck.length) {
        /**
         * If exist then use the first found.
         */
        demoLocationTag = locationTagsCheck[0];
      } else {
        /**
         * Else create new tags.
         */
        demoLocationTag = await context.prisma.locationTag.create({
          data: {
            params: locationTag.params,
            type: locationTag.type,
          },
        });
      }
      switch (demo) {
        /**
         * Here we separate the case base on demo params.
         * It's because both of them is different table with different set of data.
         */
        case 'BASIC':
          /**
           * If BASIC then we're just add NewsDemoData.
           * The demo data can be seen at demoData.ts.
           */
          demoTable = await context.prisma.news.create({
            data: {
              data: {
                create: NewsDemoData,
              },
              businessTag: { connect: { id: demoBusinessTag.id } },
              locationTag: { connect: { id: demoLocationTag.id } },
              demo,
            },
          });
          break;
        case 'WITH_COMPARE':
          /**
           * There's no news compare demo now.
           */
          break;
      }
    } else {
      /**
       * If there's already demo table then we use the first found.
       * NOTE: because it's first found, multiple demo (example:BASIC)
       * table will be ignored except there is another search value.
       */
      demoTable = demoTables[0];
    }

    return {
      table: demoTable,
      polling: false,
      error: null,
    };
  }
  /**
   * If not demo table we check if there is businessTagId and locationTagId
   * and get the tag.
   */
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
  /**
   * Or the user already know the table want to get with tableId. (Usally used
   * on pinned and comparation table)
   * It will search table by Id here.
   */
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
    if (selectedNewsById.demo) {
      /**
       * But if it's demo then we won't do anything to that table and just return it.
       */
      return {
        table: selectedNewsById,
        polling: false,
        error: null,
      };
    }
    news = [selectedNewsById];
  } else {
    /**
     * If it's not by id then we search it with business and location tag.
     */
    news = await context.prisma.news.findMany({
      where: {
        businessTag: businessTag ? { id: businessTag.id } : null,
        locationTag: locationTag ? { id: locationTag.id } : null,
        demo: null,
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
    /**
     * Here we search for table who doesn't have any comparation. (BASIC TABLE)
     */
    news = news.filter(({ comparationTags }) => comparationTags.length === 0);
  }

  let selectedNewsTable;
  /**
   * Here we check if the table exist from process above.
   */
  if (news.length) {
    /**
     * If exist then we're just use the first found table.
     */
    selectedNewsTable = news[0];
    let selectedTable = news[0];
    if (selectedNewsTable.error) {
      /**
       * Because it's polling the error can come not in sync,
       * if there is an error on selectedNewsTable then we return it here
       * and remove it so next poll wont show error anymore.
       * And also we make it updatedAt outdated because if it's not, by default
       * updatedAt will replaced to today, this will prevent table to reupdate.
       */
      let table = await context.prisma.news.update({
        where: {
          id: selectedTable.id,
        },
        data: {
          error: null,
          updatedAt: todayMinXHour(1),
        },
      });
      return {
        table,
        error: selectedNewsTable.error,
        polling: selectedNewsTable.polling,
      };
    }
    let updateData = timeCheck(selectedNewsTable.updatedAt, TABLE_UPDATE_TIME);
    /**
     * If selectedNewsTable process is not polling
     * and the data must be updated then we start the process polling.
     */
    if (updateData) {
      if (!selectedNewsTable.polling) {
        /**
         * Here we flag the news as polling.
         */
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
        /**
         * Here we fetch for main data first. This will run async so we got
         * promise here.
         */
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
        /**
         * Here we create array to keep all of the compare promise and compareId.
         */
        let compareDataPromises: Array<Promise<AxiosResponse>> = [];
        let compareIds: Array<string> = [];
        for (let comparationTag of selectedNewsTable.comparationTags) {
          /**
           * And here we fetch every comparationTags combination and
           * get all compare promises.
           */
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
          /**
           * Here we put the compareId and comparePromise into array that we
           * create before.
           */
          compareDataPromises.push(compareDataPromise);
          compareIds.push(comparationTag.id);
        }
        /**
         * Promise.all will be called if all of the promise(Fetch) complete.
         * using ".then()" function to run after it's all complete.
         */
        Promise.all([mainDataPromise, ...compareDataPromises])
          .then(async (value) => {
            /**
             * Here we separate main data and compare data responses.
             */
            let [mainResponse, ...compareResponses] = value;
            let mainData: PyNewsResponse = mainResponse.data;
            /**
             * Here we parse news data we got from response into our
             * db type.
             */
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
              /**
               * Here every compareResponses the data we put all data we get
               * into one array.
               */
              let compareData: PyNewsResponse = compareResponse.data;
              rawCompareData = rawCompareData.concat(
                compareData.data.map((data) => ({
                  ...data,
                  compareId: compareIds[index],
                })),
              );
            }
            /**
             * And then we parse compare news data we got from response into our
             * db type.
             */
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
            /**
             * Here we delete all old data and compareData.
             */
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
            /**
             * Then finally we update the table here with data we parse above.
             */
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
            /**
             * ".catch" is if the fetch failed. We put the error here.
             * Then mark the updatedAt as outdated and polling false
             * so if it run again it will poll again.
             */
            await context.prisma.news.update({
              where: { id: selectedTable.id },
              data: {
                error: 'Failed to update News. Please try again.',
                polling: false,
                updatedAt: todayMinXHour(1),
              },
            });
          });
      }
    }
  } else {
    /**
     * Here is the case when there is no basic table.
     * So we create one here. Basically the same as above but without
     * comparison. So only one promise for main data.
     * First we create the empty table.
     */
    let newSelectedNewsTable = await context.prisma.news.create({
      data: {
        polling: true,
        businessTag: businessTag
          ? { connect: { id: businessTag.id } }
          : undefined,
        locationTag: locationTag
          ? { connect: { id: locationTag.id } }
          : undefined,
        updatedAt: todayMinXHour(1),
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
        let newsUpdate: PyNewsResponse = response.data;
        /**
         * Here we parse news data we got from response into our
         * db type.
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
         * Then we update the empty table with the data here.
         */
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
            updatedAt: new Date(),
          },
        });
      })
      .catch(async () => {
        /**
         * ".catch" is if the fetch failed. We put the error here.
         * Then mark the updatedAt as outdated and polling false
         * so if it run again it will poll again.
         */
        await context.prisma.news.update({
          where: { id: newSelectedNewsTable.id },
          data: {
            error: 'Failed to update News. Please try again.',
            polling: false,
            updatedAt: todayMinXHour(1),
          },
        });
      });
  }
  /**
   * Here we return all data front end need.
   * Including polling status, error message, and table.
   */
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
    demo: arg({ type: 'DemoType' }),
  },
  resolve: newsTableResolver,
});

export { newsTable };
