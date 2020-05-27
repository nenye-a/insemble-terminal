import React from 'react';
import styled from 'styled-components';

import { Modal } from '../../core-ui';
import { DEFAULT_BORDER_RADIUS } from '../../constants/theme';

import AddNewTerminalForm from './AddNewTerminalForm';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddNewTerminalModal(props: Props) {
  let { visible, onClose } = props;
  return (
    <Container visible={visible} hideCloseButton={true} onClose={onClose}>
      <AddNewTerminalForm onClose={onClose} />
    </Container>
  );
}

const Container = styled(Modal)`
  width: 365px;
  max-height: fit-content;
  padding: 20px 24px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;
