import React, { useState } from 'react';
import styled from 'styled-components';
import Popover from 'react-tiny-popover';

import { Text, View, TouchableOpacity } from '../core-ui';
import { ReviewTag, LocationTagType } from '../generated/globalTypes';
import { THEME_COLOR, WHITE } from '../constants/colors';
import {
  FONT_SIZE_XLARGE,
  FONT_SIZE_MEDIUM,
  FONT_WEIGHT_MEDIUM,
} from '../constants/theme';
import { getResultTitle, useViewport } from '../helpers';
import { BusinessTagResult, LocationTag } from '../types/types';
import ManageTerminalModal from '../scenes/terminal/ManageTerminalModal';

import SvgShare from './icons/share';
import SvgEdit from './icons/edit';
import ShareTerminalPopover from './ShareTerminalPopover';

type Props = {
  reviewTag?: ReviewTag | null;
  businessTag?: BusinessTagResult | null;
  locationTag?: LocationTag | null;
  text?: string;
  showLocation?: boolean;
  terminalId?: string;
  rightText?: string;
};

export default function PageTitle(props: Props) {
  let {
    reviewTag,
    businessTag,
    locationTag,
    text,
    showLocation = true,
    terminalId,
    rightText,
  } = props;

  let [sharePopoverVisible, setSharePopoverVisible] = useState(false);
  let [editTerminalVisible, setEditTerminalVisible] = useState(false);

  let { isDesktop } = useViewport();

  let resultTitle = getResultTitle({
    reviewTag,
    businessTag: businessTag
      ? {
          params: businessTag.params,
          type: businessTag.type,
        }
      : undefined,
    locationTag: locationTag
      ? { params: locationTag.params, type: locationTag.type }
      : undefined,
  });

  let shareTerminalPopover = (
    <ShareTerminalPopover terminalId={terminalId || ''} />
  );

  return (
    <TitleContainer isDesktop={isDesktop}>
      <ManageTerminalModal
        mode="edit"
        visible={editTerminalVisible}
        onClose={() => {
          setEditTerminalVisible(false);
        }}
        terminalId={terminalId}
      />
      <Title isDesktop={isDesktop}>{text ? text : resultTitle}</Title>
      {!!terminalId && (
        <Row>
          <Touchable
            onPress={() => setEditTerminalVisible(true)}
            style={{ marginRight: 12 }}
          >
            <SvgEdit style={{ marginRight: 4 }} />
            <PurpleText>Edit Terminal</PurpleText>
          </Touchable>
          <Popover
            isOpen={sharePopoverVisible}
            content={shareTerminalPopover}
            position={['bottom']}
            onClickOutside={() => setSharePopoverVisible(false)}
            align="end"
          >
            {(ref) => (
              <Touchable ref={ref} onPress={() => setSharePopoverVisible(true)}>
                <SvgShare style={{ marginRight: 4 }} />
                <PurpleText>Share</PurpleText>
              </Touchable>
            )}
          </Popover>
        </Row>
      )}
      {rightText ? (
        <PurpleText>{rightText}</PurpleText>
      ) : showLocation &&
        (locationTag?.type === LocationTagType.NATION || !locationTag) ? (
        <PurpleText>All United States</PurpleText>
      ) : null}
    </TitleContainer>
  );
}

const Title = styled(Text)<TextProps & WithViewport>`
  color: ${THEME_COLOR};
  font-size: ${({ isDesktop }) =>
    isDesktop ? FONT_SIZE_XLARGE : FONT_SIZE_MEDIUM};
`;

const TitleContainer = styled(View)<ViewProps & WithViewport>`
  background-color: ${WHITE};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ isDesktop }) => (isDesktop ? `20px 15%` : `20px 18px`)};
`;

const PurpleText = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  color: ${THEME_COLOR};
`;

const Touchable = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;

const Row = styled(View)`
  flex-direction: row;
`;
