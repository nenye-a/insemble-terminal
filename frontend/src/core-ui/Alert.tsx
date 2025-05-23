import React from 'react';
import styled from 'styled-components';
import { AlertComponentPropsWithStyle } from 'react-alert';

import { THEME_COLOR, ALERT_BACKGROUND_COLOR } from '../constants/colors';
import { FONT_SIZE_SMALL, DEFAULT_BORDER_RADIUS } from '../constants/theme';
import { formatGraphQLError } from '../helpers';
import SvgInfo from '../components/icons/info';
import SvgClose from '../components/icons/close';

import TouchableOpacity from './TouchableOpacity';
import View from './View';
import Text from './Text';

type Props = ViewProps & {
  text: string;
  visible?: boolean;
  onClose?: () => void;
};

export default function Alert(props: Props) {
  // Show alert inside some container (not on top of the screen with absolute positioning)
  let { visible, text, onClose, ...otherProps } = props;
  let formattedText = formatGraphQLError(text);
  if (visible) {
    return (
      <Container {...otherProps}>
        <Row>
          <SvgInfo style={{ color: THEME_COLOR }} />
          <Message color={THEME_COLOR} fontSize={FONT_SIZE_SMALL}>
            {formattedText}
          </Message>
        </Row>
        {onClose ? (
          <TouchableOpacity onPress={onClose}>
            <SvgClose style={{ height: 18, width: 18, color: THEME_COLOR }} />
          </TouchableOpacity>
        ) : null}
      </Container>
    );
  }
  return null;
}

// Alert template when using useAlert() from react-alert
export function AlertTemplate(props: AlertComponentPropsWithStyle) {
  let { message, close, ...otherProps } = props;
  let formattedMessage =
    typeof message === 'string' ? formatGraphQLError(message) : message;
  return (
    <Container {...otherProps}>
      <Row>
        <SvgInfo style={{ color: THEME_COLOR }} />
        <Message color={THEME_COLOR} fontSize={FONT_SIZE_SMALL}>
          {formattedMessage}
        </Message>
      </Row>
      {close ? (
        <TouchableOpacity onPress={close} style={{ marginLeft: 5 }}>
          <SvgClose style={{ height: 18, width: 18, color: THEME_COLOR }} />
        </TouchableOpacity>
      ) : null}
    </Container>
  );
}
const Container = styled(View)`
  border: 1px solid ${THEME_COLOR};
  flex-direction: row;
  padding: 9px 12px;
  background-color: ${ALERT_BACKGROUND_COLOR};
  border-radius: ${DEFAULT_BORDER_RADIUS};
  justify-content: space-between;
`;

const Row = styled(View)`
  flex-direction: row;
`;

const Message = styled(Text)`
  margin-left: 8px;
`;
