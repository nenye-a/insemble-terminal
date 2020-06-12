import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';

import { View } from '../../core-ui';
import { Tab } from '../../components';

import GenerateTokenScene from './GenerateTokenScene';
import EditTokenScene from './EditTokenScene';

enum ManageTokenMenu {
  NEW_TOKEN,
  EDIT_TOKEN,
}
const OPTIONS = [
  {
    label: 'New Token',
    path: '/manage-token/generate-token',
  },
  {
    label: 'Edit Token',
    path: '/manage-token/edit-token',
  },
];

type ManageTokenTab = {
  label: string;
  path: string;
};

type Param = {
  param?: string;
};

export default function ManageTokenScene() {
  let params = useParams<Param>();
  let defaultActiveIndex = () => {
    if (params.param === 'generate-token') {
      return ManageTokenMenu.NEW_TOKEN;
    }
    return ManageTokenMenu.EDIT_TOKEN;
  };
  let [activeTabIndex, setActiveTabIndex] = useState(defaultActiveIndex);
  let history = useHistory();

  let tabOptionExtractor = (item: ManageTokenTab) => item.label;
  return (
    <Container>
      <Tab<ManageTokenTab>
        activeTabIndex={activeTabIndex}
        options={OPTIONS}
        onTabPress={(idx) => {
          setActiveTabIndex(idx);
          history.push(OPTIONS[idx].path);
        }}
        optionExtractor={tabOptionExtractor}
      />
      {activeTabIndex === ManageTokenMenu.NEW_TOKEN ? (
        <GenerateTokenScene />
      ) : (
        <EditTokenScene />
      )}
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  align-items: center;
  padding: 40px;
  min-height: 90vh;
`;
