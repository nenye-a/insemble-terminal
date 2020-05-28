
from rest_framework import status, generics, permissions, serializers
from rest_framework.response import Response

from .serializers import SearchSerializer, PerformanceSerializer
import datetime as dt
import performance
import news
import activity


'''

Terminal Django API.

'''


class BasicAPI(generics.GenericAPIView):
    """
    Basic API with pre-definded serializer and permission classess
    """

    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = serializers.Serializer()

    def get(self, request, *args, **kwargs):

        response = {
            'api_functioning': True
        }

        return Response(response, status=status.HTTP_200_OK)


class PerformanceAPI(BasicAPI):
    """

    All functions related to performance data.
    Performance API path: api/performance

    """

    serializer_class = PerformanceSerializer

    def get(self, request, *args, **kwargs):
        """

        Retrieve the performance data for a brand/category & location scope.

        Parameters: {
            location: {
                locationType: 'ADDRESS'|'CITY'|'COUNTY' <-supported | unsupported rightnow ->['STATE'|'NATION']
                params: string
            }
            business: {
                businessType: 'BUSINESS' | 'CATEGORY'
                params: string
            }
            dataType: 'BRAND'|'CATEGORY'|'OVERALL'|'ADDRESS' <-supported | unsupported rightnow -> ['CITY'|'STATE']
        }

        Response:
            {
                createdAt: Date,
                updatedAt: Date,
                dataType: 'BRAND'|'CATEGORY'|'OVERALL'|'ADDRESS'|'CITY'|'STATE'
                data: [
                    {
                        name: string,
                        salesVolumeIndex?: number,
                        avgRating?: number,
                        avgReviews?: number,
                        numLocations?: number,
                    }
                ]
            }

        """

        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data

        location = params['location']
        business = params['business']
        data_type = params['dataType']

        data = []
        if business['businessType'] == 'BUSINESS':

            # ADDRESS + BUSINESS
            if location['locationType'] == 'ADDRESS':
                row = performance.performance(business['params'], location['params'])
                if not row:
                    pass
                elif data_type == 'ADDRESS':
                    row['name'] = row.pop('address')
                    data.append(row)
                elif data_type == 'OVERALL':
                    row.pop('address')
                    data.append(row)
                else:
                    error = "{data_type} not supported for request ADDRESS + BUSINESS requests.".format(
                        data_type=data_type
                    )
                    return Response({'status_detail': [error]}, status=status.HTTP_400_BAD_REQUEST)

            # CITY & COUNTY + BUSINESS
            elif location['locationType'] in ['CITY', 'COUNTY']:
                raw_data = performance.aggregate_performance(
                    business['params'], location['params'], location['locationType'])
                if data_type == 'OVERALL':
                    raw_data and data.append(raw_data['overall'])
                elif data_type == 'ADDRESS':
                    raw_data and data.extend(raw_data['data'])

            # OTHER SCOPES UNIMPLEMENTED
            else:
                return Response({'status_detail': ['Unimplemented']}, status=status.HTTP_501_NOT_IMPLEMENTED)
        elif business['businessType'] == 'CATEGORY':

            # ADDRESS & CITY & COUNTY + CATEGORY
            if location['locationType'] in ['ADDRESS', 'CITY', 'COUNTY']:
                raw_data = performance.category_performance(
                    business['params'], location['params'], location['locationType'])
                if data_type == 'OVERALL':
                    raw_data and data.append(raw_data['overall'])
                elif data_type == 'BRAND':
                    raw_data and data.extend(raw_data['by_brand'])
                elif data_type == 'ADDRESS':
                    raw_data and data.extend(raw_data['by_location'])

            # OTHER SCOPES UNIMPLEMENTED
            else:
                return Response({'status_detail': ['Unimplemented']}, status=status.HTTP_501_NOT_IMPLEMENTED)

        now = dt.datetime.utcnow()
        result = {
            'createAt': now,
            'updatedAt': now,
            'dataType': data_type,
            'data': data
        }

        return Response(result, status=status.HTTP_200_OK)


class NewsAPI(BasicAPI):

    serializer_class = SearchSerializer

    def get(self, request, *args, **kwargs):
        """

        Retrieve the news data for a brand/category & location scope.

        Parameters: {
            location: {
                locationType: 'ADDRESS'|'CITY'|'COUNTY' <-supported | unsupported rightnow ->['STATE'|'NATION']
                params: string
            }
            business: {
                businessType: 'BUSINESS' | 'CATEGORY'
                params: string
            }
        }

        Response:
            {
                createdAt: Date,
                updatedAt: Date,
                data: [
                    {
                        title: string,
                        link: url_string,
                        published: Date,
                        source: string,
                        description: string,
                        relevance: float
                    },
                ]
            }

        """

        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data

        location = params['location']['params']
        business = params['business']['params']

        data = news.news(business, location)

        now = dt.datetime.utcnow()
        return Response({
            'createdAt': now,
            'updatedAt': now,
            'data': data
        })


class AcitivtyAPI(BasicAPI):

    serializer_class = SearchSerializer

    def get(self, request, *args, **kwargs):
        """

        Retrieve the activity data for a brand/category & location scope.

        Parameters: {
            location: {
                locationType: 'ADDRESS'|'CITY'|'COUNTY' <- supported | unsupported => 'STATE'|'NATION'
                params: string
            }
            business: {
                businessType: 'BUSINESS' <- supported | -> unsupported ['CATEGORY']
                params: string
            }
        }
        # In future, we might add data_type and have a list of activities

        Response:
            {
                createdAt: Date,
                updatedAt: Date,
                data: [
                    {
                        name: string,
                        location: string,
                        activity: {           - # 4AM, 5AM, 12AM - 3AM may not be in result
                            4am?: number,
                            5am?: number,
                            6am: number,
                            7am: number,
                            8am: number,
                            ...
                            11pm: number,
                            12am?: number,
                            1am?: number,
                            2am?: number,
                            3am?: number
                        }
                    },
                ]
            }

        """

        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data

        location = params['location']
        business = params['business']

        data = []
        if business['businessType'] == 'BUSINESS':

            # ADDRESS + BUSINESS
            if location['locationType'] == 'ADDRESS':
                row = activity.activity(business['params'], location['params'])
                if row:
                    data.append(row)

            # CITY & COUNTY + BUSINESS
            elif location['locationType'] in ['CITY', 'COUNTY']:
                row = activity.aggregate_activity(
                    business['params'], location['params'], location['locationType'])
                if row:
                    data.append(row)

            # OTHER SCOPES UNIMPLEMENTED
            else:
                return Response({'status_detail': ['Unimplemented']}, status=status.HTTP_501_NOT_IMPLEMENTED)
        elif business['businessType'] == 'CATEGORY':
            error = "'CATEGORY' not supported for activity requests"
            return Response({'status_detail': [error]}, status=status.HTTP_400_BAD_REQUEST)

        now = dt.datetime.utcnow()
        return Response({
            'createdAt': now,
            'updatedAt': now,
            'data': data
        })
