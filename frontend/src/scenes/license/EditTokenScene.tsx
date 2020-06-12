import React from 'react';

import { View } from '../../core-ui';

import MasterTokenList from './MasterTokenList';
import TokenList from './TokenList';

export default function EditTokenScene() {
  return (
    <View>
      <MasterTokenList />
      <TokenList />
    </View>
  );
}
