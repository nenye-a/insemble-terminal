import styled from 'styled-components';

import { FONT_SIZE_NORMAL, FONT_FAMILY_NORMAL } from '../constants/theme';
import { DEFAULT_TEXT_COLOR } from '../constants/colors';

type TextProps = ViewProps & {
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string | number;
};

// TODO: Not sure if we should change this to use styled.span
let Text = styled.div<TextProps>`
  box-sizing: border-box;
  display: inline;
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  border: 0 solid black;
  border-image: initial;
  color: ${(props) => (props.color ? props.color : DEFAULT_TEXT_COLOR)};
  font-size: ${(props) => (props.fontSize ? props.fontSize : FONT_SIZE_NORMAL)};
  font-family: ${(props) =>
    props.fontFamily ? props.fontFamily : FONT_FAMILY_NORMAL};
  font-weight: ${(props) => (props.fontWeight ? props.fontWeight : 'normal')};
`;

export default Text;
