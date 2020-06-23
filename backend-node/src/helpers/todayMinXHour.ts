export function todayMinXHour(x: number): Date {
  return new Date(new Date().getTime() - x * 60 * 60000);
}
