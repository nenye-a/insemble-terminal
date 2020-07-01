import React, { useState } from 'react';
import Popover from 'react-tiny-popover';
import styled from 'styled-components';

import {
  TouchableOpacity,
  Text,
  Card,
  Modal,
  LoadingIndicator,
} from '../core-ui';
import { DISABLED_TEXT_COLOR, THEME_COLOR } from '../constants/colors';
import { ReviewTag, TableType } from '../generated/globalTypes';
import { ComparationTagWithFill } from '../types/types';
import AddComparisonModal from '../scenes/results/AddComparisonModal';

import SvgTripleDotsRow from './icons/triple-dots-row';
import SvgRoundAdd from './icons/round-add';
import SvgPin from './icons/pin';
import PinPopover from './PinPopover';
import SvgClose from './icons/close';

type TripleDotsPopoverProps = {
  reviewTag?: ReviewTag;
  tableId?: string;
  onTableIdChange?: (newTableId: string) => void;
  comparisonTags?: Array<ComparationTagWithFill>;
  sortOrder?: Array<string>;
  onSortOrderChange?: (newSortOrder: Array<string>) => void;
  pinTableId?: string;
  terminalId?: string;
  readOnly?: boolean;
  tableType: TableType;
  isTerminalScene?: boolean;
  removePinFn: () => void;
  removePinLoading: boolean;
};

type Props = TripleDotsPopoverProps & {
  disabled?: boolean;
};

export default function TripleDotsButton(props: Props) {
  let { disabled, ...tripleDotsProps } = props;
  let [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <Popover
      isOpen={popoverVisible}
      content={<TripleDotsPopover {...tripleDotsProps} />}
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
    isTerminalScene,
    tableType,
    removePinFn,
    removePinLoading,
  } = props;
  let [comparisonModalVisible, setComparisonModalVisible] = useState(false);
  let [pinModalVisible, setPinModalVisible] = useState(false);

  return (
    <Container>
      {tableId && reviewTag && (
        <>
          <AddComparisonModal
            visible={comparisonModalVisible}
            onClose={() => setComparisonModalVisible(false)}
            reviewTag={reviewTag}
            tableId={tableId}
            onTableIdChange={onTableIdChange}
            activeComparison={comparisonTags}
            sortOrder={sortOrder}
            onSortOrderChange={onSortOrderChange}
            pinId={pinTableId}
            terminalId={terminalId}
          />
          <PinModal
            visible={pinModalVisible}
            onClose={() => setPinModalVisible(false)}
            hideCloseButton={true}
          >
            <PinPopover
              onClickAway={() => setPinModalVisible(false)}
              tableId={tableId}
              tableType={tableType}
            />
          </PinModal>
        </>
      )}
      <ButtonContainer
        onPress={() => {
          setComparisonModalVisible(true);
        }}
      >
        <SvgRoundAdd width={24} height={24} />
        <PurpleText>Compare</PurpleText>
      </ButtonContainer>
      {isTerminalScene ? (
        <ButtonContainer onPress={removePinFn} disabled={removePinLoading}>
          {removePinLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              <SvgClose width={24} height={24} style={{ color: THEME_COLOR }} />
              <PurpleText>Remove</PurpleText>
            </>
          )}
        </ButtonContainer>
      ) : (
        <ButtonContainer
          onPress={() => {
            setPinModalVisible(true);
          }}
        >
          <SvgPin width={24} height={24} style={{ color: THEME_COLOR }} />
          <PurpleText>Terminals</PurpleText>
        </ButtonContainer>
      )}

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

const PinModal = styled(Modal)`
  width: 90vw;
  max-height: 80vh;
  height: fit-content;
  border-radius: 2px;
  justify-content: center;
  background-color: transparent;
`;
