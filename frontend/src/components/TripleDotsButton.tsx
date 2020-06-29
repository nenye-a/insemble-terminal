import React, { useState } from 'react';
import Popover from 'react-tiny-popover';
import styled from 'styled-components';

import { TouchableOpacity, Text, Card } from '../core-ui';
import { DISABLED_TEXT_COLOR, THEME_COLOR } from '../constants/colors';
import { ReviewTag } from '../generated/globalTypes';
import { ComparationTagWithFill } from '../types/types';
import AddComparisonModal from '../scenes/results/AddComparisonModal';

import SvgTripleDotsRow from './icons/triple-dots-row';
import SvgRoundAdd from './icons/round-add';
import SvgPin from './icons/pin';

type Props = {
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
};

export default function TripleDotsButton(props: Props) {
  let {
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
  } = props;
  let [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <Popover
      isOpen={popoverVisible}
      content={
        <TripleDotsPopover
          reviewTag={reviewTag}
          tableId={tableId}
          onTableIdChange={onTableIdChange}
          comparisonTags={comparisonTags}
          sortOrder={sortOrder}
          onSortOrderChange={onSortOrderChange}
          pinTableId={pinTableId}
          terminalId={terminalId}
          readOnly={readOnly}
        />
      }
      position={['bottom']}
      onClickOutside={() => {
        setPopoverVisible(false);
      }}
      align="end"
    >
      {(ref) => (
        <Touchable
          ref={ref}
          onPress={() => {
            setPopoverVisible(true);
          }}
          disabled={disabled}
        >
          <SvgTripleDotsRow
            style={{ color: disabled ? DISABLED_TEXT_COLOR : THEME_COLOR }}
          />
        </Touchable>
      )}
    </Popover>
  );
}

type TripleDotsPopoverProps = {
  reviewTag: ReviewTag;
  tableId: string;
  onTableIdChange?: (newTableId: string) => void;
  comparisonTags?: Array<ComparationTagWithFill>;
  sortOrder?: Array<string>;
  onSortOrderChange?: (newSortOrder: Array<string>) => void;
  pinTableId?: string;
  terminalId?: string;
  readOnly?: boolean;
};

function TripleDotsPopover(props: TripleDotsPopoverProps) {
  let {
    reviewTag,
    tableId,
    onTableIdChange,
    comparisonTags,
    sortOrder,
    onSortOrderChange,
    pinTableId,
    terminalId,
    readOnly,
  } = props;
  let [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  return (
    <Container>
      <AddComparisonModal
        visible={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        reviewTag={reviewTag}
        tableId={tableId}
        onTableIdChange={onTableIdChange}
        activeComparison={comparisonTags}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        pinId={pinTableId}
        terminalId={terminalId}
      />
      <ButtonContainer
        onPress={() => {
          setComparisonModalOpen(true);
        }}
      >
        <SvgRoundAdd width={24} height={24} />
        <PurpleText>Compare</PurpleText>
      </ButtonContainer>
      <ButtonContainer>
        <SvgPin width={24} height={24} style={{ color: THEME_COLOR }} />
        <PurpleText>Terminals</PurpleText>
      </ButtonContainer>
      {/* TODO: add export button */}
    </Container>
  );
}

const Container = styled(Card)`
  flex-direction: row;
  padding: 12px 16px;
`;
const ButtonContainer = styled(TouchableOpacity)`
  padding: 8px;
  align-items: center;
`;
const Touchable = styled(TouchableOpacity)`
  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;
const PurpleText = styled(Text)`
  color: ${THEME_COLOR};
  padding-top: 8px;
`;
