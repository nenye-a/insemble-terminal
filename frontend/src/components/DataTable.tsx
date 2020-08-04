import React, { ReactNode, useState } from 'react';
import styled, { css } from 'styled-components';
import Popover from 'react-tiny-popover';

import { View, Text, TouchableOpacity, Card } from '../core-ui';
import {
  WHITE,
  TABLE_HEADER_BACKGROUND,
  TABLE_BORDER_COLOR,
  DEFAULT_TEXT_COLOR,
  SHADOW_COLOR,
} from '../constants/colors';
import {
  FONT_SIZE_NORMAL,
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_SMALL,
} from '../constants/theme';
import { Direction } from '../types/types';
import { SortConfig } from '../helpers/useSortableData';
import { useViewport } from '../helpers';

import SvgQuestionMark from './icons/question-mark-round';

type Props = ViewProps & {
  children?: ReactNode;
};
type RowProps = ViewProps & {
  height?: string;
  onPress?: () => void;
};

type CellProps = ViewProps & {
  width?: number;
  align?: 'left' | 'right' | 'center';
};

type HeaderCellProps = CellProps & {
  children?: ReactNode;
  sortConfig?: SortConfig;
  infoboxContent?: ReactNode;
};

function DataTable({ children, ...otherProps }: Props) {
  let { isDesktop } = useViewport();
  return (
    <Container isDesktop={isDesktop} {...otherProps}>
      {children}
    </Container>
  );
}

function HeaderCell({
  children,
  sortConfig,
  name,
  infoboxContent,
  onClick,
  disabled,
  ...otherProps
}: HeaderCellProps) {
  let [popoverVisible, setPopoverVisible] = useState(false);
  let triangle =
    sortConfig && name === sortConfig.key
      ? sortConfig.direction === Direction.ASCENDING
        ? ' ▲'
        : ' ▼'
      : '';
  let infoboxPopover = <PopoverContainer>{infoboxContent}</PopoverContainer>;
  return (
    <Cell
      onClick={() => {
        if (!disabled) {
          onClick && onClick();
        }
      }}
      {...otherProps}
    >
      <RowedView>
        {infoboxContent && (
          <Popover
            isOpen={popoverVisible}
            content={infoboxPopover}
            position={['bottom']}
            onClickOutside={() => setPopoverVisible(false)}
            align="start"
          >
            {(ref) => (
              <View
                ref={ref}
                onMouseEnter={() => {
                  setPopoverVisible(true);
                }}
                onMouseLeave={() => {
                  setPopoverVisible(false);
                }}
                style={{ marginRight: 4 }}
              >
                <SvgQuestionMark />
              </View>
            )}
          </Popover>
        )}
        <HeaderCellText>
          {children}
          {triangle}
        </HeaderCellText>
      </RowedView>
    </Cell>
  );
}

function Row({ height, onPress, children, ...otherProps }: RowProps) {
  if (onPress) {
    return (
      <TouchableRow onPress={onPress} height={height} {...otherProps}>
        {children}
      </TouchableRow>
    );
  }
  return (
    <DefaultRow height={height} {...otherProps}>
      {children}
    </DefaultRow>
  );
}

let CellAlign = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

let TextAlign = {
  left: 'left',
  center: 'center',
  right: 'right',
};

const Container = styled(View)<WithViewport>`
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
  background-color: ${WHITE};
  border-radius: ${({ isDesktop }) => (isDesktop ? '2px' : '0px')};
  overflow: hidden;
`;

const Cell = styled(View)<CellProps>`
  ${({ width }) =>
    width &&
    css`
      width: ${width}px;
      max-width: ${width}px;
      min-width: ${width}px;
    `}
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ align }) => CellAlign[align || 'left']};
  text-align: ${({ align }) => TextAlign[align || 'left']};
  padding: 11px 18px;
  color: ${DEFAULT_TEXT_COLOR};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: ${FONT_SIZE_NORMAL};
  font-family: 'Avenir';
  ${({ onClick, disabled }) =>
    onClick &&
    !disabled &&
    css`
      cursor: pointer;
    `}
`;

let rowStyle = css`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-color: ${TABLE_BORDER_COLOR};
  &:last-of-type {
    border-color: transparent;
  }
`;

const DefaultRow = styled(View)<RowProps>`
  ${rowStyle};
  ${(props) =>
    props.height &&
    css`
      height: ${props.height};
    `};
`;

const TouchableRow = styled(TouchableOpacity)<RowProps>`
  ${rowStyle};
  ${(props) =>
    props.height &&
    css`
      height: ${props.height};
    `};
  &:hover {
    box-shadow: ${SHADOW_COLOR};
  }
`;

const HeaderRow = styled(DefaultRow)`
  background-color: ${TABLE_HEADER_BACKGROUND};
  height: 32px;
`;

const HeaderCellText = styled(Text)`
  color: ${WHITE};
  font-size: ${FONT_SIZE_SMALL};
`;

const Body = styled(View)`
  max-height: 490px;
  overflow-y: scroll;
`;

const PopoverContainer = styled(Card)`
  padding: 14px;
  max-width: 270px;
`;

const RowedView = styled(View)`
  flex-direction: row;
  align-items: center;
`;

DataTable.HeaderRow = HeaderRow;
DataTable.HeaderCell = HeaderCell;
DataTable.Row = Row;
DataTable.Cell = Cell;
DataTable.Body = Body;

export default DataTable;
