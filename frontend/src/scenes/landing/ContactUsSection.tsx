import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { View, Text, Button } from '../../core-ui';
import { WHITE } from '../../constants/colors';
import {
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_XLARGE,
  FONT_SIZE_LARGE,
} from '../../constants/theme';
import { useViewport } from '../../helpers';

export default function ContactUsSection() {
  let history = useHistory();
  let { isDesktop } = useViewport();
  let title = isDesktop
    ? 'Want to learn more? Please contact us'
    : 'Want to learn more?';
  let buttonProps = {
    text: 'Contact Us',
    onPress: () => {
      history.push('/contact-us');
    },
  };
  return (
    <Container>
      {isDesktop ? (
        <>
          <Title>{title}</Title>
          <ContactUsButton
            textProps={{
              fontWeight: FONT_WEIGHT_MEDIUM,
              fontSize: FONT_SIZE_XLARGE,
            }}
            {...buttonProps}
          />
        </>
      ) : (
        <>
          <TitleMobile>{title}</TitleMobile>
          <ContactUsButtonMobile
            textProps={{
              fontWeight: FONT_WEIGHT_MEDIUM,
              fontSize: FONT_SIZE_LARGE,
            }}
            {...buttonProps}
          />
        </>
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 70px 24px;
  background-color: ${WHITE};
  align-items: center;
`;
const ContactUsButton = styled(Button)`
  padding: 22px 30px;
  height: 80px;
`;
const ContactUsButtonMobile = styled(Button)`
  height: 54px;
`;
const Title = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding-bottom: 30px;
`;
const TitleMobile = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: 17px;
  padding-bottom: 8px;
`;
