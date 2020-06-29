import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { THEME_COLOR } from '../../constants/colors';
import { FONT_WEIGHT_BOLD } from '../../constants/theme';
import { useViewport } from '../../helpers';

export default function PerformanceTablePopover() {
  let { isDesktop } = useViewport();
  let content = [
    {
      title: 'Volume Index',
      subtitle: '(national)',
      description: (
        <Text>
          The customer volume index represents the volume of customers that this
          company or category sees, over the last few months compared to{' '}
          <Text fontWeight={FONT_WEIGHT_BOLD}>general retail</Text>.
        </Text>
      ),
    },
    {
      title: 'Category Index',
      subtitle: '(local)',
      description: (
        <Text>
          Similar to Volume Index, except volume of customers is compared to{' '}
          <Text fontWeight={FONT_WEIGHT_BOLD}>same category businesses </Text>{' '}
          within 3 mi.
        </Text>
      ),
    },
    {
      title: 'Retail Index',
      subtitle: '(local)',
      description: (
        <Text>
          Similar to the Volume Index, except volume of customers is compared
          against <Text fontWeight={FONT_WEIGHT_BOLD}>all retail</Text> within 1
          mi.
        </Text>
      ),
    },
    {
      title: 'Brand Index',
      subtitle: '(national)',
      description: (
        <Text>
          Similar to the Volume Index, except volume of customers is compared to{' '}
          <Text fontWeight={FONT_WEIGHT_BOLD}>all locations nationwide</Text>{' '}
          for the brand.
        </Text>
      ),
    },
    {
      title: 'Reviews and Ratings',
      subtitle: '',
      description: (
        <Text>
          A composite rating of scores from multiple online review sources.
        </Text>
      ),
    },
  ];
  return (
    <Container>
      {isDesktop
        ? content.map(({ title, subtitle, description }, idx) => (
            <ItemContainer key={idx}>
              <PopoverTitle>
                {title}
                <Text> {subtitle}</Text>
              </PopoverTitle>
              {description}
            </ItemContainer>
          ))
        : content.map(({ title, subtitle, description }, idx) => (
            <ItemContainerMobile key={idx}>
              <PopoverTitle>
                {title}
                <Text> {subtitle}</Text>
              </PopoverTitle>
              {description}
            </ItemContainerMobile>
          ))}
    </Container>
  );
}
const PopoverTitle = styled(Text)`
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_BOLD};
  margin-bottom: 12px;
`;
const Container = styled(View)`
  flex-flow: row wrap;
`;
const ItemContainer = styled(View)`
  width: 50%;
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const ItemContainerMobile = styled(View)`
  width: 100%;
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;
