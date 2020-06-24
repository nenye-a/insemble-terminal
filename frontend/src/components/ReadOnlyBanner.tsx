import React from 'react';
import styled from 'styled-components';

import { View, Text, Link } from '../core-ui';
import { THEME_COLOR, WHITE, LIGHT_PURPLE } from '../constants/colors';
import { FONT_WEIGHT_BOLD, FONT_WEIGHT_MEDIUM } from '../constants/theme';

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
        <PurpleLink href="/contact-us" target="_top">
          contact the Insemble team.
        </PurpleLink>
      </Text>
      {/* <ReadOnlyBadge>
        <Text fontWeight={FONT_WEIGHT_MEDIUM}>Read Only</Text>
      </ReadOnlyBadge> */}
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

// const ReadOnlyBadge = styled(View)`
//   padding: 8px 24px;
//   height: 33px;
//   border-radius: 15px;
//   background-color: ${LIGHT_PURPLE};
// `;

const PurpleLink = styled(Link)`
  color: #c9cbff;
  font-weight: ${FONT_WEIGHT_BOLD};
`;
