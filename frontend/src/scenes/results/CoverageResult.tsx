import React from 'react';
import styled from 'styled-components';

import { View, LoadingIndicator } from '../../core-ui';
import { ErrorComponent, EmptyDataComponent } from '../../components';
import { useGoogleMaps, generateRandomColor } from '../../helpers';
import { ReviewTag } from '../../generated/globalTypes';

import CoverageTable from './CoverageTable';
import CoverageMap from './CoverageMap';
import ResultTitle from './ResultTitle';

export default function CoverageResult() {
  let { isLoading } = useGoogleMaps();
  let { loading, data, error, refetch } = {
    loading: false,
    data: COVERAGE_DUMMY_DATA, // might need to change the type
    error: null,
    refetch: () => {},
  };
  let noData = data.data.length === 0;

  let dataWithFill = [...data.data, ...data.compareData].map((item) => ({
    ...item,
    fill: generateRandomColor(),
  }));

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View>
      <ResultTitle
        title="Coverage"
        noData={noData}
        reviewTag={ReviewTag.COVERAGE}
        tableId={''}
        onTableIdChange={(_newTableId: string) => {
          refetch();
        }}
        comparisonTags={[]}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Coverage data is not available at this scope. Please widen area of search to see." />
      ) : (
        <ContentContainer>
          <CoverageTable data={dataWithFill} />
          <CoverageMap data={dataWithFill} />
        </ContentContainer>
      )}
    </View>
  );
}

const ContentContainer = styled(View)`
  flex-direction: row;
  height: 340px;
`;

const COVERAGE_DUMMY_DATA = {
  data: [
    {
      name: 'Cheesecake Factory',
      numLocations: 2,
      locations: [
        { lat: 34.026478, lng: -118.427113 },
        { lat: 34.026479, lng: -118.427112 },
      ],
    },
  ],
  compareData: [
    {
      name: 'KFC',
      numLocations: 2,
      locations: [
        { lat: 34.139101, lng: -118.21521 },
        { lat: 34.141463, lng: -118.224311 },
      ],
    },
  ],
};
