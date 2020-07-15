export function timeCheck(udpatedAt: Date, minute: number): boolean {
  /**
   * This function is for checking if the table are outdated or not.
   * The outdated factor is the minute, this determine how long is the table will update again
   * and the updatedAt is date which tell when the table are updated.
   */
  let today = new Date().getTime();
  let renewUpdate = new Date(udpatedAt.getTime() + minute * 60000);
  if (today < renewUpdate.getTime()) {
    return false;
  }
  return true;
}
