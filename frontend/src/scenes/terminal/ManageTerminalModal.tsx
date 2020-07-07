import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useLazyQuery } from '@apollo/react-hooks';

import { Modal, LoadingIndicator } from '../../core-ui';
import { ErrorComponent } from '../../components';
import { DEFAULT_BORDER_RADIUS } from '../../constants/theme';
import {
  GetTerminalBasicInfo,
  GetTerminalBasicInfoVariables,
} from '../../generated/GetTerminalBasicInfo';
import { GET_TERMINAL_BASIC_INFO } from '../../graphql/queries/server/terminals';

import ManageTerminalForm from './ManageTerminalForm';

type Props = {
  visible: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
  terminalId?: string;
  refetchCurrentPage?: () => void;
};

export default function ManageTerminalModal(props: Props) {
  let {
    visible,
    onClose,
    mode = 'add',
    terminalId,
    refetchCurrentPage,
  } = props;
  let [
    getTerminalBasicInfo,
    { data: terminalBasicInfoData, loading, error },
  ] = useLazyQuery<GetTerminalBasicInfo, GetTerminalBasicInfoVariables>(
    GET_TERMINAL_BASIC_INFO,
  );

  useEffect(() => {
    if (mode === 'edit' && terminalId) {
      getTerminalBasicInfo({
        variables: {
          terminalId,
        },
      });
    }
  }, [mode, terminalId, getTerminalBasicInfo]);

  return (
    <Container visible={visible} hideCloseButton={true} onClose={onClose}>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent text={error.message} />
      ) : (
        <ManageTerminalForm
          refetchCurrentPage={refetchCurrentPage}
          onClose={onClose}
          mode={mode}
          {...(mode === 'edit' && {
            prevName: terminalBasicInfoData?.terminal.name,
            prevDescription: terminalBasicInfoData?.terminal.description,
            terminalId,
          })}
        />
      )}
    </Container>
  );
}

const Container = styled(Modal)`
  width: 365px;
  max-height: fit-content;
  padding: 20px 24px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;
