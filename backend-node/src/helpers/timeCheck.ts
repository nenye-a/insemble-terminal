export function timeCheck(udpatedAt: Date, minute: number): boolean {
  let today = new Date().getTime();
  let renewUpdate = new Date(udpatedAt.getTime() + minute * 60000);
  if (today < renewUpdate.getTime()) {
    return false;
  }
  return true;
}
