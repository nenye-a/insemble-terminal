export function todayMinXHour(x: number): Date {
  /**
   * This function is for making the table updatedAt to become outdated.
   * The case this function will be used in when the table had an error.
   * This make timeCheck see table as outdated and flaging it to have update table again.
   */
  return new Date(new Date().getTime() - x * 60 * 60000);
}
