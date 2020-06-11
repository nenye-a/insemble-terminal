import { DEFAULT_TEXT_COLOR, WHITE } from '../constants/colors';

export default function getTextColor(hexColor: string) {
  let useHash = hexColor[0] === '#';
  let color = useHash ? hexColor.slice(1) : hexColor;
  let r = parseInt(color.substr(0, 2), 16);
  let g = parseInt(color.substr(2, 2), 16);
  let b = parseInt(color.substr(4, 2), 16);
  let yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? DEFAULT_TEXT_COLOR : WHITE;
}
