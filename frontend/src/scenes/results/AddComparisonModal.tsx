import React from 'react';
import styled from 'styled-components';

import { Modal } from '../../core-ui';
import { ComparisonPopover } from '../../components';
import { ReviewTag } from '../../generated/globalTypes';
import { ComparationTagWithFill } from '../../types/types';

type Props = {
  visible: boolean;
  onClose?: () => void;

  // popover props
  reviewTag: ReviewTag;
  tableId: string;
  onTableIdChange?: (tableId: string) => void;
  activeComparison?: Array<ComparationTagWithFill>;
  sortOrder?: Array<string>;
  onSortOrderChange?: (order: Array<string>) => void;
  pinId?: string;
  terminalId?: string;
};

export default function AddComparisonModal(props: Props) {
  let { visible, onClose, ...otherProps } = props;

  return (
    <Container visible={visible} onClose={onClose} hideCloseButton={true}>
      <ComparisonPopover {...otherProps} />
    </Container>
  );
}

const Container = styled(Modal)`
  width: 90vw;
  max-height: 80vh;
  height: fit-content;
  border-radius: 2px;
  justify-content: center;
  background-color: transparent;
`;
