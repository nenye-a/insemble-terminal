import React from 'react';

import { DataTable } from '../../components';
import { GetTokens_licenseList as TokenData } from '../../generated/GetTokens';

type Props = {
  data?: Array<TokenData>;
};

export default function TokensTable(props: Props) {
  let { data = [] } = props;
  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell width={800}>Token</DataTable.HeaderCell>
        <DataTable.HeaderCell width={250} align="right">
          Linked Email
        </DataTable.HeaderCell>
      </DataTable.HeaderRow>
      {data.map((row, index) => {
        let { token, linkedEmail } = row;
        return (
          <DataTable.Row key={index}>
            <DataTable.Cell width={800}>{token}</DataTable.Cell>
            <DataTable.Cell width={250} align="right">
              {linkedEmail}
            </DataTable.Cell>
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}
