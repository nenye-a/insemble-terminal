import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag } from '../../generated/globalTypes';

import ResultTitle from './ResultTitle';
import ContactsTable from './ContactsTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function CompanyContactsResult(props: Props) {
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
        <EmptyDataComponent text="Property owner information is not available at this scope. Widen scope of search to see latest news." />
      ) : (
        <ContactsTable data={[]} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
