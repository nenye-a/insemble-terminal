import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { View, Text, TouchableOpacity } from '../core-ui';
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

type Props = {
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
  children?: string | Array<string>;
  sortConfig?: SortConfig;
};

function DataTable(props: Props) {
  return <Container>{props.children}</Container>;
}

function HeaderCell({
  children,
  sortConfig,
  name,
  ...otherProps
}: HeaderCellProps) {
  let triangle =
    sortConfig && name === sortConfig.key
      ? sortConfig.direction === Direction.ASCENDING
        ? ' ▲'
        : ' ▼'
      : '';

  return (
    <Cell {...otherProps}>
      <HeaderCellText>
        {children}
        {triangle}
      </HeaderCellText>
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

const Container = styled(View)`
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
  background-color: ${WHITE};
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
  padding: 0 18px;
  color: ${DEFAULT_TEXT_COLOR};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  font-size: ${FONT_SIZE_NORMAL};
  font-family: 'Avenir';
  ${({ onClick }) =>
    onClick &&
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
  height: ${(props) => (props.height ? props.height : '40px')};
`;

const TouchableRow = styled(TouchableOpacity)<RowProps>`
  ${rowStyle};
  height: ${(props) => (props.height ? props.height : '40px')};
  &:hover {
    box-shadow: ${SHADOW_COLOR};
  }
`;

const HeaderRow = styled(DefaultRow)`
  background-color: ${TABLE_HEADER_BACKGROUND};
  height: 28px;
`;

const HeaderCellText = styled(Text)`
  color: ${WHITE};
  font-size: ${FONT_SIZE_SMALL};
`;

const Body = styled(View)`
  height: 350px;
  overflow-y: scroll;
`;

DataTable.HeaderRow = HeaderRow;
DataTable.HeaderCell = HeaderCell;
DataTable.Row = Row;
DataTable.Cell = Cell;
DataTable.Body = Body;

export default DataTable;
