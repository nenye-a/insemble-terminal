export function todayMinOneH(): Date {
  return new Date(new Date().getTime() - 60 * 60000);
}
