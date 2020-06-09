import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { View, Text, Button } from '../../core-ui';
import { WHITE } from '../../constants/colors';
import { FONT_WEIGHT_MEDIUM, FONT_SIZE_XLARGE } from '../../constants/theme';

export default function ContactUsSection() {
  let history = useHistory();

  return (
    <Container>
      <Title>Want to learn more? Please contact Us.</Title>
      <ContactUsButton
        text="Contact Us"
        textProps={{
          fontWeight: FONT_WEIGHT_MEDIUM,
          fontSize: FONT_SIZE_XLARGE,
        }}
        onPress={() => {
          history.push('/contact-us');
        }}
      />
    </Container>
  );
}

const Container = styled(View)`
  padding: 70px 0;
  background-color: ${WHITE};
  align-items: center;
`;
const ContactUsButton = styled(Button)`
  padding: 22px 30px;
  height: 80px;
`;
const Title = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding-bottom: 30px;
`;
