export default function lightenOrDarkenColor(hexColor: string, amt: number) {
  let useHash = hexColor[0] === '#';
  let color = useHash ? hexColor.slice(1) : hexColor;

  let num = parseInt(color, 16);

  let r = (num >> 16) + amt;

  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  let g = (num & 0x0000ff) + amt;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  return (useHash ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
}
