import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';

import {
  Modal,
  Text,
  RadioGroup,
  TextArea,
  Button,
  Form,
  View,
  Alert,
} from '../../core-ui';
import {
  FONT_SIZE_LARGE,
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_BOLD,
} from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';
import { TableType } from '../../generated/globalTypes';
import { SEND_FEEDBACK } from '../../graphql/queries/server/feedback';
import {
  SendFeedback,
  SendFeedbackVariables,
} from '../../generated/SendFeedback';

type Props = {
  visible: boolean;
  onClose: () => void;
  tableId?: string;
  tableType?: TableType;
  title?: string;
};

const RADIO_OPTIONS = [
  'This is not helpful',
  'This is not relevant',
  'Something is wrong',
  'This is not useful',
];

export default function AddFeedbackModal(props: Props) {
  let { visible, onClose, tableId, tableType, title: customFeed } = props;
  let { register, handleSubmit, reset } = useForm();
  let [selectedRadio, setSelectedRadio] = useState(RADIO_OPTIONS[0]);
  let [message, setMessage] = useState('');
  let [sendFeedback, { loading, data, error }] = useMutation<
    SendFeedback,
    SendFeedbackVariables
  >(SEND_FEEDBACK, {
    onCompleted: () => {
      reset();
      setSelectedRadio(RADIO_OPTIONS[0]);
    },
  });

  let onSubmit = (fieldValues: FieldValues) => {
    let { title, details } = fieldValues;
    // At least there's selected radio option
    if (title) {
      sendFeedback({
        variables: {
          tableId,
          tableType,
          feedbackTitle: title,
          feedbackDetail: details,
          customFeed,
        },
      });
    }
  };

  useEffect(() => {
    if (error) {
      setMessage(error.message);
    } else if (data) {
      setMessage('Feedback successfully sent.');
    }
  }, [data, error]);

  useEffect(() => {
    // clean up the message when modal re-opened
    setMessage('');
  }, [visible]);

  return (
    <Container visible={visible} onClose={onClose}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Title>Feedback</Title>
        <Alert visible={!!message} text={message} />
        <FeedbackRadioGroup
          options={RADIO_OPTIONS}
          onSelect={setSelectedRadio}
          selectedOption={selectedRadio}
          ref={register}
          name="title"
          radioItemProps={{
            ref: register,
          }}
        />
        <TextArea label="Details (optional)" ref={register} name="details" />
        <ButtonRow>
          <Button
            size="small"
            mode="secondary"
            text="Cancel"
            onPress={onClose}
          />
          <Button
            size="small"
            text="Create"
            type="submit"
            loading={loading}
            style={{ marginLeft: 8 }}
          />
        </ButtonRow>
      </Form>
    </Container>
  );
}

const Container = styled(Modal)`
  width: 365px;
  max-height: fit-content;
  padding: 12px 24px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
`;

const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
  padding: 12px 0;
`;

const ButtonRow = styled(View)`
  flex-direction: row;
  justify-content: flex-end;
  padding-top: 12px;
`;

const FeedbackRadioGroup = styled(RadioGroup)`
  padding: 12px 0 50px 0;
`;
