import React, { ReactNode, forwardRef, Ref } from 'react';
import styled from 'styled-components';

import { DEFAULT_BORDER_RADIUS } from '../constants/theme';
import { WHITE, SHADOW_COLOR } from '../constants/colors';

import View from './View';

export type CardProps = ViewProps & {
  children?: ReactNode;
};

export default forwardRef(
  (props: CardProps, forwardedRef: Ref<HTMLDivElement>) => {
    let { children, ...otherProps } = props;

    return (
      <StyledCard ref={forwardedRef} {...otherProps}>
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
