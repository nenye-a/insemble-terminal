import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { View, Text, Card } from '../../core-ui';
import { FONT_SIZE_MEDIUM, FONT_WEIGHT_LIGHT } from '../../constants/theme';
import { DARK_TEXT_COLOR } from '../../constants/colors';
import InsembleLogo from '../../components/InsembleLogo';

type Params = {
  errorStatus: string;
};
export default function ReferralVerificationFailedScene() {
  let params = useParams<Params>();
  let history = useHistory();
  let errorMessage =
    params.errorStatus === 'used'
      ? 'Referral code already used.'
      : params.errorStatus === 'exist'
      ? 'User already exist.'
      : 'Invalid Referral code.';

  useEffect(() => {
    const timer = setTimeout(() => history.push('/'), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Container flex title="Verification failed">
      <ContentContainer flex={true}>
        <InsembleLogo color="purple" />
        <Description>
          Failed to verified your referral code: {errorMessage}
        </Description>
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
