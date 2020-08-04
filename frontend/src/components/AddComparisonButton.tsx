import React from 'react';
import styled from 'styled-components';
import Popover from 'react-tiny-popover';
import { useAlert } from 'react-alert';

import { TouchableOpacity } from '../core-ui';
import { ReviewTag } from '../generated/globalTypes';
import { useAuth } from '../context';
import { MESSAGE } from '../constants/message';
import { DISABLED_TEXT_COLOR, THEME_COLOR } from '../constants/colors';
import { ComparationTagWithFill } from '../types/types';

import ComparisonPopover from './ComparisonPopover';
import SvgRoundAdd from './icons/round-add';

type Props = {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  disabled?: boolean;
  reviewTag: ReviewTag;
  tableId: string;
  onTableIdChange?: (newTableId: string) => void;
  comparisonTags?: Array<ComparationTagWithFill>;
  sortOrder?: Array<string>;
  onSortOrderChange?: (newSortOrder: Array<string>) => void;
  pinTableId?: string;
  terminalId?: string;
  readOnly?: boolean;
  demo?: boolean;
};
export default function AddComparisonButton(props: Props) {
  let {
    isOpen,
    onChange,
    disabled,
    reviewTag,
    tableId,
    onTableIdChange,
    comparisonTags,
    sortOrder,
    onSortOrderChange,
    pinTableId,
    terminalId,
    readOnly,
    demo,
  } = props;
  let { isAuthenticated } = useAuth();
  let alert = useAlert();

  // Popover content
  let comparisonPopover = (
    <ComparisonPopover
      reviewTag={reviewTag}
      tableId={tableId}
      onTableIdChange={onTableIdChange}
      activeComparison={comparisonTags}
      sortOrder={sortOrder}
      onSortOrderChange={onSortOrderChange}
      pinId={pinTableId}
      terminalId={terminalId}
    />
  );

  return (
    <Popover
      isOpen={isOpen}
      content={comparisonPopover}
      position={['bottom']}
      align="end"
      onClickOutside={() => onChange(false)}
    >
      {(ref) => (
        <Touchable
          ref={ref}
          onPress={() => {
            if (isAuthenticated) {
              if (readOnly) {
                alert.show(MESSAGE.ReadOnly);
              } else {
                onChange(true);
              }
            } else {
              alert.show(MESSAGE.LoginNeeded);
            }
          }}
          disabled={disabled || demo}
        >
          <SvgRoundAdd {...(disabled && { fill: DISABLED_TEXT_COLOR })} />
        </Touchable>
      )}
    </Popover>
  );
}

const Touchable = styled(TouchableOpacity)`
  margin-left: 12px;
  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;
