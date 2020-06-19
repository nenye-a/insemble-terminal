import React from 'react';
import styled from 'styled-components';

import { Modal } from '../../core-ui';
import { DEFAULT_BORDER_RADIUS } from '../../constants/theme';

import ManageTerminalForm from './ManageTerminalForm';

type Props = {
  visible: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
};

export default function ManageTerminalModal(props: Props) {
  let { visible, onClose, mode = 'add' } = props;
  return (
    <Container visible={visible} hideCloseButton={true} onClose={onClose}>
      <ManageTerminalForm onClose={onClose} mode={mode} />
    </Container>
  );
}

const Container = styled(Modal)`
  width: 365px;
  max-height: fit-content;
  padding: 20px 24px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;
