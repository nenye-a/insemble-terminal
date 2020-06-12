import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import { Checkbox, Button, View } from '../../core-ui';
import { DataTable } from '../../components';
import { GetTokens_licenseList as TokenData } from '../../generated/GetTokens';
import {
  REMOVE_TOKENS,
  GET_TOKENS,
  GET_MASTER_TOKENS,
} from '../../graphql/queries/server/license';
import {
  RemoveTokens,
  RemoveTokensVariables,
} from '../../generated/RemoveTokens';

type Props = {
  data?: Array<TokenData>;
};

type DataWithCheck = TokenData & {
  isChecked: boolean;
};

export default function TokensTable(props: Props) {
  let { data = [] } = props;
  let [dataWithCheckbox, setDataWithCheckbox] = useState<Array<DataWithCheck>>(
    [],
  );
  let [allSelected, setAllSelected] = useState(false);
  let alert = useAlert();
  let [removeLicense, { loading: removeLicenseLoading }] = useMutation<
    RemoveTokens,
    RemoveTokensVariables
  >(REMOVE_TOKENS, {
    onError: (e) => {
      alert.show(e);
    },
  });

  let toggleCheck = (tkn: string) => {
    let newDataList = dataWithCheckbox.map((item) => {
      if (item.token === tkn) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    let checkSet = [...new Set(newDataList.map((datum) => datum.isChecked))];
    let currentCheck = checkSet.length === 1 && checkSet.includes(true);
    setAllSelected(currentCheck);
    setDataWithCheckbox(newDataList);
  };

  let onSelectAllPress = () => {
    let checkSet = [
      ...new Set(dataWithCheckbox.map((datum) => datum.isChecked)),
    ];
    let currentCheck = checkSet.length === 1 && checkSet.includes(true);
    let newDataList = dataWithCheckbox.map((item) => ({
      ...item,
      isChecked: !currentCheck,
    }));
    setAllSelected(!currentCheck);
    setDataWithCheckbox(newDataList);
  };

  let onDeletePress = () => {
    let checkedLicense = dataWithCheckbox
      .filter((item) => item.isChecked)
      .map((item) => item.token);
    removeLicense({
      variables: {
        tokens: checkedLicense,
      },
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_TOKENS }, { query: GET_MASTER_TOKENS }],
    });
  };

  useEffect(() => {
    let mappedData = data.map((item) => ({ ...item, isChecked: false }));
    setDataWithCheckbox(mappedData);
  }, [data]);

  return (
    <View>
      <DataTable>
        <DataTable.HeaderRow>
          <DataTable.HeaderCell width={40}>
            <Checkbox isChecked={allSelected} onPress={onSelectAllPress} />
          </DataTable.HeaderCell>
          <DataTable.HeaderCell>Token</DataTable.HeaderCell>
          <DataTable.HeaderCell width={250} align="right">
            Linked Email
          </DataTable.HeaderCell>
        </DataTable.HeaderRow>
        {dataWithCheckbox.map((row, index) => {
          let { token, linkedEmail, isChecked } = row;
          return (
            <DataTable.Row key={index}>
              <DataTable.Cell width={40}>
                <Checkbox
                  isChecked={isChecked}
                  onPress={() => {
                    toggleCheck(token);
                  }}
                />
              </DataTable.Cell>
              <DataTable.Cell>{token}</DataTable.Cell>
              <DataTable.Cell width={250} align="right">
                {linkedEmail}
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
      <DeleteButton
        text="Delete"
        onPress={onDeletePress}
        loading={removeLicenseLoading}
      />
    </View>
  );
}

const DeleteButton = styled(Button)`
  margin-top: 15px;
  align-self: flex-start;
`;
