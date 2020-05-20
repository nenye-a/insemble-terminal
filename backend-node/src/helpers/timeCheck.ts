export function timeCheck(udpatedAt: Date): boolean {
  let today = new Date().getTime();
  let minute = 15;
  let renewUpdate = new Date(udpatedAt.getTime() + minute * 60000);
  if (today < renewUpdate.getTime()) {
    return false;
  }
  return true;
}
