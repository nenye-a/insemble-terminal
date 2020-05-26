import React, { ReactNode, forwardRef, Ref } from 'react';
import styled from 'styled-components';

import {
  DEFAULT_BORDER_RADIUS,
  FONT_SIZE_MEDIUM,
  FONT_WEIGHT_MEDIUM,
} from '../constants/theme';
import { WHITE, SHADOW_COLOR, THEME_COLOR } from '../constants/colors';

import View from './View';
import Text from './Text';

export type CardProps = ViewProps & {
  children?: ReactNode;
  title?: string;
};

export default forwardRef(
  (props: CardProps, forwardedRef: Ref<HTMLDivElement>) => {
    let { children, title, ...otherProps } = props;

    return (
      <StyledCard ref={forwardedRef} {...otherProps}>
        {title && (
          <TitleContainer>
            <Title>{title}</Title>
          </TitleContainer>
        )}
        {children}
      </StyledCard>
    );
  },
);

const StyledCard = styled(View)`
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  background-color: ${WHITE};
  overflow: hidden;
  background-color: ${WHITE};
`;

const TitleContainer = styled(View)`
  background-color: ${THEME_COLOR};
  height: 54px;
  align-items: center;
  justify-content: center;
`;

const Title = styled(Text)`
  color: ${WHITE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: ${FONT_SIZE_MEDIUM};
`;
