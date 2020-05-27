import React, { useState } from 'react';
import styled from 'styled-components';
import Popover from 'react-tiny-popover';

import { View, Text, TouchableOpacity } from '../../core-ui';
import { ComparisonPopover, PinPopover } from '../../components';
import { THEME_COLOR, DISABLED_TEXT_COLOR } from '../../constants/colors';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';
import SvgPin from '../../components/icons/pin';
import SvgRoundAdd from '../../components/icons/round-add';
import { ReviewTag } from '../../generated/globalTypes';

type Props = {
  title: string;
  noData?: boolean;
  reviewTag: ReviewTag;
  tableId: string;
};

export default function ResultTitle(props: Props) {
  let { title, noData = false, reviewTag, tableId } = props;
  let [comparisonPopoverOpen, setComparisonPopoverOpen] = useState(false);
  let [pinPopoverOpen, setPinPopoverOpen] = useState(false);

  let pinPopover = <PinPopover onClickAway={() => setPinPopoverOpen(false)} />;
  let comparisonPopover = (
    <ComparisonPopover reviewTag={reviewTag} tableId={tableId} />
  );
  return (
    <Container>
      <Title noData={noData}>{title}</Title>
      <Row>
        <Popover
          isOpen={comparisonPopoverOpen}
          content={comparisonPopover}
          position={['bottom']}
          onClickOutside={() => setComparisonPopoverOpen(false)}
          align="end"
        >
          {(ref) => (
            <Touchable ref={ref} onPress={() => setComparisonPopoverOpen(true)}>
              <SvgRoundAdd />
            </Touchable>
          )}
        </Popover>
        <Popover
          isOpen={pinPopoverOpen}
          content={pinPopover}
          position={['bottom']}
          onClickOutside={() => setPinPopoverOpen(false)}
          align="end"
          containerStyle={{ overflow: 'visible' }}
        >
          {(ref) => (
            <Touchable ref={ref} onPress={() => setPinPopoverOpen(true)}>
              <SvgPin />
            </Touchable>
          )}
        </Popover>
      </Row>
    </Container>
  );
}

type TitleProps = TextProps & {
  noData: boolean;
};
const Container = styled(View)`
  padding: 8px 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const Title = styled(Text)<TitleProps>`
  color: ${(props) => (props.noData ? DISABLED_TEXT_COLOR : THEME_COLOR)};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
`;

const Row = styled(View)`
  flex-direction: row;
`;

const Touchable = styled(TouchableOpacity)`
  margin-left: 12px;
  svg {
    color: ${THEME_COLOR};
    &:hover {
      opacity: 0.7;
    }
  }
`;
