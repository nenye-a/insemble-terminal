import React from 'react';
import styled from 'styled-components';

import { View, Text, Link } from '../core-ui';
import { THEME_COLOR, WHITE } from '../constants/colors';
import { FONT_WEIGHT_BOLD } from '../constants/theme';

export default function ReadOnlyBanner() {
  return (
    <Container>
      <Text color={WHITE}>
        You are viewing a{' '}
        <Text color={WHITE} fontWeight={FONT_WEIGHT_BOLD}>
          read-only
        </Text>{' '}
        shared report from Insemble. To access data on millions of retailers and
        restaurants,{' '}
        <PurpleLink href="/contact-us">contact the Insemble team.</PurpleLink>
      </Text>
    </Container>
  );
}

const Container = styled(View)`
  min-height: 51px;
  flex-direction: row;
  padding: 8px 40px;
  background-color: ${THEME_COLOR};
  align-items: center;
  justify-content: left;
`;

const PurpleLink = styled(Link)`
  font-weight: ${FONT_WEIGHT_BOLD};
`;
