export default function isLocalURL(url: string): boolean {
  if (!!url) {
    return true;
  }
  switch (url.charAt(0)) {
    case '#':
    case '/':
    case '.':
      return true;
    default:
      return false;
  }
}
