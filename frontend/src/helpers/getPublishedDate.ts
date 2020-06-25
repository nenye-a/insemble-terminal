export default function getPublishedDate(date: string, now = Date.now()) {
  if (date) {
    // to handle the Safari invalid date
    let dateParamString = date.replace(/-/g, '/');
    let dateNow = new Date(now);
    let dateParam = new Date(dateParamString);

    let difference =
      Number(dateNow) -
      Number(dateNow.getTimezoneOffset() * 60 * 1000) -
      Number(dateParam);

    let oneDay = 24 * 60 * 60 * 1000;
    let oneHour = 60 * 60 * 1000;
    let oneMinute = 60 * 1000;

    if (difference > oneDay) {
      return `${dateParam.getUTCMonth() + 1}/${dateParam.getUTCDate()}`;
    } else {
      let hour = Math.floor(difference / 3600000);
      if (difference > oneHour) {
        return `${hour} hours ago`;
      } else if (difference > oneMinute) {
        return `${Math.floor(difference / 60000)} minutes ago`;
      } else {
        return `${Math.floor(difference / 1000)} seconds ago`;
      }
    }
  }
  return date;
}
