import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAlert } from 'react-alert';
import { useMutation } from '@apollo/react-hooks';

import { View, Button, Checkbox } from '../../core-ui';
import { DataTable } from '../../components';
import { GetMasterTokens_masterLicenseList as MasterTokenData } from '../../generated/GetMasterTokens';
import {
  REMOVE_MASTER_TOKENS,
  GET_TOKENS,
  GET_MASTER_TOKENS,
  INCREMENT_MAX_TOKEN,
} from '../../graphql/queries/server/license';
import {
  RemoveMasterTokens,
  RemoveMasterTokensVariables,
} from '../../generated/RemoveMasterTokens';
import {
  IncrementMaxToken,
  IncrementMaxTokenVariables,
} from '../../generated/IncrementMaxToken';

type Props = {
  data?: Array<MasterTokenData>;
};

type DataWithCheck = MasterTokenData & {
  isChecked: boolean;
};

export default function MasterTokensTable(props: Props) {
  let { data = [] } = props;
  let [dataWithCheckbox, setDataWithCheckbox] = useState<Array<DataWithCheck>>(
    [],
  );
  let [allSelected, setAllSelected] = useState(false);
  let alert = useAlert();

  let [deleteMasterToken, { loading: deleteMasterTokenLoading }] = useMutation<
    RemoveMasterTokens,
    RemoveMasterTokensVariables
  >(REMOVE_MASTER_TOKENS, {
    onError: (e) => {
      alert.show(e.message);
    },
  });

  let [incrementMaxToken, { loading: incrementMaxTokenLoading }] = useMutation<
    IncrementMaxToken,
    IncrementMaxTokenVariables
  >(INCREMENT_MAX_TOKEN, {
    onError: (e) => {
      alert.show(e.message);
    },
  });

  let toggleCheck = (tkn: string) => {
    let newDataList = dataWithCheckbox.map((item) => {
      if (item.masterToken === tkn) {
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
      .map((item) => item.masterToken);
    deleteMasterToken({
      variables: {
        masterTokens: checkedLicense,
      },
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_TOKENS }, { query: GET_MASTER_TOKENS }],
    });
  };

  let onIncrementPress = () => {
    let checkedLicense = dataWithCheckbox
      .filter((item) => item.isChecked)
      .map((item) => item.masterToken);
    incrementMaxToken({
      variables: {
        masterTokens: checkedLicense,
      },
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_TOKENS }, { query: GET_MASTER_TOKENS }],
    });
  };

  useEffect(() => {
    let mappedData = data.map((item) => ({ ...item, isChecked: false }));
    setDataWithCheckbox(mappedData);
    setAllSelected(false);
  }, [data]);

  return (
    <View>
      <DataTable>
        <DataTable.HeaderRow>
          <DataTable.Cell width={40}>
            <Checkbox
              isChecked={allSelected}
              onPress={() => {
                onSelectAllPress();
              }}
            />
          </DataTable.Cell>
          <DataTable.HeaderCell>Master Token</DataTable.HeaderCell>
          <DataTable.HeaderCell width={100} align="right">
            Name
          </DataTable.HeaderCell>
          <DataTable.HeaderCell width={150} align="right">
            Number Tokens
          </DataTable.HeaderCell>
        </DataTable.HeaderRow>
        <DataTable.Body>
          {dataWithCheckbox.map((row, index) => {
            let { masterToken, name, numToken, isChecked } = row;
            return (
              <DataTable.Row key={index}>
                <DataTable.Cell width={40}>
                  <Checkbox
                    isChecked={isChecked}
                    onPress={() => {
                      toggleCheck(masterToken);
                    }}
                  />
                </DataTable.Cell>
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
        </DataTable.Body>
      </DataTable>
      <RowedView>
        <Button
          text="Delete"
          onPress={onDeletePress}
          loading={deleteMasterTokenLoading}
        />
        <Spacing />
        <Button
          text="Increment Token"
          onPress={onIncrementPress}
          loading={incrementMaxTokenLoading}
        />
      </RowedView>
    </View>
  );
}

const RowedView = styled(View)`
  flex-direction: row;
  margin: 12px 0;
`;

const SPACING_WIDTH = 12;

const Spacing = styled(View)`
  width: ${SPACING_WIDTH.toString() + 'px'};
`;
