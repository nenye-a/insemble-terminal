import React from 'react';
import styled from 'styled-components';

import { Modal, Card, View, Text, Button, LoadingIndicator } from '../core-ui';
import {
  BACKGROUND_COLOR,
  DARK_TEXT_COLOR,
  THEME_COLOR,
} from '../constants/colors';

type PopupButton = {
  text: string;
  onPress: () => void;
};

type Props = {
  visible?: boolean;
  title: string;
  bodyText: string;
  buttons?: Array<PopupButton>;
  loading?: boolean;
};

/**
 * Small modal functioning as confirmation dialog.
 * Can pass multiple buttons.
 * The order of the buttons will be reversed when rendering.
 * The button on the most right, will be the primary button.
 */

export default function Popup(props: Props) {
  let { visible, title, bodyText, buttons, loading } = props;

  return (
    <Container hideCloseButton={true} visible={visible || false}>
      <Card title={title}>
        {loading ? (
          <Content>
            <LoadingIndicator />
          </Content>
        ) : (
          <>
            <Content>
              <BodyText>{bodyText}</BodyText>
            </Content>
            <Footer>
              {buttons?.reverse().map(({ text, onPress }, index) => {
                let lastIndex = buttons?.length === index + 1;
                return (
                  <Button
                    key={index}
                    mode={lastIndex ? 'primary' : 'withShadow'}
                    text={text}
                    onPress={onPress}
                    style={
                      !lastIndex
                        ? { marginRight: 8, borderColor: THEME_COLOR }
                        : undefined
                    }
                  />
                );
              })}
            </Footer>
          </>
        )}
      </Card>
    </Container>
  );
}

const Container = styled(Modal)`
  max-width: 500px;
  width: 90%;
  height: fit-content;
  background-color: transparent;
`;

const Content = styled(View)`
  padding: 22px;
  min-height: 200px;
`;

const BodyText = styled(Text)`
  color: ${DARK_TEXT_COLOR};
`;

const Footer = styled(View)`
  padding: 12px;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  background-color: ${BACKGROUND_COLOR};
`;
