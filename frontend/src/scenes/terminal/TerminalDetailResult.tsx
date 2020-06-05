import React from 'react';

import { View } from '../../core-ui';
import { GetTerminal_terminal_pinnedFeeds as PinnedFeeds } from '../../generated/GetTerminal';

type Props = {
  data: Array<PinnedFeeds>;
};
export default function TerminalDataResult(props: Props) {
  let { data } = props;
  return <View></View>;
}
