import React, { ReactNode, ComponentProps } from 'react';
import styled, { css } from 'styled-components';

import { View, Text } from '../core-ui';
import {
  WHITE,
  TABLE_HEADER_BACKGROUND,
  TABLE_BORDER_COLOR,
  DEFAULT_TEXT_COLOR,
} from '../constants/colors';
import { FONT_SIZE_NORMAL } from '../constants/theme';

type Props = {
  children?: ReactNode;
};
type RowProps = {
  height?: string;
};

type CellProps = ComponentProps<typeof View> & {
  width?: number;
  align?: 'left' | 'right' | 'center';
};

type HeaderCellProps = CellProps & {
  children?: string;
};

function DataTable(props: Props) {
  return <Container>{props.children}</Container>;
}

function HeaderCell({ children, ...otherProps }: HeaderCellProps) {
  return (
    <Cell {...otherProps}>
      <HeaderCellText>{children}</HeaderCellText>
    </Cell>
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
      max-width: ${width} + 'px';
      min-width: ${width} + 'px';
    `}
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ align }) => CellAlign[align || 'left']};
  padding: 0 24px;
  color: ${DEFAULT_TEXT_COLOR};
  font-size: ${FONT_SIZE_NORMAL};
  font-family: 'Avenir';
`;

const Row = styled(View)<RowProps>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: ${(props) => (props.height ? props.height : '40px')};
  border-bottom-width: 1px;
  border-color: ${TABLE_BORDER_COLOR};
  &:last-of-type {
    border-color: transparent;
  }
`;

const HeaderRow = styled(Row)`
  background-color: ${TABLE_HEADER_BACKGROUND};
  height: 28px;
`;

const HeaderCellText = styled(Text)`
  color: ${WHITE};
`;

DataTable.HeaderRow = HeaderRow;
DataTable.HeaderCell = HeaderCell;
DataTable.Row = Row;
DataTable.Cell = Cell;

export default DataTable;
