export default function isLocalURL(url: string): boolean {
  switch (url.charAt(0)) {
    case '#':
    case '/':
    case '.':
      return true;
    default:
      return false;
  }
}
