import React from 'react';
import styled from 'styled-components';

import { View, Text, Card } from '../../core-ui';
import { FONT_SIZE_MEDIUM, FONT_WEIGHT_LIGHT } from '../../constants/theme';
import { DARK_TEXT_COLOR } from '../../constants/colors';
import InsembleLogo from '../../components/InsembleLogo';

export default function VerificationSucessfulScene() {
  return (
    <Container flex title="Verification success">
      <ContentContainer flex={true}>
        <InsembleLogo color="purple" />
        <Description>You have successfully verified your account</Description>
      </ContentContainer>
    </Container>
  );
}

const Container = styled(Card)`
  align-self: center;
  margin: 24px;
  width: 720px;
  min-height: 80vh;
`;
const ContentContainer = styled(View)`
  flex: 0;
  align-items: flex-start;
  padding: 48px;
`;

const Description = styled(Text)`
  font-size: ${FONT_SIZE_MEDIUM};
  font-weight: ${FONT_WEIGHT_LIGHT};
  margin: 16px 0 0 0;
  color: ${DARK_TEXT_COLOR};
`;
