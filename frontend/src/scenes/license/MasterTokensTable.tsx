import React from 'react';

import { DataTable } from '../../components';
import { GetMasterTokens_masterLicenseList as MasterTokenData } from '../../generated/GetMasterTokens';

type Props = {
  data?: Array<MasterTokenData>;
};

export default function MasterTokensTable(props: Props) {
  let { data = [] } = props;
  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell>Master Token</DataTable.HeaderCell>
        <DataTable.HeaderCell width={100} align="right">
          Name
        </DataTable.HeaderCell>
        <DataTable.HeaderCell width={150} align="right">
          Number Tokens
        </DataTable.HeaderCell>
      </DataTable.HeaderRow>
      {data.map((row, index) => {
        let { masterToken, name, numToken } = row;
        return (
          <DataTable.Row key={index}>
            <DataTable.Cell>{masterToken}</DataTable.Cell>
            <DataTable.Cell width={100} align="right">
              {name}
            </DataTable.Cell>
            <DataTable.Cell width={150} align="right">
              {numToken}
            </DataTable.Cell>
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}
