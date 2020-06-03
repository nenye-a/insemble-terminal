import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag } from '../../generated/globalTypes';

import ResultTitle from './ResultTitle';
import OwnershipInformationCard from './OwnershipInformationCard';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function PropertyOwnerInformationResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = {
    data: [],
    loading: false,
    error: null,
    refetch: () => {},
  };
  let noData = false;

  return (
    <Container>
      <ResultTitle
        title="Property Owner Information"
        noData={noData}
        reviewTag={ReviewTag.OWNERSHIP}
        tableId={''}
        onTableIdChange={(newTableId: string) => {
          refetch();
        }}
        comparisonTags={[]}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Property ownership information is not available at this scope. Please widen area of search to see." />
      ) : (
        <OwnershipInformationCard
          name="name"
          website="https://google.com"
          address="address"
          phone="phone"
          lastUpdate="lastUpdate"
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
  width: 600px;
`;
